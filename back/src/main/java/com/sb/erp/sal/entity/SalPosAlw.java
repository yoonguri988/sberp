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
 * 직책별 수당 매핑 — (급여 산정 엔진 설계 반영)
 *
 * pos는 Employee.position(Position 엔티티)의 posCode(직급코드, 문자열)와 매칭한다.
 * Position 엔티티(FK)를 직접 참조하지 않고 코드 문자열로만 매칭하는 이유: 회사(comId)마다 Position
 * 로우(PK)가 별도로 존재하므로, "직책수당 정책"은 comId + posCode 조합으로 스코프를 걸어야
 * 회사가 달라도 같은 직급코드 체계를 재사용할 수 있다.
 */
@Entity
@Table(name = "sal_pos_alw")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalPosAlw {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salPosAlwSeq")
    @SequenceGenerator(name = "salPosAlwSeq", sequenceName = "sal_pos_alw_seq", allocationSize = 1)
    @Column(name = "alw_id")
    private Long alwId;

    @Column(name = "pos", nullable = false, length = 30)
    private String pos; // Employee.position(Position).posCode 와 매칭

    @Column(name = "com_id", nullable = false)
    private Long comId; // 회사별로 직책수당 금액이 다를 수 있으므로 스코프 컬럼 유지

    @Column(name = "amt", nullable = false)
    private Long amt; // 월 지급액

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
