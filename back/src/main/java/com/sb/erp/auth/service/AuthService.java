package com.sb.erp.auth.service;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.sb.erp.auth.dto.response.AuthUserResponse;

public interface AuthService {
	//  로그인 시 이메일 기준으로 사원+권한+회사 정보 조회
	AuthUserResponse readAuth(@Param("username") String username);

	// EmpId 기준 보유 권한 목록 조회 - RefreshToken 재발급 시 roles 클레임 재구성용
	List<String> findAuthByUserId(long empId);

	// EmpId 기준 사원+권한+회사 정보 조회 - RefreshToken 재발급 시 accessToken의 전체 클레임(comId, empName 등) 재구성용
	AuthUserResponse readAuthByEmpId(long empId);
}