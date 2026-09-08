package com.sb.erp.emp.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter @Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmpRequest {
	private Long empId;

	@NotBlank(message = "사번은 필수입니다.")
	private String empNo;

	// 등록 시엔 서비스가 사번으로 자동 세팅. 비밀번호 변경 API에서만 필요.
	// 그래서 @NotBlank 붙이면 일반 update 시나리오가 튕김 → 검증 skip
	private String empPass;

	@NotBlank(message = "이름은 필수입니다.")
	private String empName;

	@NotBlank(message = "이메일은 필수입니다.")
	@Email(message = "올바른 이메일 형식이 아닙니다.")
	private String empEmail;

	@NotBlank(message = "휴대폰 번호는 필수입니다.")
	private String empMobile;

	// 등록 시 서비스에서 "재직" 기본값 세팅
	private String empStatus;

	// 비밀번호 변경 API에서만 서비스가 세팅("Y"/"N"). 사용자 입력 검증 대상 아님.
	private String mustChangePwd;

	// 선택 입력. 관리자가 수정 시 지정
	private String hireDate;

	// FK — URL 또는 세션에서 세팅. 사용자 입력 검증 대상 아님
	private Long posId;
	private Long deptId;
	private Long comId;

}