package com.sb.erp.appr.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprDocRequest {
	
	@NotNull(message = "양식을 선택해주세요.")
	private Long forId;
	
	@NotNull(message = "양식을 선택해주세요.")
	private Long forVersion;
	
	@NotBlank(message = "문서 제목을 입력해주세요.")
	private String docTitle;
	
	@NotBlank(message = "문서 내용을 입력해주세요.")
	private String docContent;
	
	private boolean isImportant;
	
	// 결재선 순서대로 emp id 나열
	@NotEmpty(message = "결재선을 문서 타입에 맞게 지정해주세요.")
	private List<Long> approverEmpIds;
}
