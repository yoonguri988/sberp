package com.sb.erp.eval.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



import com.sb.erp.emp.entity.Employee;

/**
 * 인사평가 Entity (performance_evaluation 테이블)
 * 1. Employee 참조가 2개:
 *    - targetEmployee: 평가 대상 사원
 *    - evaluator: 평가자 (부서장)
 *    같은 Entity를 두 번 참조하므로 @JoinColumn의 name으로 구분.
 *
 * 2. 점수 필드:
 *    - scoreXxx → Integer (null 허용: DRAFT 상태에서 미입력 가능)
 *    - weightedScore → BigDecimal (가중 평균이므로 정밀도 필요)
 *
 * 3. evalStatus: DRAFT / SUBMITTED
 *    - DRAFT: 임시 저장 (수정 가능)
 *    - SUBMITTED: 제출 완료 (수정 불가, 회차 마감 조건에 영향)
 */
@Entity
@Table(name = "performance_evaluation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_eval")
    @SequenceGenerator(name = "seq_eval", sequenceName = "SEQ_EVAL", allocationSize = 1)
    @Column(name = "eval_id")
    private Long evalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private EvalPeriod evalPeriod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_emp_id", nullable = false)
    private Employee targetEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id", nullable = false)
    private Employee evaluator;

    @Column(name = "eval_type", length = 20, nullable = false)
    private String evalType;  // LEADER (현재 유일한 유형)

    @Column(name = "score_performance")
    private Integer scorePerformance;

    @Column(name = "score_expertise")
    private Integer scoreExpertise;

    @Column(name = "score_teamwork")
    private Integer scoreTeamwork;

    @Column(name = "score_attitude")
    private Integer scoreAttitude;

    @Column(name = "score_growth")
    private Integer scoreGrowth;

    @Column(name = "weighted_score", precision = 5, scale = 2)
    private BigDecimal weightedScore;

    @Lob
    @Column(name = "strength_comment")
    private String strengthComment;

    @Lob
    @Column(name = "improvement_comment")
    private String improvementComment;

    @Column(name = "eval_status", length = 20, nullable = false)
    private String evalStatus;  // DRAFT / SUBMITTED

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
