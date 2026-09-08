package com.sb.erp.global.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

// 로그인 시도 제한(계정 잠금) 설정
// application.yml의 security.login-lockout.* 과 매핑된다.
@Data
@Configuration
@ConfigurationProperties(prefix = "security.login-lockout")
public class LoginLockoutProperties {

    // 아래 windowMinutes(분) 동안 이 횟수 이상 로그인 실패 시, 그 이후 시도를 일시적으로 차단한다.
    private int maxAttempts = 5;

    // 실패 횟수를 집계하는 기준 시간(분). 예: 15분 내 5회 실패 시 잠금.
    private int windowMinutes = 15;
}
