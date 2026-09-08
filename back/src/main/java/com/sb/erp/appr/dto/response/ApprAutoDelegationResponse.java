package com.sb.erp.appr.dto.response;

import com.sb.erp.appr.entity.ApprAutoDelegation;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprAutoDelegation.java 참고
@Getter
@Setter
@NoArgsConstructor
public class ApprAutoDelegationResponse {

	private Long autoDelegId;
	private Long docId;
	private String docTitle;
	private Long delEmpId;
	private String delEmpName;
	private Long newEmpId;
	private String newEmpName;
	private String startDate;
	private String endDate;
	private String delegStatus;
	private String cancReason;
	private Long procEmpId;
	private String procEmpName;
	private String createdAt;
	private String processedAt;
	
	public ApprAutoDelegationResponse(ApprAutoDelegation deleg) {
		this.autoDelegId = deleg.getAutoDelegId();
		this.docId = deleg.getApprDoc().getDocId();
		this.docTitle = deleg.getApprDoc().getDocTitle();
		this.delEmpId = deleg.getDelEmp().getEmpId();
		this.delEmpName = deleg.getDelEmp().getEmpName();
		this.newEmpId = deleg.getNewEmp().getEmpId();
		this.newEmpName = deleg.getNewEmp().getEmpName();
		this.startDate = deleg.getStartDate() != null ? deleg.getStartDate().toString() : null;
		this.endDate = deleg.getEndDate() != null ? deleg.getEndDate().toString() : null;
		this.delegStatus = deleg.getDelegStatus();
		this.cancReason = deleg.getCancReason();
		this.procEmpId = deleg.getProcEmp() != null ? deleg.getProcEmp().getEmpId() : null;
		this.procEmpName = deleg.getProcEmp() != null ? deleg.getProcEmp().getEmpName() : null;
		this.createdAt = deleg.getCreatedAt() != null ? deleg.getCreatedAt().toString() : null;
		this.processedAt = deleg.getProcessedAt() != null ? deleg.getProcessedAt().toString() : null;
	}
	
}
