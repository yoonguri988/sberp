package com.sb.erp.appr.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprFormRequest {
	
	//@NotNull(message = "회사를 선택해주세요.")
	private Long comId;
	
	@NotBlank(message = "양식 코드를 입력해주세요.")
	private String forCode;
	
	@NotBlank(message = "양식 제목을 입력해주세요.")
	private String forTitle;
	
	private String forContent;
	private String forSchema;
	private Boolean forStatus;
	private String forCategory;
}
