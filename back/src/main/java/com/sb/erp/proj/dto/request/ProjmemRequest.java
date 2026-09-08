package com.sb.erp.proj.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProjmemRequest {
    @NotNull(message = "프로젝트는 필수입니다.")
    private Long projectProId;

    @NotNull(message = "사원은 필수입니다.")
    private Long empId;

    @NotBlank(message = "프로젝트 역할은 필수입니다.")
    private String memberRole;

}
