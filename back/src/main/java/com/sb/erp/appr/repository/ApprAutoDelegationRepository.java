package com.sb.erp.appr.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprAutoDelegation;


//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprAutoDelegation.java 참고
@Repository
public interface ApprAutoDelegationRepository extends JpaRepository<ApprAutoDelegation, Long>{
	
	// 신규 문서 자동 라우팅 - 해당 사원의 현재 활성 위임 여부 확인
	public Optional<ApprAutoDelegation> findByDelEmp_EmpIdAndDelegStatus(Long delEmpId, String delegStatus);
	
	// 만료 - 활성 상태이면서 종료일이 지난 건
	public List<ApprAutoDelegation> findByDelegStatusAndEndDateBefore(String delegStatus, LocalDate date);
	
	// 본인 위임전결 현황 조회
	public List<ApprAutoDelegation> findByDelEmp_EmpIdOrderByCreatedAtDesc(Long empId);
	
	// 관리자 - 상태별 전체 조회
	public List<ApprAutoDelegation> findByDelegStatusOrderByCreatedAtDesc(String delegStatus);
}
