package com.sb.erp.auth.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.auth.dto.response.AuthResponse;
import com.sb.erp.auth.dto.response.AuthUserResponse;

@Mapper
public interface AuthMapper {
	// 로그인 시 이메일 기준으로 사원+권한+회사 정보 조회
	AuthUserResponse readAuth(@Param("username") String username);

	// EmpId 기준 보유 권한(콤마 구분 문자열) 조회 - RefreshToken 재발급 시 사용
	List<AuthResponse> findAuthByEmpId(long empId);

	// EmpId 기준으로 사원+권한+회사 정보 조회 - RefreshToken 재발급 시 accessToken 전체 클레임 재구성용
	AuthUserResponse readAuthByEmpId(@Param("empId") long empId);
}