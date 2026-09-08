package com.sb.erp.appr.dto.request;


import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprLineDelegationRequest {
	
	@NotNull(message = "위임할 결재선을 선택해주세요")
	private Long linId;
	
	@NotNull(message = "대결자를 지정해주세요.")
	private Long newEmpId;
	
	private String reqReason;
}
