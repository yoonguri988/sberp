package com.sb.erp.sal.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여등록(산정) 요청.
 *
 * 관리자는 직원(empId)과 지급월(payMonth)만 지정한다. 기본급/수당/공제 항목은 전부
 * {@code SalaryCalculationService}가 급여기준(SalStd)·직책·정책 테이블을 근거로 자동 산정한다
 * (salary-calculation-engine-design.md 참고). 산정 결과는 대기(PENDING) 상태로 저장되며,
 * 필요 시 PATCH /api/salpay/{payId}/items/{itemId}로 개별 항목만 사유와 함께 조정할 수 있다.
 *
 * 2026-08-20 수정: 관리자가 수당/공제 금액을 직접 입력하던 items 필드를 제거했다(급여 산정 엔진 도입 이전의
 * 구식 요청 스펙 — register()는 이 필드를 애초에 사용하지 않았고, 검증(@NotEmpty)만 남아있어
 * 프론트가 쓰이지도 않는 값을 억지로 채워 보내야 했던 문제를 정리).
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPaymentCreateRequest {

    @NotNull(message = "직원 정보는 필수입니다.")
    private Long empId;

    @NotNull(message = "지급월은 필수입니다.")
    private LocalDate payMonth;
}
