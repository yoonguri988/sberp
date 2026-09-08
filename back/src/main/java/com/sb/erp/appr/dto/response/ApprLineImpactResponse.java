package com.sb.erp.appr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprLineImpactResponse {
	private Long linId;
	private Long docId;
	private String docTitle;
	private Long empId;
	private String empName;
	private Integer linOrder;
	private String linStatus;
}