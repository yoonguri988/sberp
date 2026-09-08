package com.sb.erp.perm.repository;


import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.perm.dto.request.EmpAuthRequest;
import com.sb.erp.perm.dto.request.PermRequest;
import com.sb.erp.perm.dto.response.EmpAuthResponse;
import com.sb.erp.perm.dto.response.PermResponse;

@Mapper
public interface PermMapper {

	// ─── 로그인 시 사원의 권한 조회 ───
	// (기존 유지)
	PermResponse selectByEmpId(long empId);


	// ─── 권한 관리 (authority) ───────
	// 회사 기준 권한 목록 (부여 사원 수 포함)
	List<PermResponse> selectAll(long comId);

	// 권한 단건 조회
	PermResponse selectOneById(@Param("autId") long autId, @Param("comId") long comId);

	// 권한 등록
	int insert(PermRequest dto);

	// 권한 수정
	int update(PermRequest dto);
	
	// 사용중인 사원 확인
	int countEmpUsing(long autId);

	// 권한 삭제
	int delete(PermRequest dto);


	// ─── 사원-권한 매핑 (emp_auth) ─────
	// 특정 권한을 가진 사원 목록
	List<EmpAuthResponse> selectEmpsByAuthId(@Param("autId") long autId, @Param("comId") long comId);

	// 특정 사원의 권한 목록
	List<EmpAuthResponse> selectAuthsByEmpId(@Param("empId") long empId, @Param("comId") long comId);

	// 권한 부여
	int grantAuth(EmpAuthRequest dto);

	// 권한 회수
	int revokeAuth(EmpAuthRequest dto);


}

