package com.sb.erp.emp.dto;

import lombok.Data;

@Data
public class EmpAuthDto {
	
	// ─── 사원 정보 ────────────
	private int empId;
	private String empName;
	private String empNo;
	
	// ─── 권한 ─────────────────
	private int autId;      
	private String autName; 
	private int empAutId;
	
	// ─── FK ─────────────────
	private int deptId; // FK
	private int posId; // FK
	private int comId; // FK
	
	// ─── 직급/부서 ─────────────
	private String posName;
	private String deptName;
	
	
}
