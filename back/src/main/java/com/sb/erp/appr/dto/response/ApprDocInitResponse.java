package com.sb.erp.appr.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApprDocInitResponse {
	private Long empId;
	private String empName;
	private String posName;
	private int posOrder;
	private Long comId;
	private String comName;
	private Long deptId;
	private String deptName;
}
