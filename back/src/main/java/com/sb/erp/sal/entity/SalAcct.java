package com.sb.erp.sal.entity;

import java.time.LocalDateTime;

import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여 수령 계좌 (직원당 1건) — 테이블 sal_acct
 *
 * 이력(변경 전 계좌)은 이 테이블 자체가 아니라 `SalPay`에 지급 시점 계좌를 스냅샷으로 남기는 방식으로
 * 보존한다(2026-08-20 결정) — 계좌를 바꿔도 과거 급여 명세서의 지급 계좌 기록은 바뀌지 않는다.
 */
@Entity
@Table(name = "sal_acct")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAcct {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salAcctSeq")
    @SequenceGenerator(name = "salAcctSeq", sequenceName = "sal_acct_seq", allocationSize = 1)
    @Column(name = "acct_id")
    private Long acctId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false, unique = true)
    private Employee employee;

    @Column(name = "bank_name", nullable = false, length = 50)
    private String bankName; // 은행명

    @Column(name = "acct_no", nullable = false, length = 30)
    private String acctNo; // 계좌번호

    @Column(name = "hldr_name", nullable = false, length = 50)
    private String hldrName; // 예금주명 (직원 본인과 다를 수 있어 별도 보관)

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private LocalDateTime updatedAt;
}
