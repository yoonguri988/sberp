package com.sb.erp.sal.entity;

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
 * 식대 정책 — 테이블 sal_meal_alw_plcy (신규, 2026-08-20 급여 산정 엔진 설계 반영, 선택적)
 *
 * 설계 문서(salary-calculation-engine-design.md)의 원안은 "com_id(PK), amount, effective_from/to"였으나,
 * PK가 comId 단일값이면 요율/직책수당 정책과 달리 개정 이력을 여러 행으로 남길 수 없어(버저닝 불가)
 * 다른 신규 정책 테이블(SalRatePolicy 등)과의 일관성이 깨진다. 그래서 이 구현에서는 다른 신규
 * 정책 테이블과 동일하게 자체 시퀀스 PK(mealPlcyId)를 두고, comId는 일반 컬럼(nullable)으로 변경했다.
 * comId가 NULL인 행은 "회사 공통 기본값(fallback)"으로 취급한다 — 계산 시 comId 매칭 정책이 없으면
 * comId가 NULL인 정책을 조회해서 사용한다(design.md "MEAL_ALLOWANCE 계산식" 참고).
 */
@Entity
@Table(name = "sal_meal_alw_plcy")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalMealAlwPlcy {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salMealPolicySeq")
    @SequenceGenerator(name = "salMealPolicySeq", sequenceName = "sal_meal_alw_plcy_seq", allocationSize = 1)
    @Column(name = "meal_plcy_id")
    private Long mealPlcyId;

    @Column(name = "com_id")
    private Long comId; // NULL = 전사 공통 기본값(fallback)

    @Column(name = "amt", nullable = false)
    private Long amt; // 월 식대 고정액

    @Column(name = "eff_from", nullable = false)
    private LocalDate effFrom;

    @Column(name = "eff_to")
    private LocalDate effTo;

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    public void closeAsHistory(LocalDate endDate) {
        this.effTo = endDate;
    }
}
