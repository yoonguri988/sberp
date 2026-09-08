package com.sb.erp.appr.service;

import java.util.List;
import java.util.Map;

import com.sb.erp.appr.dto.request.ApprDocRequest;
import com.sb.erp.appr.dto.request.ApprDocSearchCondition;
import com.sb.erp.appr.dto.request.ApprDocUpdateRequest;
import com.sb.erp.appr.dto.response.ApprDocInitResponse;
import com.sb.erp.appr.dto.response.ApprDocResponse;
import com.sb.erp.appr.dto.response.ApprDocSummaryResponse;
import com.sb.erp.appr.dto.response.ApprFormResponse;
import com.sb.erp.appr.dto.response.ApprLineResponse;
import com.sb.erp.dept.dto.response.DeptResponse;

public interface ApprDocService {
	
	// ======== 문서 작성 파트 ==========
	
	public List<ApprFormResponse> findForm(Long comId);
	public ApprDocInitResponse initResponse(Long empId);
	public Long insertDocAndLine(ApprDocRequest req, Long empId, Long comId);
	public void updateDoc(Long docId, ApprDocUpdateRequest req, Long empId);
	
	// ======== 문서 조회 파트 =========
	
	public Map<String, Object> selectDocCnt(Long empId);
	public List<ApprDocSummaryResponse> selectMyHistoryDocs(ApprDocSearchCondition condition);
	public List<ApprDocSummaryResponse> selectMyTodoDocs(ApprDocSearchCondition condition);
	public ApprDocResponse selectDocDetail(Long docId, Long comId);
	
	// ======== 결재선 관련 파트 ===========
	 
	public List<ApprLineResponse> approversByEmpId(Long empId);
	public List<ApprLineResponse> selectLinesByDocId(Long docId);
	public void processLine(Long docId, Long empId, String action);
	public List<ApprLineResponse> selectDeptEmpsForLines(Long deptId, Long empId);
	public List<DeptResponse> cntApprovers(Long deptId, Long empId);
	
	// ========= 페이징 ============
	public int selectMyHistoryDocsCnt(ApprDocSearchCondition condition);
	public int selectMyTodoDocsCnt(ApprDocSearchCondition condition);
	
}
