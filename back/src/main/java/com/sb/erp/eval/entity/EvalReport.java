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
 * AI 평가 리포트 Entity (evaluation_ai_report 테이블)
 *
 * 1. 유니크 제약:
 *    period_id + emp_id 조합이 논리적 유니크.
 *    재생성 시 같은 조합의 기존 리포트를 update (upsert 패턴).
 *    @UniqueConstraint로 DB 레벨에서도 보장.
 *
 * 2. 감성 분석 값:
 *    - sentimentPositive/Neutral/Negative → 0~100 정수 퍼센트 (DDL 기준)
 *    - BigDecimal 유지 (기존 DTO 호환 + 소수점 허용 가능성)
 *    - sentimentLabel: POSITIVE / NEUTRAL / NEGATIVE
 *
 * 3. generatedAt:
 *    - insert 시 SYSDATE, update 시 SYSDATE → 도메인 메서드에서 LocalDateTime.now()
 *    - createdAt/updatedAt과 별개: generatedAt은 "AI가 생성한 시점"
 *
 * 4. aiSummary:
 *    - GPT-4o-mini가 생성한 텍스트. 길이가 가변적이므로 @Lob 또는 충분한 length 지정.
 *    - Oracle에서 VARCHAR2(4000) 초과 시 CLOB 자동 매핑.
 */

@Entity
@Table(name = "evaluation_ai_report",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_report_period_emp",
           columnNames = {"period_id", "emp_id"}
       ))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvalReport {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_report")
    @SequenceGenerator(name = "seq_report", sequenceName = "SEQ_REPORT", allocationSize = 1)
    @Column(name = "report_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private EvalPeriod evalPeriod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    // ── 평가 항목별 평균 점수 ──

    @Column(name = "avg_performance", precision = 5, scale = 2)
    private BigDecimal avgPerformance;

    @Column(name = "avg_expertise", precision = 5, scale = 2)
    private BigDecimal avgExpertise;

    @Column(name = "avg_teamwork", precision = 5, scale = 2)
    private BigDecimal avgTeamwork;

    @Column(name = "avg_attitude", precision = 5, scale = 2)
    private BigDecimal avgAttitude;

    @Column(name = "avg_growth", precision = 5, scale = 2)
    private BigDecimal avgGrowth;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private BigDecimal overallScore;

    @Column(name = "grade", length = 2)
    private String grade;  // S / A / B / C / D

    
    // ── AI 생성 콘텐츠 ──

    @Lob
    @Column(name = "ai_summary")
    private String aiSummary;

    
    // ── 감성 분석 ──

    @Column(name = "sentiment_positive", precision = 5, scale = 2)
    private BigDecimal sentimentPositive;

    @Column(name = "sentiment_neutral", precision = 5, scale = 2)
    private BigDecimal sentimentNeutral;

    @Column(name = "sentiment_negative", precision = 5, scale = 2)
    private BigDecimal sentimentNegative;

    @Column(name = "sentiment_label", length = 20)
    private String sentimentLabel;  // POSITIVE / NEUTRAL / NEGATIVE

    
    // ── 메타 ──

    @Column(name = "model_name", length = 50)
    private String modelName;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

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
