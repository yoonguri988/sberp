package com.sb.erp.att.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.att.entity.LeaveGrant;


@Repository
public interface LeaveGrantRepository extends JpaRepository<LeaveGrant, Long> {

    // ──────────────────────────────────────────────
    // 1. 사원의 전체 부여/차감 이력 (최신순)
    // ──────────────────────────────────────────────
    // grant_type
    // REG = 정기 부여 (입사일 기준 연차 발생)
    // CAR = 이월 (전년도 잔여분)
    // ADJ = 수동 조정 (관리자가 특별 부여 또는 차감)
    // grant_days가 음수면 차감(사용), 양수면 부여
    List<LeaveGrant> findByEmployee_EmpIdOrderByGrantedAtDesc(Long empId);


    // ──────────────────────────────────────────────
    // 2. 사원 + 특정 연도 이력
    // ──────────────────────────────────────────────
    // 연도별 이력 조회 (2026년 부여 내역만 보기)
    // 정기 부여 중복 체크: 해당 연도에 REG 타입이 이미 있으면 생략
    @Query("SELECT g FROM LeaveGrant g " +
           "WHERE g.employee.empId = :empId " +
           "AND EXTRACT(YEAR FROM g.grantedAt) = :year " +
           "ORDER BY g.grantedAt DESC")
    List<LeaveGrant> findByEmployee_EmpIdAndGrantYear(
            @Param("empId") Long empId,
            @Param("year") Integer year);

}
