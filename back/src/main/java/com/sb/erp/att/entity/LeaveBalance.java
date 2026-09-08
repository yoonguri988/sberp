package com.sb.erp.att.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.sb.erp.emp.entity.Employee;

@Entity
@Table(name = "leave_balance",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_leave_balance_year",
           columnNames = {"emp_id", "year"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LeaveBalance { // 현재 연차 상태

	// PK
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_leave_balance")
    @SequenceGenerator(name = "seq_leave_balance", sequenceName = "SEQ_LEAVE_BALANCE", allocationSize = 1)
    @Column(name = "balance_id")
    private Long balanceId;

    // 연차를 가진 사원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    // 연차가 발생한 연도
    @Column(name = "year", nullable = false)
    private Integer year;

    // 올해 발생한 총 연차 일수
    @Column(name = "total_days", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal totalDays = BigDecimal.ZERO;

    // 올해 사용한 연차 일수
    @Column(name = "used_days", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal usedDays = BigDecimal.ZERO;

    // 생성/수정 시각
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 잔여 일수, 발생한 총 연차-사용한 연차(totalDays - usedDays)
    public BigDecimal getRemainingDays() {
        return totalDays.subtract(usedDays);
    }
}
