package com.sb.erp.appr.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprLineRequest;

@Repository
public interface ApprLineRequestRepository extends JpaRepository<ApprLineRequest, Long>{
	
	// 관리자용 - 승인 대기중인 요청 ( 본인 회사 소속만 )
	public List<ApprLineRequest> findByReqStatusAndApprDoc_Company_ComIdOrderByCreatedAtDesc(String reqStatus, Long comId);
	
	// 사용자용 - 본인이 신청한 요청 목록
	public List<ApprLineRequest> findByReqEmp_EmpIdOrderByCreatedAtDesc(Long empId);
	
	// 관리자용 - 대기중인 요청이 있는지 검증
	public boolean existsByApprLine_LinIdAndReqStatus(Long linId, String reqStatus);
	
	// 즐겨찾기 카운트용 - 문서에 위임/대결이 한 번이라도 있었는지
	public boolean existsByApprDoc_DocIdAndReqStatus(Long docId, String reqStatus);
	
	// 관리자 콘솔 - 상태/요청자/기간 필터 조회 (전부 선택적, 전체이력용)
	@Query("""
		select
			r
		from
			ApprLineRequest r
		where
			r.apprDoc.company.comId = :comId
			and (:reqStatus is null or r.reqStatus = :reqStatus)
			and (:reqEmpId is null or r.reqEmp.empId = :reqEmpId)
			and (:startDate is null or r.createdAt >= :startDate)
			and (:endDate is null or r.createdAt < :endDate)
		order by
			r.createdAt desc
	""")
	public Page<ApprLineRequest> search(
			@Param("comId") Long comId,
			@Param("reqStatus") String reqStatus,
			@Param("reqEmpId") Long reqEmpId,
			@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate,
			Pageable pageable
	);
}
