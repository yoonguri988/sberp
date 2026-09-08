package com.sb.erp.sal.dto.response;

import com.sb.erp.sal.entity.SalPayItem;
import com.sb.erp.sal.entity.type.PaymentItemType;
import com.sb.erp.sal.entity.type.SalaryItemCode;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * itemType/itemName은 DB 컬럼이 아니라 itemCode에서 파생되는 값(화면 표시용)이라 축약하지 않았다.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPaymentItemResponse {

    private Long itemId;
    private SalaryItemCode itemCode;
    private PaymentItemType itemType;
    private String itemName;
    private Long amt;

    public static SalaryPaymentItemResponse from(SalPayItem entity) {
        return SalaryPaymentItemResponse.builder()
                .itemId(entity.getItemId())
                .itemCode(entity.getItemCode())
                .itemType(entity.getItemType())
                .itemName(entity.getItemName())
                .amt(entity.getAmt())
                .build();
    }
}
