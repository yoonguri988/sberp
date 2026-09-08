package com.sb.erp.appr.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprFormDelegationConfig.java 참고
@Getter
@Setter
public class ApprFormDelegationConfigRequest {
	
	@NotNull(message = "양식을 선택해주세요.")
	private Long forId;
	
	@NotNull(message = "양식 버전을 선택해주세요.")
	private Long forVersion;
	
	@NotNull(message = "활성화 여부를 선택해주세요.")
	private Boolean enabled;
	
	@NotBlank(message = "시작일 필드를 매핑해주세요.")
	private String startFieldId;
	
	@NotBlank(message = "종료일 필드를 매핑해주세요.")
	private String endFieldId;
	
	@NotBlank(message = "수임자 필드를 매핑해주세요.")
	private String delegateFieldId;
	
	@NotNull(message = "최소 적용 일수를 입력해주세요.")
	@Min(value = 1, message = "최소 적용 일수는 1일 이상이어야 합니다.")
	private Integer minTriggerDays;
}
