package com.sb.erp.sal.entity;

import java.time.LocalDateTime;

import com.sb.erp.sal.entity.type.ChangeDomainType;
import com.sb.erp.sal.entity.type.ChangeType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여 변경 이력 — 테이블 sal_hist
 *
 * "이력은 시스템이 자동 기록하며 사람이 직접 등록/수정/삭제하지 않는다."
 * → Repository/Service에 update, delete 메서드를 두지 않고 조회(search)와 내부 기록(record)만 제공한다.
 */
@Entity
@Table(name = "sal_hist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalHist {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salHistSeq")
    @SequenceGenerator(name = "salHistSeq", sequenceName = "sal_hist_seq", allocationSize = 1)
    @Column(name = "hist_id")
    private Long histId;

    @Column(name = "actor_emp_id", nullable = false)
    private Long actorEmpId; // 행위자(처리한 관리자)의 empId

    @Column(name = "actor_name", length = 100)
    private String actorName; // 조회 편의를 위한 스냅샷 성명

    @Column(name = "trgt_emp_id")
    private Long trgtEmpId; // 변경 대상 직원의 empId

    @Column(name = "com_id")
    private Long comId; // 변경 대상 직원의 소속 회사(comId) 스냅샷 - 관리자 조회 시 회사 스코프 필터링용

    @Enumerated(EnumType.STRING)
    @Column(name = "dom_type", nullable = false, length = 30)
    private ChangeDomainType domType; // SALARY_STANDARD / SALARY_PAYMENT

    @Column(name = "trgt_id", nullable = false)
    private Long trgtId; // 변경 대상 엔티티 PK

    @Enumerated(EnumType.STRING)
    @Column(name = "chg_type", nullable = false, length = 20)
    private ChangeType chgType; // CREATE / UPDATE / DELETE / STATUS_CHANGE

    @Lob
    @Column(name = "bfr_val")
    private String bfrVal; // 변경 전 값(JSON 스냅샷)

    @Lob
    @Column(name = "aft_val")
    private String aftVal; // 변경 후 값(JSON 스냅샷)

    // "desc"는 Oracle 예약어(ORDER BY DESC)라 컬럼명으로 쓰면 안 되므로 "descr"로 표기
    @Column(name = "descr", length = 2000)
    private String descr;

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;
}
