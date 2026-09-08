package com.sb.erp.pos.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter @Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosRequest {
	private long posId;

	@NotBlank(message = "직급 코드는 필수입니다.")
	private String posCode;

	@NotBlank(message = "직급명은 필수입니다.")
	private String posName;

	// primitive int — @NotNull 불가.
	// 필수 검증이 필요하면 Integer로 변경 후 @NotNull 적용 (팀 논의 대상)
	private int posOrder;

	private long comId;
}
