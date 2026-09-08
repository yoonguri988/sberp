package com.sb.erp.appr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "에러 응답")
public class ApprFormErrorResponse {
	
	private String message;
	
	public static ApprFormErrorResponse of(String message) {
		return ApprFormErrorResponse.builder()
				.message(message)
				.build();
	}
}
