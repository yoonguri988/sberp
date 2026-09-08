package com.sb.erp.auth.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class UpdatePassRequest {
	// 비로그인 재설정 시 사용 (로그인 상태 변경 시엔 null이어도 됨)
    private String resetToken; 
    private String newPass;
}