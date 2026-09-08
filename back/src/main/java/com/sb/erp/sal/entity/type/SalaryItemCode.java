package com.sb.erp.sal.entity.type;

/**
 * 급여 수당/공제 세부 항목의 "사전 정의된" 코드 목록 (미리 값을 넣어놓고 선택해서 쓰는 카탈로그).
 *
 * 관리자가 항목명을 자유 텍스트로 입력하지 않고, 이 목록 중에서 골라서 금액만 입력하는 방식이다.
 * 실제 급여명세서(급여명세서_예시.png)에 나온 항목 중 MVP 단계에 꼭 필요한 것만 우선 추렸다(9개).
 * 나중에 항목을 늘리고 싶으면 여기에 enum 값 하나만 추가하면 된다(DB 스키마 변경 불필요 — ITEM_CODE는 문자열 컬럼).
 *
 * 제외한 항목과 이유는 README.md의 "수당/공제 항목 선정 기준" 참고.
 */
public enum SalaryItemCode {

    // ── 수당(ALLOWANCE) ──
    MEAL_ALLOWANCE(PaymentItemType.ALLOWANCE, "식대"),
    POSITION_ALLOWANCE(PaymentItemType.ALLOWANCE, "직책수당"),
    ANNUAL_LEAVE_ALLOWANCE(PaymentItemType.ALLOWANCE, "연차수당"),
    // 근태(ATTENDANCE) 모듈의 overtime_minutes/night_minutes를 기준으로 향후 자동 계산 연동 예정.
    // 계산 로직은 근태 모듈 완성 후 확정하되, 코드값은 미리 카탈로그에 넣어둔다(2026-08-20 결정).
    OVERTIME_ALLOWANCE(PaymentItemType.ALLOWANCE, "고정연장수당"),

    // ── 공제(DEDUCTION) - 4대보험 + 세금(법정 공제이므로 사실상 필수) ──
    NATIONAL_PENSION(PaymentItemType.DEDUCTION, "국민연금"),
    HEALTH_INSURANCE(PaymentItemType.DEDUCTION, "건강보험"),
    LONG_TERM_CARE_INSURANCE(PaymentItemType.DEDUCTION, "장기요양보험료"),
    EMPLOYMENT_INSURANCE(PaymentItemType.DEDUCTION, "고용보험"),
    INCOME_TAX(PaymentItemType.DEDUCTION, "소득세"),
    LOCAL_INCOME_TAX(PaymentItemType.DEDUCTION, "지방소득세");

    private final PaymentItemType itemType;
    private final String displayName;

    SalaryItemCode(PaymentItemType itemType, String displayName) {
        this.itemType = itemType;
        this.displayName = displayName;
    }

    public PaymentItemType getItemType() {
        return itemType;
    }

    public String getDisplayName() {
        return displayName;
    }
}
