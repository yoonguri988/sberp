package com.sb.erp.sal.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 소득세 간이 구간표 행 등록 요청.
 * 요율정책/직책수당과 달리 한 시점에 여러 구간(min~max 범위별) 행이 동시에 유효해야 하므로,
 * 등록 시 전체 구간표가 아닌 "동일한 min~max 구간"의 기존 유효 이력(eff_to가 NULL인 행)만 자동으로
 * 종료 처리(eff_to = 신규 eff_from - 1일)한다 - 다른 구간의 행은 영향을 받지 않는다.
 * 연도가 바뀌어 구간표 전체를 갱신할 때는 각 구간(min~max)별로 이 API를 반복 호출하면 된다.
 *
 * 필드명은 sal_inc_tax_brkt 테이블 컬럼명과 1:1로 동일하다(JSON 키도 동일).
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryIncomeTaxBracketCreateRequest {

    @NotNull(message = "구간 하한은 필수입니다.")
    @PositiveOrZero(message = "구간 하한은 0 이상이어야 합니다.")
    private Long minAmt;

    /** NULL이면 상한 없음(최고 구간) */
    private Long maxAmt;

    @NotNull(message = "세율은 필수입니다.")
    private BigDecimal taxRate;

    @NotNull(message = "적용 시작일은 필수입니다.")
    private LocalDate effFrom;
}