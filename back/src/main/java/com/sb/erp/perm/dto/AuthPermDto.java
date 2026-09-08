package com.sb.erp.perm.dto;

import lombok.Data;

@Data
public class AuthPermDto {
	
	//공통
	private int autId;
	
	//authority
	private int comId;
	private String autName;
	private int autCount;
	
	//emp_auth
	private int empAutId;
	private int empId;
}
