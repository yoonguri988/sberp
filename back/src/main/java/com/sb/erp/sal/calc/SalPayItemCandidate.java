package com.sb.erp.sal.calc;

import com.sb.erp.sal.entity.type.SalaryItemCode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여 산정 엔진이 계산한 단일 수당/공제 항목의 산정 결과.
 *
 * calcBasis: 계산 근거를 문자열로 남겨 SalHist descr 또는 화면 툴팁에 노출한다(감사 대응 취지).
 * 예) "baseSal 3,000,000 x pensionRate 0.0450 = 135,000원 (원단위 절사)"
 *
 * (salary-calculation-engine-design.md "계산 로직 설계 - 인터페이스" 참고)
 *
 * 2026-08-20 수정: 프로젝트 전반이 record를 사용하지 않는 관례라 record가 아닌 일반 클래스로 전환했다
 * (Entity/DTO와 동일하게 @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder 조합 사용).
 * 이 클래스는 REST로 직렬화되는 DTO가 아니라 계산 엔진 내부에서만 쓰이는 결과 캐리어라 필드명은
 * DB 컬럼명이 아닌 기존 Java 캘멀케이스(itemCode/amt/calcBasis)를 유지한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalPayItemCandidate {

    private SalaryItemCode itemCode;
    private Long amt;
    private String calcBasis;
}
