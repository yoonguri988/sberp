package com.sb.erp.appr.repository;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.appr.dto.request.ApprDocRequest;
import com.sb.erp.appr.dto.request.ApprDocSearchCondition;
import com.sb.erp.appr.dto.request.ApprDocUpdateRequest;
import com.sb.erp.appr.dto.response.ApprDocInitResponse;
import com.sb.erp.appr.dto.response.ApprDocResponse;
import com.sb.erp.appr.dto.response.ApprDocSummaryResponse;
import com.sb.erp.appr.dto.response.ApprFormResponse;
import com.sb.erp.appr.dto.response.ApprLineResponse;

@Mapper
public interface ApprDocMapper {
	
	// 문서 작성 파트
	public List<ApprFormResponse> findForm(@Param("comId") Long comId);
	public ApprDocInitResponse initResponse(@Param("empId") Long empId);
	public int insertDoc(@Param("req") ApprDocRequest request, @Param("empId") Long empId, @Param("comId") Long comId);
	public Long selectCurrentDocSeq();
	public int updateDoc(@Param("docId") Long docId, @Param("req") ApprDocUpdateRequest req);

	// 문서 조회 파트
	public Map<String, Object> selectDocCnt(@Param("empId") Long empId);
	public List<ApprDocSummaryResponse> selectMyHistoryDocs(ApprDocSearchCondition condition);
	public int selectMyHistoryDocsCnt(ApprDocSearchCondition condition);
	public List<ApprDocSummaryResponse> selectMyTodoDocs(ApprDocSearchCondition condition);
	public int selectMyTodoDocsCnt(ApprDocSearchCondition condition);
	public ApprDocResponse selectDocDetail(@Param("docId") Long docId);

	// 결재선 관련 파트
	public List<ApprLineResponse> approversByEmpId(@Param("empId") Long empId);
	public int updateDocStatus(@Param("docId") Long docId, @Param("docStatus") String docStatus);
	public List<ApprLineResponse> selectDeptEmpsForLines(@Param("deptId") Long deptId, @Param("empId") Long empId);
	public int cntApprovers(@Param("deptId") Long deptId, @Param("empId") Long empId);
}
