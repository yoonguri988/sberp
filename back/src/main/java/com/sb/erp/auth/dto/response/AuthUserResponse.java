package com.sb.erp.auth.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthUserResponse {
	
	private String empNo;
	private String empName;
	private String empEmail;
	private String empPass;
	private String posName;
	private String comName;
	private List<AuthResponse> authList;

	private long empId;
	private long comId;
	private long deptId;
	private long posId;

	// 'Y'면 비밀번호가 아직 사번(임시 비밀번호) 상태 → 로그인 시 비밀번호 변경 강제
	private String mustChangePwd;

	// AuthController에서 매번 "Y".equalsIgnoreCase(...)로 비교하지 않도록 헬퍼 제공
	public boolean isMustChangePwd() {
		return "Y".equalsIgnoreCase(mustChangePwd);
	}

}