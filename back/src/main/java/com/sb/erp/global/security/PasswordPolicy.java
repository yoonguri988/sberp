package com.sb.erp.global.security;

import java.util.regex.Pattern;

/**
 * 비밀번호 정책 (비밀번호 정책 & 세션 만료)
 * - 최소 8자 이상
 * - 영문 + 숫자 + 특수문자 조합 모두 필수
 *
 * 회원가입(사원 등록)은 초기 비밀번호를 사번으로 자동 설정하므로 이 정책 대상이 아니며,
 * 사용자가 직접 새 비밀번호를 입력하는 모든 지점(비밀번호 변경, 비밀번호 재설정)에서
 * PasswordPolicy.validate(...)를 호출해 검증한다.
 *
 * 검증 실패 시 IllegalArgumentException을 던지며, GlobalExceptionHandler가
 * 이를 400 Bad Request + {"error": message} 형태로 변환한다.
 */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 8;

    private static final Pattern HAS_LETTER  = Pattern.compile("[A-Za-z]");
    private static final Pattern HAS_DIGIT   = Pattern.compile("[0-9]");
    private static final Pattern HAS_SPECIAL = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?~`]");

    private PasswordPolicy() {}

    /**
     * 비밀번호가 정책을 만족하는지 검증한다. 위반 시 예외를 던진다.
     */
    public static void validate(String password) {
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("새 비밀번호를 입력해주세요.");
        }
        if (password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException("비밀번호는 " + MIN_LENGTH + "자 이상이어야 합니다.");
        }
        if (!HAS_LETTER.matcher(password).find()) {
            throw new IllegalArgumentException("비밀번호에 영문을 포함해주세요.");
        }
        if (!HAS_DIGIT.matcher(password).find()) {
            throw new IllegalArgumentException("비밀번호에 숫자를 포함해주세요.");
        }
        if (!HAS_SPECIAL.matcher(password).find()) {
            throw new IllegalArgumentException("비밀번호에 특수문자를 포함해주세요.");
        }
    }

    /**
     * 예외 없이 boolean으로 결과만 필요할 때 사용.
     */
    public static boolean isValid(String password) {
        try {
            validate(password);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
