package com.sb.erp.api.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
public class BizNoVerifyRequest {
	private String bizNo;
	private String startDt;
	private String ceoName;
}
