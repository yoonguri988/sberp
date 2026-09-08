package com.sb.erp.sal.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryStandardUpdateRequest {
    @NotNull(message = "기본급은 필수입니다.")
    @Positive(message = "기본급은 0보다 커야 합니다.")
    private Long baseSal;

    private Long annuSal;

    @NotNull(message = "적용시작일은 필수입니다.")
    private LocalDate startDate;
}
