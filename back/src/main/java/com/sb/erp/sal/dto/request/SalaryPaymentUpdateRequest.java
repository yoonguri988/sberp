package com.sb.erp.sal.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 7-4 급여 재산정 요청 (대기 상태 건만 가능).
 *
 * 관리자가 수당/공제 금액을 자유롭게 갈아끼우던 기존 방식(items 전체 재입력)을 제거했다 — 그 방식은
 * 개별 항목 조정과 달리 사유(reason) 입력을 강제하지 않아 계산 엔진을 완전히 우회하는 경로가 됐고,
 * "공제는 시스템이 계산하고 관리자는 수정만 한다"는 원칙(salary-calculation-engine-design.md)과 어긋났다.
 *
 * 대신 이 API는 SalaryCalculationService를 다시 호출해 산정 결과를 갱신한다(예: 급여기준(SalStd)이
 * Draft 생성 이후 바뀐 경우). reason은 선택 입력이며, 남기면 SalHist 기록에 함께 남는다.
 * 개별 항목 하나만 근거를 남기며 조정하려면 PATCH /api/salpay/{payId}/items/{itemId}를 사용한다.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPaymentUpdateRequest {

    private String reason;
}
