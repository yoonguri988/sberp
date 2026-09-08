package com.sb.erp.api.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @NoArgsConstructor
public class BizNoVerifyResponse {
	private String bizNo;
	private String startDt;
	private String ceoName;

	public BizNoVerifyResponse(String bizNo, String startDt, String ceoName) {
		super();
		this.bizNo = bizNo;
		this.startDt = startDt;
		this.ceoName = ceoName;
	}
}
