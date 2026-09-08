package com.sb.erp.auth.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.dto.request.ConfirmRequest;
import com.sb.erp.auth.dto.request.LoginRequest;
import com.sb.erp.auth.dto.request.UpdatePassRequest;
import com.sb.erp.auth.dto.response.AuthResponse;
import com.sb.erp.auth.dto.response.AuthUserResponse;
import com.sb.erp.auth.service.AuthService;
import com.sb.erp.auth.service.LoginHistoryService;
import com.sb.erp.com.service.CompanyService;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.service.EmailService;
import com.sb.erp.emp.service.EmpService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.global.security.JwtProperties;
import com.sb.erp.global.security.JwtProvider;
import com.sb.erp.global.security.LoginLockoutProperties;
import com.sb.erp.global.security.PasswordPolicy;
import com.sb.erp.global.security.TokenStore;

import io.jsonwebtoken.Claims;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Tag(name="Auth REST API", description = "회원인증 및 관리 관련 API")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
	@Value("${app.cookie.secure:false}")
	private boolean cookieSecure;

	@Value("${app.cookie.same-site:Lax}")
	private String cookieSameSite;

	// 비밀번호 재설정 메일 링크 생성에 사용되는 프론트엔드 기본 URL
	@Value("${app.front.url:http://localhost:3000}")
	private String frontUrl;

	private final JwtProperties props;      // JWT 출입증 (설정값)
	private final JwtProvider jwtProvider;  // JWT 토근생성/검증 ( access Token / refresh Token )
	private final TokenStore tokenStore;	// JMT 저장소
	private final PasswordEncoder passEncoder;
	private final LoginHistoryService loginHistoryService; // 로그인 성공/실패 이력 기록
	private final LoginLockoutProperties lockoutProps;      // 로그인 시도 제한(계정 잠금) 설정
	
	@Autowired AuthService service;
	@Autowired EmpService empService;
	@Autowired CompanyService comService;
	@Autowired EmailService emailService;

	@Operation(summary = "로그인", description = "Access Token 발급 + Refresh Token은 HttpOnly 쿠키로 저장")
    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest dto,
	            HttpServletRequest request,
	            HttpServletResponse response) {

	String clientIp = extractClientIp(request);
	String userAgent = request.getHeader("User-Agent");

	// 로그인 시도 제한(계정 잠금): 최근 N분 내 이 이메일로 M회 이상 실패했으면
	// 비밀번호 검증 자체를 시도하지 않고 즉시 차단한다 (무차별 대입 공격 방어).
	// 이 차단 시도 자체는 LoginHistory에 남기지 않는다 - 이미 쌓인 실패 이력으로 판단하는 것이라
	// 여기서 추가로 남기면 잠금이 계속 연장되는 효과가 생겨 정상 사용자가 더 오래 묶일 수 있다.
	long recentFailures = loginHistoryService.countRecentFailures(dto.getEmpEmail(), lockoutProps.getWindowMinutes());
	if (recentFailures >= lockoutProps.getMaxAttempts()) {
		return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
		.body(Map.of("error", "로그인 시도가 너무 많습니다. " + lockoutProps.getWindowMinutes() + "분 후 다시 시도해주세요."));
	}

	// readAuth는 사원이 없으면 예외를 던진다(IllegalArgumentException).
	// 로그인 이력을 성공/실패 구분 없이 항상 남기고, 존재 여부와 무관하게 동일한
	// 401 메시지를 응답해 계정 존재 여부가 노출(사용자 열거 공격)되지 않도록 한다.
	AuthUserResponse user;
	try {
		user = service.readAuth(dto.getEmpEmail());
	} catch (Exception e) {
		loginHistoryService.recordFailure(dto.getEmpEmail(), "존재하지 않는 계정", clientIp, userAgent);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
		.body(Map.of("error", "이메일 또는 비밀번호가 올바르지 않습니다."));
	}

	// emp_pass는 readAuth 쿼리에 emp_pass 컬럼 추가 후에만 채워짐 (auth-mapper.xml 참고)
	if (user == null || user.getEmpPass() == null
	|| !passEncoder.matches(dto.getEmpPass(), user.getEmpPass())) {
		loginHistoryService.recordFailure(dto.getEmpEmail(), "비밀번호 불일치", clientIp, userAgent);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
		.body(Map.of("error", "이메일 또는 비밀번호가 올바르지 않습니다."));
	}

	String access = jwtProvider.createAccessToken(
	String.valueOf(user.getEmpId()),
	Map.of("comId", user.getComId(),
			"empNo", user.getEmpNo(),
			"empName", user.getEmpName(),
			"posName", user.getPosName(),
			"comName", user.getComName(),
			"empEmail", user.getEmpEmail(),
			"roles", user.getAuthList().stream().map(AuthResponse::getAutName).toList(),
			// 비밀번호가 아직 사번(임시 비밀번호)인 상태 → 프론트가 비밀번호 변경 화면으로 보내야 함.
			// JwtAuthenticationFilter도 이 클레임을 보고 /auth/** 외 API 접근을 막는다.
			"pwdChangeRequired", user.isMustChangePwd())
	);

	String refresh = jwtProvider.createRefreshToken(String.valueOf(user.getEmpId()));
	tokenStore.saveRefreshToken(
			String.valueOf(user.getEmpId()), refresh,
			(long) props.getRefreshTokenExpSeconds()
	);

	 response.addHeader(HttpHeaders.SET_COOKIE,
             buildRefreshCookie(refresh, props.getRefreshTokenExpSeconds()).toString());

	 loginHistoryService.recordSuccess(user.getEmpId(), user.getEmpEmail(), user.getEmpName(), clientIp, userAgent);

	return ResponseEntity.ok(Map.of(
			"accessToken", access,
			"empId", user.getEmpId(),
			"comId", user.getComId(),
			// 프론트가 JWT를 디코딩하지 않고도 바로 분기할 수 있도록 응답 바디에도 노출
			"pwdChangeRequired", user.isMustChangePwd()
		));
	}
	
	@Operation(summary = "로그아웃", description = "Redis에서 refreshToken 삭제 + 쿠키 만료")
	@PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(Authentication authentication,
                                                        HttpServletResponse response) {
        if (authentication != null) {
            CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
            tokenStore.deleteRefreshToken(String.valueOf(principal.getEmpId()));
        }
        response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie("", 0).toString()); // 즉시 만료
        return ResponseEntity.ok(Map.of("state", "OK"));
    }
	
	
    @Operation(summary = "Access Token 재발급")
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@CookieValue("refreshToken") String refreshToken) {
        var claims = jwtProvider.parse(refreshToken).getBody();
        String empId = claims.getSubject();

        String stored = tokenStore.getRefreshToken(empId);
        if (stored == null || !stored.equals(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid refresh token"));
        }

        // roles만 넣으면 재발급된 accessToken에서 comId/empName/comName/empEmail 등이
        // 빠져버려 프론트(decodeUser)가 로그인 직후와 다른(껍데기) user 객체를 만들게 된다.
        // login()과 동일한 클레임 구성을 쓰도록 이메일/사번 등 전체 정보를 다시 조회한다.
        AuthUserResponse user = service.readAuthByEmpId(Long.parseLong(empId));

        String newAccessToken = jwtProvider.createAccessToken(
                empId,
                Map.of("comId", user.getComId(),
                        "empNo", user.getEmpNo(),
                        "empName", user.getEmpName(),
                        "posName", user.getPosName(),
                        "comName", user.getComName(),
                        "empEmail", user.getEmpEmail(),
                        "roles", user.getAuthList().stream().map(AuthResponse::getAutName).toList(),
                        "pwdChangeRequired", user.isMustChangePwd())
        );

        return ResponseEntity.ok(Map.of(
                "accessToken", newAccessToken,
                "pwdChangeRequired", user.isMustChangePwd()
        ));
    }
	
	
    // 비밀번호를 변경하려는 사용자가 실제로 존재하는지 확인
    // 세션 대신 짧은 유효기간의 resetToken(JWT)을 발급하되, 더 이상 클라이언트에 직접 내려주지
    // 않고 본인이 등록한 이메일로 재설정 링크를 발송한다(요구사항 3. Gmail SMTP 기반 발송).
    @Operation(summary = "비밀번호 재설정 - 본인확인", description = "본인 확인 성공 시 등록된 이메일로 10분짜리 재설정 링크 발송")
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirm(@RequestBody ConfirmRequest request) {

    	EmpRequest dto = new EmpRequest();
    	dto.setEmpNo(request.getEmpNo());
    	dto.setEmpEmail(request.getEmpEmail());
    	dto.setEmpMobile(request.getEmpMobile());

        EmpResponse emp = empService.selectForVerify(dto);
        if (emp == null) {
            return ResponseEntity.ok(Map.of("state", "FAIL"));
        }

        String resetToken = jwtProvider.createResetToken(String.valueOf(emp.getEmpId()));
        String resetLink = frontUrl + "/auth/forgotResetPass?token=" + resetToken;
        emailService.sendPasswordResetMailAsync(emp, resetLink);

        // resetToken은 더 이상 응답 바디로 노출하지 않는다 - 이메일을 받은 사람만 재설정 가능
        return ResponseEntity.ok(Map.of("state", "OK"));
    }
    
    // 비밀번호 재설정 (비로그인, resetToken 기반)
    @Operation(summary = "비밀번호 재설정", description = "confirm에서 발급받은 resetToken으로 본인 확인 후 비밀번호 변경")
    @PostMapping("/updatePass")
    public ResponseEntity<Map<String, String>> updatePass(@RequestBody UpdatePassRequest dto) {
        Claims claims;
        try {
            claims = jwtProvider.parse(dto.getResetToken()).getBody();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "유효하지 않거나 만료된 요청입니다. 본인확인을 다시 진행해주세요."));
        }
 
        if (!"reset".equals(claims.get("purpose", String.class))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "잘못된 토큰입니다."));
        }
 
        Long empId = Long.valueOf(claims.getSubject());

        // 비밀번호 정책 검증 (8자 이상 + 영문/숫자/특수문자 조합) - 위반 시 IllegalArgumentException → 400
        PasswordPolicy.validate(dto.getNewPass());

        EmpRequest patch = new EmpRequest();
        patch.setEmpId(empId);
        patch.setEmpPass(passEncoder.encode(dto.getNewPass()));
        empService.updatePassByEmpIdOnly(patch);

        return ResponseEntity.ok(Map.of("state", "OK"));
    }

    // 비밀번호 변경 (로그인 상태, JWT 인증 사용자 본인)
    @Operation(summary = "비밀번호 변경(로그인 상태)")
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication authentication,
                                                                @RequestBody UpdatePassRequest dto) {
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        // 비밀번호 정책 검증 (8자 이상 + 영문/숫자/특수문자 조합)
        PasswordPolicy.validate(dto.getNewPass());

        EmpRequest patch = new EmpRequest();
        patch.setEmpId(principal.getEmpId());
        patch.setEmpPass(passEncoder.encode(dto.getNewPass()));
        empService.updatePassByEmpIdOnly(patch);

        return ResponseEntity.ok(Map.of("state", "OK"));
    }
	
    // 공통
    // 리버스 프록시(Nginx 등) 뒤에 있는 경우 X-Forwarded-For의 첫 번째 IP가 실제 클라이언트 IP
    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    // secure(true) + sameSite("Strict") -> https:// 로 접속해야 브라우저가 쿠키 저장
    private ResponseCookie buildRefreshCookie(String value, int maxAgeSeconds) {
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
    }
}