package com.sb.erp.apct.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApplicantRequest {
	
	public interface OnCreate {}   // 지원(apply) 시에만 적용될 그룹

    @NotNull(message = "채용공고 ID는 필수입니다", groups = OnCreate.class)
    private Long recId;

    @NotBlank(message = "지원자 이름은 필수입니다")
    private String apctName;

    private String apctEmail;

    @NotBlank
    private String apctPhone;
}