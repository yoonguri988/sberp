package com.sb.erp.appr.dto.response;

import com.sb.erp.appr.entity.ApprForm;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApprFormResponse {
	private Long forId;
	private Long forVersion;
	private Long comId;
	private String comName;
	private String forCode;
	private String forTitle;
	private String forContent;
	private String forSchema;
	private Boolean forStatus;
	private String createdAt;
	private String updatedAt;
	private boolean deleted;
	private String forCategory;
	
	// JPA 경로 - Entity에서 변환
	public ApprFormResponse(ApprForm form) {
		this.forId = form.getForId();
		this.forVersion = form.getForVersion();
		this.comId = form.getCompany().getComId();
		this.comName = form.getCompany().getComName();
		this.forCode = form.getForCode();
		this.forTitle = form.getForTitle();
		this.forContent = form.getForContent();
		this.forSchema = form.getForSchema();
		this.forStatus = form.getForStatus();
		this.createdAt = form.getCreatedAt() != null ? form.getCreatedAt().toString() : null;
		this.updatedAt = form.getUpdatedAt() != null ? form.getUpdatedAt().toString() : null;
		this.forCategory = form.getForCategory();
	}
}
