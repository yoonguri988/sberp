package com.sb.erp.perm.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter @Getter
public class PermRequest {
	private long autId;

	@NotBlank(message = "권한명은 필수입니다.")
	private String autName;

	// 컨트롤러가 AuthUserJwtService에서 꺼내 서비스에 파라미터로 전달, 서비스가 여기 세팅
	private long comId;
}
