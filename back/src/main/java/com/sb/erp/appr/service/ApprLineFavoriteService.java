package com.sb.erp.appr.service;

import java.util.List;

import com.sb.erp.appr.dto.request.ApprLineFavoriteRequest;
import com.sb.erp.appr.dto.response.ApprLineFavoriteResponse;

public interface ApprLineFavoriteService {
	
	public List<ApprLineFavoriteResponse> recommend(Long deptId, Long forId, Long empId);
	public Long saveOrIncrement(ApprLineFavoriteRequest req);
	public void delete(Long favId);
}
