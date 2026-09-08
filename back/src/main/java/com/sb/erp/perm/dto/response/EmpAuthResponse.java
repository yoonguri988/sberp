package com.sb.erp.perm.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class EmpAuthResponse {
	private Long empAutId;
	private Long empId;
	private String empName;
	private String empNo;
	private Long autId;
	private String autName;
	private String posName;
	private String deptName;
}
