package com.sb.erp.emp.dto.request;

import lombok.Getter;
import lombok.Setter;

@Setter @Getter
public class PasswordChangeRequest {
	private String currentPass;
	private String newPass;
	private String checkPass;
}
