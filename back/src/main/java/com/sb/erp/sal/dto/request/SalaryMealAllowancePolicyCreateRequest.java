package com.sb.erp.sal.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 식대 정책 등록 요청.
 * com_id를 비워두면(NULL) 전사 공통 기본값(fallback)으로 등록된다 - ROOT만 가능(모든 회사에 영향을 주므로).
 * com_id를 지정하면 해당 회사 전용 정책으로 등록된다 - 해당 회사 ADMIN도 등록 가능.
 *
 * 필드명은 sal_meal_alw_plcy 테이블 컬럼명과 1:1로 동일하다(JSON 키도 동일).
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryMealAllowancePolicyCreateRequest {

    /** NULL이면 전사 공통 기본값(fallback) 정책으로 등록 */
    private Long comId;

    @NotNull(message = "식대 금액은 필수입니다.")
    @PositiveOrZero(message = "식대 금액은 0 이상이어야 합니다.")
    private Long amt;

    @NotNull(message = "적용 시작일은 필수입니다.")
    private LocalDate effFrom;
}
