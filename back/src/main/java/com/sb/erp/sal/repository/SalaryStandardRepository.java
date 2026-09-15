package com.sb.erp.sal.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalStd;

@Repository
public interface SalaryStandardRepository
        extends JpaRepository<SalStd, Long>, JpaSpecificationExecutor<SalStd> {

    /** "지금 이 순간" 기준으로 적용 중인 급여기준(현재값) 조회 - 본인/관리자 조회 화면(/me, 급여기준 관리) 전용. */
    Optional<SalStd> findByEmployee_EmpIdAndActvTrue(Long empId);

    /**
     * 특정 시점(date)에 적용되었던 급여기준 1건 조회 (버저닝 이력 중 startDate&lt;=date&lt;=endDate 구간 매칭,
     * endDate가 NULL이면 상한 없음).
     *
     * 급여 산정/재산정 엔진은 이 메서드를 사용해야 한다 — {@link #findByEmployee_EmpIdAndActvTrue}(지금 이
     * 순간의 최신값)을 쓰면, 산정 이후 급여기준이 변경(버전업)됐을 때 재산정 시점에는 이미 actv=false로 바뀐
     * "그 달 당시 급여기준" 대신 전혀 다른 기간의 "현재 급여기준"이 잘못 조회되어, 지급월과 무관한 값으로
     * 재계산되는 문제가 있었다(급여기준변경 → 급여재산정 버그의 원인).
     */
    @Query("select s from SalStd s where s.employee.empId = :empId "
            + "and s.startDate <= :date and (s.endDate is null or s.endDate >= :date)")
    Optional<SalStd> findApplicable(@Param("empId") Long empId, @Param("date") LocalDate date);
}
