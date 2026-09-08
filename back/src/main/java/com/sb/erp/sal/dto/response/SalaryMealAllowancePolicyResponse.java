package com.sb.erp.sal.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalMealAlwPlcy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 필드명은 sal_meal_alw_plcy 테이블 컬럼명과 1:1로 동일하다(JSON 키도 동일). */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryMealAllowancePolicyResponse {

    private Long mealPlcyId;
    private Long comId; // NULL = 전사 공통 기본값
    private Long amt;
    private LocalDate effFrom;
    private LocalDate effTo;
    private LocalDateTime createdAt;

    public static SalaryMealAllowancePolicyResponse from(SalMealAlwPlcy entity) {
        return SalaryMealAllowancePolicyResponse.builder()
                .mealPlcyId(entity.getMealPlcyId())
                .comId(entity.getComId())
                .amt(entity.getAmt())
                .effFrom(entity.getEffFrom())
                .effTo(entity.getEffTo())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
