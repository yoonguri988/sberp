package com.sb.erp.sal.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalRatePlcy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 필드명은 sal_rate_plcy 테이블 컬럼명과 1:1로 동일하다(JSON 키도 동일). */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryRatePolicyResponse {

    private Long rateId;
    private Integer plcyYear;
    private BigDecimal pensRate;
    private BigDecimal hlthRate;
    private BigDecimal careRate;
    private BigDecimal emplRate;
    private LocalDate effFrom;
    private LocalDate effTo;
    private LocalDateTime createdAt;

    public static SalaryRatePolicyResponse from(SalRatePlcy entity) {
        return SalaryRatePolicyResponse.builder()
                .rateId(entity.getRateId())
                .plcyYear(entity.getPlcyYear())
                .pensRate(entity.getPensRate())
                .hlthRate(entity.getHlthRate())
                .careRate(entity.getCareRate())
                .emplRate(entity.getEmplRate())
                .effFrom(entity.getEffFrom())
                .effTo(entity.getEffTo())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
