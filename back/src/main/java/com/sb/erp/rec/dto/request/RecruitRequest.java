package com.sb.erp.rec.dto.request;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class RecruitRequest {

    @Schema(hidden = true)
    private Long recId;

    @NotBlank(message = "공고 제목은 필수입니다.")
    private String recTitle;

    @NotBlank(message = "모집 부서는 필수입니다.")
    private String recDepartment;

    @NotBlank(message = "모집 직무는 필수입니다.")
    private String recPosition;

    @NotNull(message = "모집 인원은 필수입니다.")
    @Positive(message = "모집 인원은 1명 이상이어야 합니다.")
    private Long recHeadcount;

    @NotBlank(message = "고용 형태는 필수입니다.")
    private String recEmploymentType;

    private String recDescription;

    @NotNull(message = "접수 시작일은 필수입니다.")
    private LocalDateTime recStartDate;

    private LocalDateTime recEndDate;

    @NotBlank(message = "공고 상태는 필수입니다.")
    @Pattern(regexp = "^(OPEN|CLOSED|CANCELLED)$", message = "상태는 OPEN, CLOSED, CANCELLED만 가능합니다.")
    private String recStatus;

    // comId, empId 필드 자체 없음 — JWT에서 세팅
}