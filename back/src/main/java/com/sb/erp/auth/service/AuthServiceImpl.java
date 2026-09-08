package com.sb.erp.auth.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sb.erp.auth.dto.response.AuthResponse;
import com.sb.erp.auth.dto.response.AuthUserResponse;
import com.sb.erp.auth.repository.AuthMapper;


@Service
public class AuthServiceImpl implements AuthService {
	@Autowired AuthMapper dao;

	@Override
	public AuthUserResponse readAuth(String username) {
		AuthUserResponse user = dao.readAuth(username);
		if (user == null) {
			throw new IllegalArgumentException("사용자를 찾을 수 없습니다: " + username);
		}
		return user;
	}

	@Override
	public List<String> findAuthByUserId(long empId) {
		List<AuthResponse> auths = dao.findAuthByEmpId(empId);
		// roles 클레임 포맷(List<String>)과 동일하게 맞춰서 반환
		return auths.stream()
				.map(AuthResponse::getAutName)
				.toList();
	}

	@Override
	public AuthUserResponse readAuthByEmpId(long empId) {
		AuthUserResponse user = dao.readAuthByEmpId(empId);
		if (user == null) {
			throw new IllegalArgumentException("사용자를 찾을 수 없습니다: empId=" + empId);
		}
		return user;
	}
}