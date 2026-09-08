package com.sb.erp.sal.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalAcct;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryAccountResponse {
    private Long acctId;
    private Long empId;
    private String empName;
    private String bankName;
    private String acctNo;
    private String hldrName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SalaryAccountResponse from(SalAcct entity) {
        return SalaryAccountResponse.builder()
                .acctId(entity.getAcctId())
                .empId(entity.getEmployee().getEmpId())
                .empName(entity.getEmployee().getEmpName())
                .bankName(entity.getBankName())
                .acctNo(entity.getAcctNo())
                .hldrName(entity.getHldrName())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
