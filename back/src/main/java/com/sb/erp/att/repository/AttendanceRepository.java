package com.sb.erp.att.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.att.entity.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
	
	
	// 사원 근태 목록 - 서치 키워드 추가(null도 가능)
	@Query(value =
		    "SELECT * FROM ( " +
		        "SELECT sub.*, ROWNUM AS rNUM FROM ( " +
		            "SELECT a.*, e.EMP_NAME, e.EMP_NO, d.DEPT_NAME " +
		            "FROM attendance a " +
		            "JOIN employee e ON a.EMP_ID = e.EMP_ID " +
		            "JOIN department d ON e.DEPT_ID = d.DEPT_ID " +
		            "WHERE a.ATT_DATE BETWEEN :startDate AND :endDate " +
		            "AND e.COM_ID = :comId " +
		            "AND (:keyword IS NULL OR e.EMP_NAME LIKE '%' || :keyword || '%' " +
		            "     OR e.EMP_NO LIKE '%' || :keyword || '%') " +
		            "ORDER BY a.ATT_DATE DESC) sub ) " +
		        "WHERE rnum BETWEEN :start AND :end",
		    nativeQuery = true)
		List<Attendance> findAttendanceWithSearch(
		    @Param("startDate") LocalDate startDate,
		    @Param("endDate") LocalDate endDate,
		    @Param("comId") Long comId,
		    @Param("keyword") String keyword,
		    @Param("start") int start,
		    @Param("end") int end);
	
	// 사원 근태 상세 조회
	List<Attendance> findByEmployee_EmpId(Long empId);
	
	// 출근 중복 체크
	long countByEmployee_EmpIdAndAttDate(Long empId, LocalDate attDate);
	
	// 출근 기록
	Optional<Attendance> findByEmployee_EmpIdAndAttDate(Long empId, LocalDate attDate);
	
	// ── 멀티테넌시 검증용 ──
	// attId만으로 타사 근태를 수정하지 못하도록 comId를 조회 조건에 함께 기재
	Optional<Attendance> findByAttIdAndEmployee_Company_ComId(Long attId, Long comId);

	
	// 급여 산정(고정연장수당, sal 모듈 OvertimeAllowanceCalculator)용 - 기간 내 연장근로시간(분) 합계.
	// 해당 기간에 근태 기록이 아예 없으면 SUM은 NULL이 되므로 COALESCE로 0을 반환한다.
	@Query("SELECT COALESCE(SUM(a.overtimeMinutes), 0) FROM Attendance a " +
			"WHERE a.employee.empId = :empId AND a.attDate BETWEEN :start AND :end")
	Integer sumOvertimeMinutesByEmpIdAndDateRange(@Param("empId") Long empId,
			@Param("start") LocalDate start,
			@Param("end") LocalDate end);
	
	
	// 평가 리포트용 — 기간 내 사원별 근태 통계 집계
	// 순서: empId, workDays, lateCount, earlyLeaveCount, absentCount,
	@Query(value =
	    "SELECT a.emp_id, " +
	    "  COUNT(CASE WHEN a.att_status IN ('NORMAL','LATE','EARLY_LEAVE') THEN 1 END), " +
	    "  COUNT(CASE WHEN a.att_status = 'LATE' THEN 1 END), " +
	    "  COUNT(CASE WHEN a.att_status = 'EARLY_LEAVE' THEN 1 END), " +
	    "  COUNT(CASE WHEN a.att_status = 'ABSENT' THEN 1 END), " +
	    "  SUM(CASE WHEN a.att_status = 'ANNUAL' THEN 1 " +
	    "           WHEN a.att_status IN ('AM_HALF','PM_HALF') THEN 0.5 " +
	    "           ELSE 0 END), " +
	    "  COALESCE(SUM(a.work_minutes), 0), " +
	    "  COALESCE(SUM(a.overtime_minutes), 0) " +
	    "FROM attendance a " +
	    "WHERE a.att_date BETWEEN :startDate AND :endDate " +
	    "  AND a.emp_id IN :empIds " +
	    "GROUP BY a.emp_id",
	    nativeQuery = true)
	List<Object[]> findAttStatsByEmpIdsAndDateRange(
	    @Param("empIds") List<Long> empIds,
	    @Param("startDate") LocalDate startDate,
	    @Param("endDate") LocalDate endDate);
	
	
	// 관리자 대시보드용 — 특정 날짜 + 사원 ID 목록으로 근태 레코드 조회
	/* 
		IN 절에 사원 수가 1,000명을 넘으면 Oracle에서 ORA-01795: 
		maximum number of expressions in a list is 1000 에러가 발생할 수 있다. 
	 	현재 ERP 프로젝트 규모(수십~수백 명)에서는 문제없지만, 
	 	대규모 확장 시에는 IN 절을 500개 단위로 분할하는 처리가 필요
	*/
	List<Attendance> findByAttDateAndEmployee_EmpIdIn(
	    LocalDate attDate, List<Long> empIds);

}
