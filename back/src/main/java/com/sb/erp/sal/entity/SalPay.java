package com.sb.erp.sal.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.entity.type.PaymentStatus;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여 지급 내역 (7. 급여 지급 관리) — 테이블 sal_pay
 *
 * 상태(대기→승인→지급완료/반려)는 전자결재(appr_doc)와 연동하지 않는다.
 * 급여는 결재라인을 타지 않고 담당자(ROOT/ADMIN)가 바로 승인/반려/지급 처리하는 업무로 판단했다.
 *
 * bankName/acctNo/hldrName은 급여계좌(sal_acct)의 지급 시점 스냅샷이다. 
 * SalaryAccountRepository로 등록된 계좌를 조회해 값만 복사해 넣으며, 이후 계좌가 바뀌어도 과거 지급 내역의 값은 바뀌지 않는다.
 *
 */
@Entity
@Table(name = "sal_pay")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalPay {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salPaySeq")
    @SequenceGenerator(name = "salPaySeq", sequenceName = "sal_pay_seq", allocationSize = 1)
    @Column(name = "pay_id")
    private Long payId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "std_id")
    private SalStd salStd; // 산정 기준이 된 급여기준

    @Column(name = "pay_month", nullable = false)
    private LocalDate payMonth; // 지급월(해당 월 1일로 저장)

    @Column(name = "base_sal", nullable = false)
    private Long baseSal;

    @Column(name = "allow_total", nullable = false)
    private Long allowTotal;

    @Column(name = "dedt_total", nullable = false)
    private Long dedtTotal;

    @Column(name = "net_pay", nullable = false)
    private Long netPay; // 실지급액

    @Enumerated(EnumType.STRING)
    @Column(name = "stat", nullable = false, length = 20)
    private PaymentStatus stat;

    @Column(name = "rej_rsn", length = 500)
    private String rejRsn;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    // 지급 시점 계좌 스냅샷 (2026-08-20 추가). SalAcct를 FK로 참조하지 않고 값만 복사해서 남긴다.
    // 이후 직원이 계좌를 바꿔도 과거 이 급여 건의 지급 계좌 기록은 변하지 않아야 하기 때문이다.
    @Column(name = "bank_name", length = 50)
    private String bankName;

    @Column(name = "acct_no", length = 30)
    private String acctNo;

    @Column(name = "hldr_name", length = 50)
    private String hldrName;

    @Builder.Default
    @OneToMany(mappedBy = "salPay", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalPayItem> items = new ArrayList<>();

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private LocalDateTime updatedAt;

    public void addItem(SalPayItem item) {
        items.add(item);
        item.assignPay(this);
    }

    public void clearItems() {
        items.clear();
    }

    public void updateAmounts(Long baseSal, Long allowTotal, Long dedtTotal) {
        this.baseSal = baseSal;
        this.allowTotal = allowTotal;
        this.dedtTotal = dedtTotal;
        this.netPay = baseSal + allowTotal - dedtTotal;
    }

    public void changeStat(PaymentStatus stat, String rejRsn) {
        this.stat = stat;
        this.rejRsn = rejRsn;
        if (stat == PaymentStatus.PAID) {
            this.paidAt = LocalDateTime.now();
        }
    }

    public boolean isEditable() {
        return this.stat == PaymentStatus.PENDING;
    }
}
