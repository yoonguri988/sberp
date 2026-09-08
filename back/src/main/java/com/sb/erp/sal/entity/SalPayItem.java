package com.sb.erp.sal.entity;

import com.sb.erp.sal.entity.type.PaymentItemType;
import com.sb.erp.sal.entity.type.SalaryItemCode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여 지급 세부 항목 (수당/공제) — 테이블 sal_pay_item
 */
@Entity
@Table(name = "sal_pay_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalPayItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salPayItemSeq")
    @SequenceGenerator(name = "salPayItemSeq", sequenceName = "sal_pay_item_seq", allocationSize = 1)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pay_id", nullable = false)
    private SalPay salPay;

    // 사전 정의된 항목 코드(카탈로그)에서 선택 - 자유 텍스트 입력이 아니다. SalaryItemCode 참고.
    @Enumerated(EnumType.STRING)
    @Column(name = "item_code", nullable = false, length = 30)
    private SalaryItemCode itemCode;

    @Column(name = "amt", nullable = false)
    private Long amt;

    void assignPay(SalPay salPay) {
        this.salPay = salPay;
    }

    /** itemCode에서 파생되는 값(중복 저장하지 않음) - 수당/공제 구분 */
    public PaymentItemType getItemType() {
        return itemCode.getItemType();
    }

    /** itemCode에서 파생되는 값(중복 저장하지 않음) - 화면 표시용 한글 항목명 */
    public String getItemName() {
        return itemCode.getDisplayName();
    }
}
