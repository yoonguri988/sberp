package com.sb.erp.appr.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.sb.erp.appr.dto.request.ApprLogSearchCondition;
import com.sb.erp.appr.dto.response.ApprLogResponse;

public interface ApprLogService {
	public Page<ApprLogResponse> searchLog(ApprLogSearchCondition cond, Pageable pageable, Long comId);
}
