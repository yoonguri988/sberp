package com.sb.erp.appr.service;

import java.util.List;

import com.sb.erp.appr.dto.request.ApprAutoDelegationCancelRequest;
import com.sb.erp.appr.dto.response.ApprAutoDelegationResponse;

//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprAutoDelegation.java 참고
public interface ApprAutoDelegationService {
	
	public List<ApprAutoDelegationResponse> myDelegation(Long empId);
	public List<ApprAutoDelegationResponse> listByStatus(String delegStatus);
	public void requestCancel(Long autoDelegId, Long empId, ApprAutoDelegationCancelRequest req);
	public void approveCancel(Long autoDelegId, Long adminEmpId);
	public void rejectCancel(Long autoDelegId, Long adminEmpId);
}
