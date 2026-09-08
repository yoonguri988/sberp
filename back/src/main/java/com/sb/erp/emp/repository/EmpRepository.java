package com.sb.erp.emp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.emp.entity.Employee;

@Repository
public interface EmpRepository extends JpaRepository<Employee, Long> {
	
	Optional<Employee> findByEmpNo(String empNo);
	
	// ── 관리자 대시보드용: 회사별 재직 사원 ID 목록 ──
	@Query("SELECT e.empId FROM Employee e " +
		   "WHERE e.company.comId = :comId AND e.empStatus = '재직'")
	List<Long> findActiveEmpIdsByComId(@Param("comId") Long comId);
	
	// ── 관리자 대시보드용: 사용자 정보 ──
	@Query("SELECT e.empName, d.deptName, p.posName " +
		       "FROM Employee e " +
		       "JOIN e.department d " +
		       "JOIN e.position p " +
		       "WHERE e.empId = :empId")
	List<Object[]> findEmpProfileById(@Param("empId") Long empId);
	
	
	
	// 연차 관리용 : 재직중인 전체 사원 확인
	@Query("SELECT e.empId FROM Employee e WHERE e.empStatus = '재직'")
	List<Long> findAllActiveEmpIds();
	
	// ── 멀티테넌시 검증용 ──
	// 해당 사원이 요청자의 회사 소속인지 확인.
	// Employee는 comId 컬럼이 아니라 @ManyToOne Company를 갖고 있으므로
	// emp.getCompany().getComId()를 쓰면 Company가 지연 로딩되며 @Lob comLogo 문제가 재발한다.
	// 파생 쿼리로 FK만 비교해서 엔티티 로딩을 회피
	boolean existsByEmpIdAndCompany_ComId(Long empId, Long comId);
	
}