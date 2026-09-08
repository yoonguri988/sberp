package com.sb.erp.global.security;
import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.sb.erp.apct.oauth2.ApplicantPrincipal;
import com.sb.erp.global.oauth2.CustomUserPrincipal;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

//보안게이트
/**
 * JWT 인증필터
 * - Authorization 헤더에서 Bearer 토큰추출
 * - JwtProvider로 Claims파싱
 * - CustomUserPincipal 기반   Pincipal 생성후 SecurityContext에 저장
 * - 토큰이 없거나 만료/무효해도 여기서 응답을 끝내지 않는다.
 *   (그냥 인증 안 된 상태로 다음 필터로 넘기고, 최종적으로 401/403 여부는
 *    SecurityConfig의 authenticationEntryPoint/accessDeniedHandler가 결정한다.
 *    /auth/** 같은 permitAll 경로는 이렇게 해야 막히지 않는다.)
 * */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	//JWT 토큰 발급/검증
    private final JwtProvider jwtProvider;

    public JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }
    
    // /home/ubuntu/app/back/build/libs/uploads/ 로 시작하는 요청은 JWT 필터 타지 않게 통과
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return path.startsWith("/home/ubuntu/app/back/build/libs/uploads/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtProvider.parse(token).getBody();  
                String type = claims.get("type", String.class); // "APPLICANT" or null(=사원)
                // subject  →  empId, comId, empEmail, role
                
                if ("APPLICANT".equals(type)) {
                    String providerId = claims.getSubject();
                    String provider = claims.get("provider", String.class);
                    String email = claims.get("email", String.class);

                    ApplicantPrincipal applicantPrincipal =
                            new ApplicantPrincipal(provider, providerId, email);

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    applicantPrincipal, null, applicantPrincipal.getAuthorities()
                            );
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    logger.debug("[Filter] SecurityContext에 지원자 인증 정보 저장 완료 (providerId=" + providerId + ")");

                } else {
                Long empId = Long.parseLong(claims.getSubject());
                Long comId = claims.get("comId", Long.class);
                String empEmail = claims.get("empEmail", String.class);

                // 로그인 시 발급한 토큰의 "roles"는 복수(리스트) 클레임 - "role" 단수 아님에 주의
                @SuppressWarnings("unchecked")
                List<String> roles = claims.get("roles", List.class);

                // 비밀번호가 아직 사번(임시 비밀번호) 상태인지 여부(로그인/refresh에서 발급한 클레임)
                Boolean pwdChangeRequired = claims.get("pwdChangeRequired", Boolean.class);

	            //CustomUserPincipal
                CustomUserPrincipal userPrincipal = new CustomUserPrincipal(
                        empId, comId, empEmail, roles, Boolean.TRUE.equals(pwdChangeRequired));

                 UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userPrincipal, null, userPrincipal.getAuthorities()
                 );

                 SecurityContextHolder.getContext().setAuthentication(auth);

                 logger.debug("[Filter] SecurityContext에 인증 정보 저장 완료 (empId=" + empId + ")");

                 // 비밀번호 변경이 강제된 사용자는 /auth/** (비밀번호 변경/재발급/로그아웃) 외의
                 // API는 호출하지 못하게 막는다. 프론트가 화면 이동을 놓치거나 사용자가 API를
                 // 직접 호출해도 우회할 수 없도록 하는 서버측 방어선.
                 if (userPrincipal.isPwdChangeRequired() && !request.getRequestURI().startsWith("/auth/")) {
                     SecurityContextHolder.clearContext();
                     response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                     response.setContentType("application/json;charset=UTF-8");
                     response.getWriter().write(
                             "{\"error\":\"PWD_CHANGE_REQUIRED\",\"message\":\"비밀번호를 변경해야 이용할 수 있습니다.\"}");
                     return;
                 }
                }
            } catch (ExpiredJwtException e) {
            	// 정상적으로 발생할 수 있는 상황(accessToken 만료) → 스택트레이스 없이 debug 로그만
            	logger.debug("[Filter] accessToken 만료: " + e.getMessage());
                SecurityContextHolder.clearContext();
            } catch (JwtException | IllegalArgumentException e) {
            	// 서명 위조, 형식 오류 등 실제 이상 케이스만 warn 로 남긴다
            	logger.warn("[Filter] 유효하지 않은 토큰: " + e.getMessage());
                SecurityContextHolder.clearContext();
            }
        } else { 
        	logger.debug("[Filter] Authorization 헤더가 누락되었거나 Bearer 형식이 아닙니다.");
        }

        chain.doFilter(request, response);
    }
}