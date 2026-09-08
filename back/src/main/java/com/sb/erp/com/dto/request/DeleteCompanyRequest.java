package com.sb.erp.com.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
public class DeleteCompanyRequest {
	@NotBlank(message = "비밀번호는 필수입니다.")
	private String password;
}
 