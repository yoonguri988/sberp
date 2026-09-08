package com.sb.erp.appr.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprAutoDelegation.java 참고
@Getter
@Setter
public class ApprAutoDelegationCancelRequest {
	
	@NotBlank(message = "취소 사유를 입력해주세요.")
	private String cancReason;
}
