package com.sb.erp.appr.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprLineActionRequest {
	
	// @Pattern 의 regexp는 정규 표현식
	// 입력한 값의 문자열의 패턴에 맞는지 검증
	// 아래 APP, REJ 둘중 한개의 값만 허용한다는 의미
	@Pattern(regexp = "APP|REJ", message = "action은 APP 또는 REJ만 가능합니다.")
	private String action;
}
