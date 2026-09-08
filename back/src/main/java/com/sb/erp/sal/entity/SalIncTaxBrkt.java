package com.sb.erp.sal.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 소득세 간이 구간표 — (급여 산정 엔진 설계 반영, 포트폴리오용 단순화)
 *
 * 실제 국세청 근로소득 간이세액표는 "월급여액 구간 x 부양가족 수" 매트릭스이지만, 이 프로젝트 스코프에서는
 * 부양가족 수를 반영하지 않고 기본급 구간별 단순 정률표로 근사한다. 화면/API 응답에는 이 한계를 반드시 명시해야 한다
 *
 * 조회 조건: minAmt &lt;= baseSal &lt; maxAmt(또는 maxAmt가 NULL이면 상한 없음)
 */
@Entity
@Table(name = "sal_inc_tax_brkt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalIncTaxBrkt {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salTaxBracketSeq")
    @SequenceGenerator(name = "salTaxBracketSeq", sequenceName = "sal_inc_tax_brkt_seq", allocationSize = 1)
    @Column(name = "brkt_id")
    private Long brktId;

    @Column(name = "min_amt", nullable = false)
    private Long minAmt; // 구간 하한(기본급 기준, 포함)

    @Column(name = "max_amt")
    private Long maxAmt; // 구간 상한(미포함). NULL = 상한 없음

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal taxRate; // 해당 구간 정률 (예: 0.0300)

    @Column(name = "eff_from", nullable = false)
    private LocalDate effFrom;

    @Column(name = "eff_to")
    private LocalDate effTo;

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    public void closeAsHistory(LocalDate endDate) {
        this.effTo = endDate;
    }

    /** baseSal이 이 구간(하한 포함, 상한 미포함)에 속하는지 여부 */
    public boolean contains(Long baseSal) {
        if (baseSal == null) {
            return false;
        }
        boolean aboveMin = baseSal >= minAmt;
        boolean belowMax = maxAmt == null || baseSal < maxAmt;
        return aboveMin && belowMax;
    }
}
