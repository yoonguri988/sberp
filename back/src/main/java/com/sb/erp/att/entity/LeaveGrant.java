package com.sb.erp.att.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.sb.erp.emp.entity.Employee;

@Entity
@Table(name = "leave_grant")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveGrant { // 연차 부여/사용 이력

	// PK
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_leave_grant")
    @SequenceGenerator(name = "seq_leave_grant", sequenceName = "SEQ_LEAVE_GRANT", allocationSize = 1)
    @Column(name = "grant_id")
    private Long grantId;

    // 휴가를 부여한 사원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    // 부여한 휴가 일수 (15.00 / 1.00 / -2.00)
    @Column(name = "grant_days", precision = 5, scale = 2, nullable = false)
    private BigDecimal grantDays;

    // 휴가 타입 REG(정기부여) / CAR(이월) / ADJ(수동조정)
    // REG - 입사일 기준으로 발생하는 연차
    // CAR - 전년도 미사용 연차
    // ADJ - 관리자가 수동으로 조정함(특별 부여 또는 차감)
    @Column(name = "grant_type", length = 20, nullable = false)
    private String grantType;

    // 휴가가 부여된 일자
    @Column(name = "granted_at", updatable = false)
    private LocalDateTime grantedAt;

    // 휴가가 사용된 일자
    @Column(name = "expire_at")
    private LocalDate expireAt;

    // 휴가 부여 사유
    @Column(name = "reason", length = 200)
    private String reason;

    @PrePersist
    public void onCreate() {
        this.grantedAt = LocalDateTime.now();
    }
}
