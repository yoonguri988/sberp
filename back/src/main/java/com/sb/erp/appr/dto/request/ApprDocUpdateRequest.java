package com.sb.erp.appr.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprDocUpdateRequest {

	@NotBlank(message = "문서 제목을 입력해주세요.")
	private String docTitle;
	
	@NotBlank(message = "문서 내용을 입력해주세요.")
	private String docContent;
	
	// 낙관적 락 체크용
	@NotNull(message = "잘못된 요청입니다.")
	private Long docRevision;
}
