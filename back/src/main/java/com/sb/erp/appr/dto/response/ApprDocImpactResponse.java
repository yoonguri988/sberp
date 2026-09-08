package com.sb.erp.appr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprDocImpactResponse {
	private Long docId;
	private String docTitle;
	private Long empId;
	private String empName;
	private String docStatus;
}