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
 * 4대보험 요율 정책 — (급여 산정 엔진 설계 반영)
 *
 * 국민연금/건강보험/장기요양보험료/고용보험 요율은 법 개정으로 매년 바뀌므로 코드에 하드코딩하지 않고
 * 이 테이블에서 연도별 이력으로 관리한다. comId가 없는 이유: 4대보험 요율은 회사와 무관한 전국 공통
 * 법정 요율이므로 전역 정책으로 취급한다
 *
 * 매월 급여 산정 시 payMonth가 속한 날짜 기준으로 effFrom &lt;= payMonth &lt;= effTo(또는 NULL) 조건에
 * 맞는 행을 조회해서 사용한다.
 */
@Entity
@Table(name = "sal_rate_plcy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalRatePlcy {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salRatePolicySeq")
    @SequenceGenerator(name = "salRatePolicySeq", sequenceName = "sal_rate_plcy_seq", allocationSize = 1)
    @Column(name = "rate_id")
    private Long rateId;

    @Column(name = "plcy_year", nullable = false)
    private Integer plcyYear; // 적용 연도 (표기/조회 편의용, 실제 판정은 effFrom/effTo 기준)

    @Column(name = "pens_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal pensRate; // 국민연금 요율 (예: 0.0450)

    @Column(name = "hlth_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal hlthRate; // 건강보험 요율 (예: 0.03545)

    @Column(name = "care_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal careRate; // 장기요양보험료율 (건강보험료 대비, 예: 0.1295)

    @Column(name = "empl_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal emplRate; // 고용보험 요율 (예: 0.0090)

    @Column(name = "eff_from", nullable = false)
    private LocalDate effFrom;

    @Column(name = "eff_to")
    private LocalDate effTo; // NULL = 현재 유효

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    /** 새 요율 정책이 등록될 때 기존 유효 정책을 이력으로 종료 처리한다(SalStd와 동일한 버저닝 패턴). */
    public void closeAsHistory(LocalDate endDate) {
        this.effTo = endDate;
    }
}
