package com.sb.erp.sal.entity.type;

/**
 * 급여 지급 상태
 * 대기(PENDING)->승인(APPROVED) ->지급완료(PAID)
 *                           L->반려(REJECTED)
 */
public enum PaymentStatus {
    PENDING,   // 대기
    APPROVED,  // 승인
    PAID,      // 지급완료
    REJECTED   // 반려
}
