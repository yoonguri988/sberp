package com.sb.erp.sal.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.sb.erp.sal.entity.SalPay;
import com.sb.erp.sal.entity.type.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * bankName/acctNo/hldrName은 지급 시점 계좌 스냅샷
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPaymentResponse {

    private Long payId;
    private Long empId;
    private String empName;
    private LocalDate payMonth;
    private Long baseSal;
    private Long allowTotal;
    private Long dedtTotal;
    private Long netPay;
    private PaymentStatus stat;
    private String rejRsn;
    private LocalDateTime paidAt;
    private String bankName;
    private String acctNo;
    private String hldrName;
    private List<SalaryPaymentItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SalaryPaymentResponse from(SalPay entity) {
        return SalaryPaymentResponse.builder()
                .payId(entity.getPayId())
                .empId(entity.getEmployee().getEmpId())
                .empName(entity.getEmployee().getEmpName())
                .payMonth(entity.getPayMonth())
                .baseSal(entity.getBaseSal())
                .allowTotal(entity.getAllowTotal())
                .dedtTotal(entity.getDedtTotal())
                .netPay(entity.getNetPay())
                .stat(entity.getStat())
                .rejRsn(entity.getRejRsn())
                .paidAt(entity.getPaidAt())
                .bankName(entity.getBankName())
                .acctNo(entity.getAcctNo())
                .hldrName(entity.getHldrName())
                .items(entity.getItems().stream().map(SalaryPaymentItemResponse::from).toList())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
