package com.sb.erp.eval.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter @Getter
public class PeriodRequest {
	private long periodId;
	private long comId;

	// primitive int — @NotNull 불가. Integer로 바꾸면 검증 가능
	private int evalYear;

	@NotBlank(message = "평가 학기는 필수입니다.")
	private String evalTerm;

	@NotBlank(message = "평가 제목은 필수입니다.")
	private String title;

	@NotBlank(message = "시작일은 필수입니다.")
	private String startDate;

	@NotBlank(message = "종료일은 필수입니다.")
	private String endDate;

	// 상태는 서비스에서 초기값(준비) 세팅
	private String periodStatus;
}
