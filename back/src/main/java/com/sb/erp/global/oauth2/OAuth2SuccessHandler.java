package com.sb.erp.global.oauth2;

import java.io.IOException;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.sb.erp.auth.dto.response.AuthResponse;
import com.sb.erp.auth.dto.response.AuthUserResponse;
import com.sb.erp.auth.service.AuthService;
import com.sb.erp.global.security.JwtProperties;
import com.sb.erp.global.security.JwtProvider;
import com.sb.erp.global.security.TokenStore;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {
	private final AuthService authService;
	private final JwtProvider jwtProvider; // JWT 토큰 발급/검증
	private final TokenStore tokenStore; // REDIS - JWT 저장소
	private final JwtProperties props; // JWT 토큰

	@Value("${app.oauth2.redirect-url}")
	private String redirectUrl;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException {
		OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
		Map<String, Object> attrs = oAuth2User.getAttributes();

		String empEmail = (String) attrs.get("username");
		
		try {
			AuthUserResponse user = authService.readAuth(empEmail);
			
			String access = jwtProvider.createAccessToken(
					String.valueOf(user.getEmpId()), 
					Map.of("comId", user.getComId(),
							"empNo", user.getEmpNo(),
							"empName", user.getEmpName(),
							"posName", user.getPosName(), 
							"comName", user.getComName(), 
							"empEmail", user.getEmpEmail(),
							"roles", user.getAuthList().stream().map(AuthResponse::getAutName).toList()
							));
			String refresh = jwtProvider.createRefreshToken(String.valueOf(user.getEmpId()));
			// redis 저장
			tokenStore.saveRefreshToken(String.valueOf(user.getEmpId()), refresh, (long) props.getRefreshTokenExpSeconds());
			
			// Step3) refreshToken 을 쿠키로 설정
			Cookie refreshCookie = new Cookie("refreshToken", refresh);
			refreshCookie.setHttpOnly(true);
			boolean isLocal = request.getServerName().equals("localhost") || request.getServerName().equals("127.0.0.1");
			refreshCookie.setSecure(!isLocal);
			refreshCookie.setPath("/");
			refreshCookie.setMaxAge((int) props.getRefreshTokenExpSeconds());
			response.addCookie(refreshCookie);
			
			// Step4) redirectUrl (리액트 경로) accessToken= 전달
			String targetUrl = redirectUrl + "?accessToken=" + access;
			response.sendRedirect(targetUrl);
			
		} catch (Exception e) {
			// 로그인 실패 - 프론트 실패 페이지로 리다이렉트
			String failUrl = redirectUrl + "?error=true";
			response.sendRedirect(failUrl);
		}
	}
}
