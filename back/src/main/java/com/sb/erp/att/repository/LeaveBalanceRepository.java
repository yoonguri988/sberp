package com.sb.erp.att.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.att.entity.LeaveBalance;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    // ──────────────────────────────────────────────
    // 1. 사원 + 연도로 단건 조회
    // ──────────────────────────────────────────────
    Optional<LeaveBalance> findByEmployee_EmpIdAndYear(Long empId, Integer year);


    // ──────────────────────────────────────────────
    // 2. 사원의 연도별 연차 이력 (최신 연도 먼저 정렬)
    // ──────────────────────────────────────────────
    List<LeaveBalance> findByEmployee_EmpIdOrderByYearDesc(Long empId);


    // ──────────────────────────────────────────────
    // 3. 특정 연도 전체 사원 연차 목록 + 검색 키워드 (관리자 화면)
    // ──────────────────────────────────────────────
    @Query("SELECT lb FROM LeaveBalance lb JOIN lb.employee e " +
    	       "WHERE lb.year = :year " +
    	       "AND e.company.comId = :comId " +
    	       "AND (:keyword IS NULL " +
    	       "OR e.empName LIKE CONCAT('%', :keyword, '%') " +
    	       "OR e.empNo LIKE CONCAT('%', :keyword, '%')) " +
    	       "ORDER BY e.empId ASC")
    	List<LeaveBalance> findByYearAndKeyword(
    	    @Param("year") Integer year,
    	    @Param("comId") Long comId,
    	    @Param("keyword") String keyword);

}
