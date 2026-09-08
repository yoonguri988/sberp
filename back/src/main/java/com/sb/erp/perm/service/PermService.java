package com.sb.erp.perm.service;

import java.util.List;

import com.sb.erp.perm.dto.request.EmpAuthRequest;
import com.sb.erp.perm.dto.request.PermRequest;
import com.sb.erp.perm.dto.response.EmpAuthResponse;
import com.sb.erp.perm.dto.response.PermResponse;

public interface PermService {

	// ─── 로그인 시 사원 권한 조회 (기존 유지) ───
	// 로그인 처리 중 호출되므로 comId 미적용 (아직 세션이 없음)
	PermResponse selectByEmpId(long empId);


	// ─── 권한 관리 ────────────────
	List<PermResponse> selectAll(Long comId);

	PermResponse selectOneById(long autId, Long comId);

	int insert(PermRequest dto, Long comId);

	int update(PermRequest dto, Long comId);

	int delete(long autId, Long comId);


	// ─── 사원-권한 매핑 ───────────────
	List<EmpAuthResponse> selectEmpsByAuthId(long autId, Long comId);

	List<EmpAuthResponse> selectAuthsByEmpId(long empId, Long comId);

	// 권한 부여. 반환: 1=성공, 0=권한 회사 소속 아님
	int grantAuth(EmpAuthRequest dto, Long comId);

	// 권한 회수. 반환: 1=성공, 0=대상 없음
	int revokeAuth(EmpAuthRequest dto, Long comId);
}
