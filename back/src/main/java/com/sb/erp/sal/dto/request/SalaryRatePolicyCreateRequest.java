package com.sb.erp.sal.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 4대보험 요율 정책 등록 요청. 회사 무관 전국 공통 법정 요율이므로 com_id를 받지 않는다.
 * 등록 시 기존에 유효했던(eff_to가 NULL인) 정책은 자동으로 이력 처리(eff_to = 신규 시작일 - 1일)된다.
 *
 * 필드명은 sal_rate_plcy 테이블 컬럼명과 1:1로 동일하다(JSON 키도 동일).
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryRatePolicyCreateRequest {

    @NotNull(message = "적용 연도는 필수입니다.")
    private Integer plcyYear;

    @NotNull(message = "국민연금 요율은 필수입니다.")
    private BigDecimal pensRate;

    @NotNull(message = "건강보험 요율은 필수입니다.")
    private BigDecimal hlthRate;

    @NotNull(message = "장기요양보험료율은 필수입니다.")
    private BigDecimal careRate;

    @NotNull(message = "고용보험 요율은 필수입니다.")
    private BigDecimal emplRate;

    @NotNull(message = "적용 시작일은 필수입니다.")
    private LocalDate effFrom;
}
