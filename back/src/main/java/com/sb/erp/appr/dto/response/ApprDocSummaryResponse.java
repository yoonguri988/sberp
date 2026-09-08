package com.sb.erp.appr.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApprDocSummaryResponse {
	private Long docId;
	private String docTitle;
	private Long empId;
	private String empName;
	private String docStatus;
	private boolean isImportant;
	private String createdAt;
	private String linStatus;
}
