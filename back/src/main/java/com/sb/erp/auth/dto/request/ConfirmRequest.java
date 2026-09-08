package com.sb.erp.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ConfirmRequest {
	String empNo;
	String empEmail;
	String empMobile;
	
}
