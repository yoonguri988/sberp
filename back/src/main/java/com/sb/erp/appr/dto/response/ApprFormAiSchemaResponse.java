package com.sb.erp.appr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "AI 결재 양식 스키마 생성 결과")
public class ApprFormAiSchemaResponse {
	
	private boolean success;
	private String schema;
	private String message;
	
	public static ApprFormAiSchemaResponse success(String schema) {
		return ApprFormAiSchemaResponse.builder()
				.success(true)
				.schema(schema)
				.build();
	}
	
	public static ApprFormAiSchemaResponse fail(String message) {
		return ApprFormAiSchemaResponse.builder()
				.success(false)
				.message(message)
				.build();
	}
}
