package com.sb.erp.appr.dto.response;

import com.sb.erp.appr.entity.ApprDoc;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApprDocResponse {
	private Long docId;
	private Long forId;
	private Long forVersion;
	private String forTitle;
	private String forSchema;
	private String forContent;
	private Long empId;
	private String empName;
	private Long comId;
	private String docTitle;
	private String docContent;
	private String docStatus;
	private boolean isImportant;
	private Long docRevision;
	private String createdAt;
	private String updatedAt;
	
	public ApprDocResponse(ApprDoc doc) {
		this.docId = doc.getDocId();
		this.forId = doc.getApprForm().getForId();
		this.forVersion = doc.getApprForm().getForVersion();
		this.forTitle = doc.getApprForm().getForTitle();
		this.forSchema = doc.getApprForm().getForSchema();
		this.forContent = doc.getApprForm().getForContent();
		this.empId = doc.getEmployee().getEmpId();
		this.empName = doc.getEmployee().getEmpName();
		this.comId = doc.getCompany().getComId();
		this.docTitle = doc.getDocTitle();
		this.docContent = doc.getDocContent();
		this.docStatus = doc.getDocStatus();
		this.isImportant = doc.isImportant();
		this.docRevision = doc.getDocRevision();
		this.createdAt = doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null;
		this.updatedAt = doc.getUpdatedAt() != null ? doc.getUpdatedAt().toString() : null;
	}
	
	
}
