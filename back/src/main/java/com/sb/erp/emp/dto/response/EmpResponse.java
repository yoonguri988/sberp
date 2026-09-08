package com.sb.erp.emp.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class EmpResponse {

	// ─── 사원 기본 정보 ───
	private Long empId;
	private String empNo;
	private String empName;
	private String empEmail;
	private String empMobile;
	private String empStatus;
	private String hireDate;
	private String createdAt;

	// ─── FK (수정 시 원본값 유지용) ───
	private Long deptId;
	private Long posId;
	private Long comId;

	// ─── 조인 조회용 표시 필드 ───
	private String posName;
	private String deptName;
	private String comName;
}