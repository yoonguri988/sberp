package com.sb.erp.eval.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



import com.sb.erp.com.entity.Company;

/**
 * 평가 회차 Entity (evaluation_period 테이블)
 *
 * ── 설계 포인트 ──
 *
 * 1. 상태 머신:
 *    READY → OPEN → CLOSED → REPORTING → REPORTED
 *                              ↘ REPORTING_FAILED (→ 재시도 가능)
 *    상태 전환은 도메인 메서드로만 허용. 외부에서 setPeriodStatus() 불가.
 *
 * 2. periodStatus를 enum으로 할 수도 있지만, 현재 DB 컬럼이 VARCHAR이고
 *    기존 코드와의 호환을 위해 String 유지. 전환 메서드에서 유효성 검증.
 *
 * 3. startDate, endDate → LocalDate (시간 불필요)
 *    기존 MyBatis에서 String("YYYY-MM-DD")이었던 것을 타입 안전하게 전환.
 *    TO_DATE/TO_CHAR 변환이 JPA에서는 불필요 (Hibernate가 자동 처리).
 */

@Entity
@Table(name = "evaluation_period")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvalPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_period")
    @SequenceGenerator(name = "seq_period", sequenceName = "SEQ_PERIOD", allocationSize = 1)
    @Column(name = "period_id")
    private Long periodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "com_id", nullable = false)
    private Company company;

    @Column(name = "eval_year", nullable = false)
    private int evalYear;

    @Column(name = "eval_term", length = 10, nullable = false)
    private String evalTerm;  // H1 / H2 / ANNUAL

    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "period_status", length = 20, nullable = false)
    private String periodStatus;  // READY / OPEN / CLOSED / REPORTING / REPORTING_FAILED / REPORTED

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

}
