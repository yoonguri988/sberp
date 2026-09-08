package com.sb.erp.appr.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApprLineResponse {
	private Long linId;
	private Long docId;
	private Long empId;
	private String empName;
	private String empStatus;
	private String posName;
	private int posOrder;
	private int linOrder;
	private String linStatus;
	private String linApproved;
}
