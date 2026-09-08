package com.sb.erp.rsm.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeRequest {

    @NotNull(message = "지원자 ID는 필수입니다")
    private Long apctId;
}