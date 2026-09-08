package com.sb.erp.apct.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class ApplicantStatusUpdateRequest { // 지원자 상태 변경 검증용

    @NotBlank(message = "변경할 상태값은 필수입니다.")
    @Pattern(regexp = "^(RECEIVED|SCREENING|INTERVIEW|HIRED|REJECTED)$", message = "유효하지 않은 상태입니다.")
    private String apctStatus;
}