package com.sb.erp.sal.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여 산정 결과 개별 항목 수동 조정 요청 (PATCH /api/salpay/{payId}/items/{itemId}).
 *
 * 대기(PENDING) 상태의 급여 건에서만 허용된다. 사유(reason)를 필수로 강제해 투명성을 확보한다
 * (salary-calculation-engine-design.md "관리자 수동 조정 정책" 참고). SalHist에 chgType=MANUAL_ADJUST로
 * "자동 산정값 X원 -> 관리자 조정값 Y원, 사유: ..." 형태로 기록된다.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPaymentItemAdjustRequest {

    @NotNull(message = "조정할 금액은 필수입니다.")
    @PositiveOrZero(message = "금액은 0 이상이어야 합니다.")
    private Long amt;

    @NotBlank(message = "조정 사유는 필수입니다.")
    private String reason;
}
