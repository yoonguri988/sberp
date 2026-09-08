package com.sb.erp.com.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter @Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComRequest {
	private long comId;
	@NotBlank(message = "업종 대분류 코드는 필수입니다")
	private String industryGrpCode;

	@NotBlank(message = "업종 코드는 필수입니다")
	private String industryCode;

	@NotBlank(message = "회사명은 필수입니다")
	private String comName;

	@NotBlank(message = "대표자명은 필수입니다")
	private String comCeo;

	@NotBlank(message = "사업자번호는 필수입니다")
	@Pattern(regexp = "\\d{3}-\\d{2}-\\d{5}", message = "사업자번호 형식이 올바르지 않습니다 (예: 123-45-67890)")
	private String bizNo;

	private String comTel;  // 필수 아님
	private String comLogo; // 필수 아님
}