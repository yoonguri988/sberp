package com.sb.erp.appr.dto.response;

import com.sb.erp.appr.entity.ApprLog;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
public class ApprLogResponse {
	private Long logId;
	private Long docId;
	private Long oriEmpId;
	private String oriEmpName;
	private Long actEmpId;
	private String actEmpName;
	private Long perEmpId;
	private String perEmpName;
	private String createdAt;
	
	public ApprLogResponse(ApprLog log) {
		this.logId = log.getLogId();
		this.docId = log.getApprDoc().getDocId();
		this.oriEmpId = log.getOriEmp().getEmpId();
		this.oriEmpName = log.getOriEmp().getEmpName();
		this.actEmpId = log.getActEmp().getEmpId();
		this.actEmpName = log.getActEmp().getEmpName();
		this.perEmpId = log.getPerEmp().getEmpId();
		this.perEmpName = log.getPerEmp().getEmpName();
		this.createdAt = log.getCreatedAt() != null ? log.getCreatedAt().toString() : null;
	}
}
