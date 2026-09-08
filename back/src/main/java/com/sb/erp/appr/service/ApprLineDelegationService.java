package com.sb.erp.appr.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.sb.erp.appr.dto.request.ApprLineDelegationRequest;
import com.sb.erp.appr.dto.request.ApprLineRequestSearchCondition;
import com.sb.erp.appr.dto.response.ApprLineDelegationResponse;

public interface ApprLineDelegationService {
	
	public Long createRequest(ApprLineDelegationRequest req, Long reqEmpId);
	public List<ApprLineDelegationResponse> myRequests(Long empId);
	public List<ApprLineDelegationResponse> pendingRequests(Long comId);
	public void approve(Long reqId, Long adminEmpId, Long comId);
	public void reject(Long reqId, Long adminEmpId, Long comId);
	
	// 관리자 콘솔 - 전체 처리 이력 조회 ( 본인 소속 회사만 )
	public Page<ApprLineDelegationResponse> searchHistory(ApprLineRequestSearchCondition cond, Pageable pageable, Long comId);
}
