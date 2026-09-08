package com.sb.erp.sal.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalPosAlw;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 필드명은 sal_pos_alw 테이블 컬럼명과 1:1로 동일하다(JSON 키도 동일). */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPositionAllowanceResponse {

    private Long alwId;
    private String pos;
    private Long comId;
    private Long amt;
    private LocalDate effFrom;
    private LocalDate effTo;
    private LocalDateTime createdAt;

    public static SalaryPositionAllowanceResponse from(SalPosAlw entity) {
        return SalaryPositionAllowanceResponse.builder()
                .alwId(entity.getAlwId())
                .pos(entity.getPos())
                .comId(entity.getComId())
                .amt(entity.getAmt())
                .effFrom(entity.getEffFrom())
                .effTo(entity.getEffTo())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
