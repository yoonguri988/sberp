package com.sb.erp.dashboard.member.service;

import com.sb.erp.dashboard.member.dto.response.DashboardSummaryResponse;

public interface DashboardService {
	public DashboardSummaryResponse getSummary(Long empId, Long comId);
}
