package com.sb.erp.appr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "양식 코드 중복 확인 결과")
public class CodeCheckResponse {
	
	@Schema(description = "true = 사용가능 / false = 이미 사용중")
	private boolean available;
	
	public static CodeCheckResponse of(boolean available) {
		return CodeCheckResponse.builder()
				.available(available)
				.build();
	}

}
