package com.sb.erp.sal.calc;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 급여 산정 공통 유틸 - 원 단위 반올림(절사) 규칙.
 *
 * 4대보험료/소득세 계산은 실무 관행상 원 단위 절사(버림)를 기본으로 한다(공단 고지서도 절사 방식 사용).
 * 소수점 이하는 항상 버리고 Long으로 변환한다(design.md "원 단위 반올림 규칙(확정)" 참고).
 */
public final class SalaryCalculationSupport {

    /** 월 소정근로시간(통상임금 산정 기준, 근로기준법 통상 관행). 시급/일급 계산의 공통 분모다. */
    private static final BigDecimal MONTHLY_STANDARD_HOURS = BigDecimal.valueOf(209);

    /** 1일 소정근로시간(통상 8시간). 일급 = 시급 x 이 값. */
    private static final BigDecimal DAILY_STANDARD_HOURS = BigDecimal.valueOf(8);

    private SalaryCalculationSupport() {
    }

    /**
     * 통상시급 = baseSal / 209(월 소정근로시간). 연장수당/연차수당 계산의 공통 기준값이다.
     * 최종 truncate는 이 값이 아니라 이 값을 사용해 계산된 "최종 금액"에서 한 번만 수행한다
     * (중간 단계에서 절사를 반복하면 절사 오차가 누적되므로, scale은 넉넉히 주고 버림 오차만 방지한다).
     */
    public static BigDecimal hourlyWage(Long baseSal, int scale) {
        if (baseSal == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(baseSal).divide(MONTHLY_STANDARD_HOURS, scale, RoundingMode.DOWN);
    }

    /** 통상일급 = 통상시급 x 8시간(연차수당 계산 기준값). */
    public static BigDecimal dailyWage(Long baseSal, int scale) {
        return hourlyWage(baseSal, scale).multiply(DAILY_STANDARD_HOURS);
    }

    /** baseSal x rate 를 계산한 뒤 원 단위 절사(버림)하여 Long으로 반환한다. */
    public static Long applyRateAndTruncate(Long base, BigDecimal rate) {
        if (base == null || rate == null) {
            return 0L;
        }
        return truncate(BigDecimal.valueOf(base).multiply(rate));
    }

    /** 이미 계산된 금액에 다시 비율을 곱해서 절사한다(예: 장기요양보험료 = 건강보험료(절사된 값) x careRate). */
    public static Long applyRateAndTruncate(BigDecimal base, BigDecimal rate) {
        if (base == null || rate == null) {
            return 0L;
        }
        return truncate(base.multiply(rate));
    }

    /** BigDecimal 값을 소수점 이하 절사(버림)하여 Long으로 변환한다. */
    public static Long truncate(BigDecimal value) {
        if (value == null) {
            return 0L;
        }
        return value.setScale(0, RoundingMode.DOWN).longValueExact();
    }
}
