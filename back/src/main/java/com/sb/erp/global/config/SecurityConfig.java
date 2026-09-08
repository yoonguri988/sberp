package com.sb.erp.global.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.sb.erp.apct.oauth2.ApplicantOAuth2SuccessHandler;
import com.sb.erp.apct.oauth2.ApplicantOAuth2UserService;
import com.sb.erp.global.security.JwtAuthenticationFilter;
import com.sb.erp.global.security.JwtProvider;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    // ────cdy────
    private final ApplicantOAuth2UserService applicantOAuth2UserService;
    private final ApplicantOAuth2SuccessHandler applicantOAuth2SuccessHandler;
    // ────cdy────
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
	        .csrf(csrf -> csrf.disable())
	        .formLogin(form -> form.disable())
	        .httpBasic(basic -> basic.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // 세션 설정
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // JWT 전용 stateless API이므로 anonymous 인증을 비활성화한다.
            // (비활성화하지 않으면 Spring Security가 인증 안 된 요청에도 항상 익명
            //  Authentication을 채워 넣어서, /api/** 의 .authenticated() 실패가
            //  전부 AccessDeniedException(→ accessDeniedHandler, 403)으로만 처리되고
            //  authenticationEntryPoint(401)가 절대 호출되지 않는다.
            //  프론트 axios 인터셉터는 401을 봐야 refreshToken 재발급을 시도하므로
            //  "토큰 없음/만료/무효"는 반드시 401로 떨어져야 한다.)
            .anonymous(AbstractHttpConfigurer::disable)
            // 권한 설정
            .authorizeHttpRequests(auth -> auth
            	//Swagger 인증관련경로 권한 설정
            	.requestMatchers(
                "/auth/**", "/login/**", "/oauth2/**",
                "/swagger-ui/**", "/v3/api-docs/**",
                "/swagger-resources/**", "/webjars/**", 
                "/configuration/**", "/home/ubuntu/app/back/build/libs/uploadss/**"  , "/api/deptusers/**" , "/api/likes/**",
                "/css/**", "/js/**", "/images/**"
                ).permitAll()
            	// TODO: 나중에 자기 영역 확인 후 채워 넣어야 함
                // ─── 정적 리소스 + 인증 관련 ───────────
//                .requestMatchers("/css/**", "/js/**", "/images/**",
//                        "/auth/login", "/auth/confirm",
//                        "/auth/resetPass", "/auth/forgotResetPass", "/auth/updatePass").permitAll()
                // JWT 발급 전용 로그인(외부/모바일)
//                .requestMatchers("/api/auth/login").permitAll()
                // ─── ROOT 전용 ────────────────────────
//                .requestMatchers("/root/**").hasAuthority("ROOT")
                // ─── ADMIN 이상 ───────────────────────
//                .requestMatchers("/admin/**").hasAnyAuthority("ROOT", "ROLE_ADMIN")
                // ─── 로그인만 하면 접근 가능 ───────────
//                .requestMatchers("/", "/emp/list", "/emp/detail", "/emp/edit",
//                        "/emp/editPass", "/com/**", "/dept/**", "/appr/**", "/res/**", "/resv/**",
//                        "/proj/**", "/notice/**", "/eval/report/detail", "/eval/report/my", "/report/**",
//                        "/upload/**").authenticated()
                // ─── 사원/직급/권한/평가 관리 (ADMIN 전용) ────
//                .requestMatchers("/emp/add", "/emp/resetPass", "/emp/checkEmail", "/emp/checkMobile",
//                        "/emp/checkEmpNo", "/perm/**", "/pos/**", "/dept/transfer/pending",
//                        "/dept/transfer/list", "/dept/transfer/log", "/eval/**").hasRole("ADMIN")
                // ─── 그 외 API: 세션 또는 JWT 둘 중 하나로 인증 ───
            	// 소셜)채용공고 지원자용
            	.requestMatchers(HttpMethod.GET,"/api/public/recruit", "/api/public/recruit/**").authenticated()
            	.requestMatchers("/api/public/applicant/**").authenticated()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(ex -> ex
                // 인증 자체가 안 된 경우(토큰 없음/만료/무효) → 401 JSON
                // 프론트 axios 인터셉터가 이 401을 보고 refreshToken으로 accessToken 재발급을 시도한다.
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"UNAUTHORIZED\"}");
                })
                // 인증은 됐지만 권한이 부족한 경우 → 403 JSON
                // (기존의 세션 attribute + sendRedirect는 stateless JSON API에 맞지 않아 제거)
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    //response.getWriter().write("{\"error\":\"FORBIDDEN\"}");
                    response.getWriter().write(
                            "{\"error\":\"FORBIDDEN\",\"message\":\"접근 권한이 없습니다.\"}"
                        );
                })
            )
            .oauth2Login(oauth2 -> oauth2
            	    .userInfoEndpoint(userInfo -> userInfo.userService(applicantOAuth2UserService))
            	    .successHandler(applicantOAuth2SuccessHandler)
        	)
            // 시큐리티 체인 안에서 동작
            .addFilterBefore(new JwtAuthenticationFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
 
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:3000",       // React 개발 서버
            "http://localhost:*",          // 로컬에서 뜨는 다른 포트들 (Flutter Web 등)
            "http://43.200.171.91"     // 배포된 도메인 (필요시 추가)
        ));

        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); //
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}