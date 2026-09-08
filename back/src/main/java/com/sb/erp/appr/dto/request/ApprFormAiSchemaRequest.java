package com.sb.erp.appr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "AI 결재 양식 스키마 생성 요청")
public class ApprFormAiSchemaRequest {
	
	@NotBlank(message = "생성할 양식에 대한 설명을 입력해주세요")
	@Schema(description = "사용자가 입력한 양식 설명 프롬프트", example ="휴가 신청서")
	private String prompt;

}
