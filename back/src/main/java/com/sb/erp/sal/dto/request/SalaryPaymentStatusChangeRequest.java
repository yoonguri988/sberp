package com.sb.erp.sal.dto.request;

import com.sb.erp.sal.entity.type.PaymentStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 급여상태변경 요청 
 * (대기→승인→지급완료, 대기→반려) 
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPaymentStatusChangeRequest {

    @NotNull(message = "변경할 상태는 필수입니다.")
    private PaymentStatus stat;

    private String rejRsn;
}
