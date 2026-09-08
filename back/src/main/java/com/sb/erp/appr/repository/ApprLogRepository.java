package com.sb.erp.appr.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprLog;

@Repository
public interface ApprLogRepository  extends JpaRepository<ApprLog, Long>{
	
	public List<ApprLog> findByApprDoc_DocIdOrderByCreatedAtDesc(Long docId);
	
	// 취소 승인시 해당 위임전결이 건드릴 로그만 조회
	public List<ApprLog> findByAutoDeleg_AutoDelegId(Long autoDelegId);
	
	// 관리자 콘솔 - 문서/사원/기간 필터 조회
	@Query("""
		select
			l
		from
			ApprLog l
		where
			l.apprDoc.company.comId = :comId
			and (:docId is null or l.apprDoc.docId = :docId)
			and (:empId is null or l.oriEmp.empId = :empId or l.actEmp.empId = :empId)
			and (:startDate is null or l.createdAt >= :startDate)
			and (:endDate is null or l.createdAt < :endDate)
		order by
			l.createdAt desc
	""")
	public Page<ApprLog> search(
			@Param("comId") Long comId,
			@Param("docId") Long docId,
			@Param("empId") Long empId,
			@Param("startDate") LocalDateTime startDate,
			@Param("endDate") LocalDateTime endDate,
			Pageable pageable
	);
	
}
