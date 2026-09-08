package com.sb.erp.sal.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalStd;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryStandardResponse {
    private Long stdId;
    private Long empId;
    private String empName;
    private Long baseSal;
    private Long annuSal;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean actv;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SalaryStandardResponse from(SalStd entity) {
        return SalaryStandardResponse.builder()
                .stdId(entity.getStdId())
                .empId(entity.getEmployee().getEmpId())
                .empName(entity.getEmployee().getEmpName())
                .baseSal(entity.getBaseSal())
                .annuSal(entity.getAnnuSal())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .actv(entity.isActv())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
