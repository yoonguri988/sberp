package com.sb.erp.sal.entity.type;

/** 급여 변경이력이 어느 도메인 엔티티에 대한 변경인지 구분 */
public enum ChangeDomainType {
    SALARY_STANDARD, // 급여기준
    SALARY_PAYMENT,  // 급여지급
    SALARY_ACCOUNT   // 급여 계좌(수령 계좌)
}
