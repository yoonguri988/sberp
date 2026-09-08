package com.sb.erp.sal.dto.response;

import com.sb.erp.sal.entity.type.PaymentItemType;
import com.sb.erp.sal.entity.type.SalaryItemCode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryItemCodeResponse {

    private String code;
    private PaymentItemType itemType;
    private String displayName;

    public static SalaryItemCodeResponse from(SalaryItemCode itemCode) {
        return SalaryItemCodeResponse.builder()
                .code(itemCode.name())
                .itemType(itemCode.getItemType())
                .displayName(itemCode.getDisplayName())
                .build();
    }
}
