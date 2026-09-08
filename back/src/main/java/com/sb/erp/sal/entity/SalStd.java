package com.sb.erp.sal.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여기준
 *
 * 급여기준은 수정 시 이전 값을 이력으로 보존해야 하므로(6-4), in-place update가 아니라
 * "기존 행 종료(endDate/actv=false) + 새 버전 행 추가" 방식(버저닝)으로 관리한다.
 * 특정 시점에 직원별로 actv=true 인 행은 항상 1건 이하이다.
 *
 */
@Entity
@Table(name = "sal_std")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalStd {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salStdSeq")
    @SequenceGenerator(name = "salStdSeq", sequenceName = "sal_std_seq", allocationSize = 1)
    @Column(name = "std_id")
    private Long stdId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Employee employee;

    @Column(name = "base_sal", nullable = false)
    private Long baseSal; // 기본급 (원 단위 정수)

    @Column(name = "annu_sal")
    private Long annuSal; // 연봉계약액 (선택)

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate; // 적용시작일

    @Column(name = "end_date")
    private LocalDate endDate; // 적용종료일 (이력 보존용, 현재 유효 건은 null)

    @Column(name = "actv", nullable = false)
    private boolean actv; // 현재 적용 여부

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private LocalDateTime updatedAt;

    /** 새로운 급여기준으로 대체될 때 현재 행을 이력(종료 상태)으로 전환한다. */
    public void closeAsHistory(LocalDate endDate) {
        this.endDate = endDate;
        this.actv = false;
    }
}
