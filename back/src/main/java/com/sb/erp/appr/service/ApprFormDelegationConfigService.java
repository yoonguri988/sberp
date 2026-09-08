package com.sb.erp.appr.service;

import com.sb.erp.appr.dto.request.ApprFormDelegationConfigRequest;
import com.sb.erp.appr.dto.response.ApprFormDelegationConfigResponse;

//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprFormDelegationConfig.java 참고
public interface ApprFormDelegationConfigService {
	
	public Long save(ApprFormDelegationConfigRequest req);
	public ApprFormDelegationConfigResponse getByForm(Long forId, Long forVersion);

}
