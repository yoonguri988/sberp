package com.sb.erp.appr.dto.response;

import com.sb.erp.appr.entity.ApprLineRequest;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApprLineDelegationResponse {
	private Long reqId;
	private Long docId;
	private String docTitle;
	private Long linId;
	private Long oriEmpId;
	private String oriEmpName;
	private Long newEmpId;
	private String newEmpName;
	private Long reqEmpId;
	private String reqEmpName;
	private Long proEmpId;
	private String proEmpName;
	private String reqReason;
	private String reqStatus;
	private String createdAt;
	private String processedAt;
	
	public ApprLineDelegationResponse(ApprLineRequest req) {
		this.reqId = req.getReqId();
		this.docId = req.getApprDoc().getDocId();
		this.docTitle = req.getApprDoc().getDocTitle();
		this.linId = req.getApprLine().getLinId();
		this.oriEmpId = req.getOriEmp().getEmpId();
		this.oriEmpName = req.getOriEmp().getEmpName();
		this.newEmpId = req.getNewEmp() != null ? req.getNewEmp().getEmpId() : null;
		this.newEmpName = req.getNewEmp() != null ? req.getNewEmp().getEmpName() : null;
		this.reqEmpId = req.getReqEmp().getEmpId();
		this.reqEmpName = req.getReqEmp().getEmpName();
		this.proEmpId = req.getProEmp() != null ? req.getProEmp().getEmpId() : null;
		this.proEmpName = req.getProEmp() != null ? req.getProEmp().getEmpName() : null;
		this.reqReason = req.getReqReason();
		this.reqStatus = req.getReqStatus();
		this.createdAt = req.getCreatedAt() != null ? req.getCreatedAt().toString() : null;
		this.processedAt = req.getProcessedAt() != null ? req.getProcessedAt().toString() : null;
	}
	
	
}
