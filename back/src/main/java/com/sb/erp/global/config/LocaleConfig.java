package com.sb.erp.global.config;

import java.util.Locale;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.LocaleResolver;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 프론트엔드가 이미 설정하고 있는 sberp_lang 쿠키("ko" / "en")를 읽어서
 * 요청 스레드의 Locale(LocaleContextHolder)을 결정한다.
 *
 * DispatcherServlet이 요청마다 이 LocaleResolver를 통해 LocaleContextHolder를
 * 자동으로 세팅해주므로, 별도 Filter/Interceptor 없이도
 * - GlobalExceptionHandler에서 MessageSource.getMessage(..., LocaleContextHolder.getLocale())
 * - Bean Validation(@NotBlank(message = "{key}") 등, spring-boot-starter-validation의
 *   LocalValidatorFactoryBean이 애플리케이션 MessageSource를 자동으로 사용)
 * 양쪽 모두 같은 로케일을 참조하게 된다.
 *
 * 쿠키가 없거나 값이 ko/en이 아닌 경우 기본 로케일(한국어)로 동작한다.
 *
 * (spring-webmvc가 제공하는 CookieLocaleResolver는 버전에 따라 세터 API가 자주 바뀌어서
 * (예: setCookieName(String)이 특정 버전에서 사라짐) 그 API에 의존하지 않고, LocaleResolver
 * 인터페이스만 직접 구현했다 — 이 인터페이스는 스프링 초기 버전부터 시그니처가 바뀐 적이 없다.)
 */
@Configuration
public class LocaleConfig {

    public static final String LANG_COOKIE_NAME = "sberp_lang";
    private static final Locale DEFAULT_LOCALE = Locale.KOREAN;

    @Bean
    public LocaleResolver localeResolver() {
        return new LocaleResolver() {

            @Override
            public Locale resolveLocale(HttpServletRequest request) {
                Cookie[] cookies = request.getCookies();
                if (cookies != null) {
                    for (Cookie cookie : cookies) {
                        if (LANG_COOKIE_NAME.equals(cookie.getName())) {
                            String value = cookie.getValue();
                            if ("en".equalsIgnoreCase(value)) {
                                return Locale.ENGLISH;
                            }
                            if ("ko".equalsIgnoreCase(value)) {
                                return Locale.KOREAN;
                            }
                            break;
                        }
                    }
                }
                return DEFAULT_LOCALE;
            }

            @Override
            public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
                // sberp_lang 쿠키는 프론트엔드가 직접 쓰고 관리한다(백엔드가 응답 쿠키로 덮어쓰지 않음).
                // AcceptHeaderLocaleResolver 등 스프링 기본 리졸버들도 서버 측 변경을 지원하지 않을 때
                // 동일하게 예외를 던진다.
                throw new UnsupportedOperationException(
                        "Cannot change locale via " + getClass().getSimpleName()
                                + " - locale is controlled by the sberp_lang cookie set by the frontend");
            }
        };
    }
}
