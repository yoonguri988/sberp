package com.sb.erp.appr.dto.response;

import com.sb.erp.appr.entity.ApprFormDelegationConfig;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprFormDelegationConfig.java 참고
@Getter
@Setter
@NoArgsConstructor
public class ApprFormDelegationConfigResponse {
	
	private Long cfgId;
	private Long forId;
	private Long forVersion;
	private String forTitle;
	private boolean enabled;
	private String startFieldId;
	private String endFieldId;
	private String delegateFieldId;
	private Integer minTriggerDays;
	private String createdAt;
	private String updatedAt;
	
	public ApprFormDelegationConfigResponse(ApprFormDelegationConfig cfg) {
		this.cfgId = cfg.getCfgId();
		this.forId = cfg.getApprForm().getForId();
		this.forVersion = cfg.getApprForm().getForVersion();
		this.forTitle = cfg.getApprForm().getForTitle();
		this.enabled = cfg.isEnabled();
		this.startFieldId = cfg.getStartFieldId();
		this.endFieldId = cfg.getEndFieldId();
		this.delegateFieldId = cfg.getDelegateFieldId();
		this.minTriggerDays = cfg.getMinTriggerDays();
		this.createdAt = cfg.getCreatedAt() != null ? cfg.getCreatedAt().toString() : null;
		this.updatedAt = cfg.getUpdatedAt() != null ? cfg.getUpdatedAt().toString() : null;
	}
	
	
}
