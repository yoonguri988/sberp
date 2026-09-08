package com.sb.erp.appr.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprLine;

@Repository
public interface ApprLineRepository extends JpaRepository<ApprLine, Long>{
	
	// 위임전결 대상 - 대기중(WAI) 라인 중 개별 대결요청(REQ) 걸린 건 제외
	@Query("""
		select
			l
		from
			ApprLine l
		where
			l.employee.empId = :empId
			and l.linStatus = 'WAI'
			and l.linId not in (
				select
					r.apprLine.linId
				from
					ApprLineRequest r
				where
					r.reqStatus = 'REQ'
			)
		
	""")
	public List<ApprLine> findWaitingLinesForAutoDelegation(@Param("empId") Long empId);
	
	public Optional<ApprLine> findByApprDoc_DocIdAndEmployee_EmpId(Long docId, Long empId);
}
