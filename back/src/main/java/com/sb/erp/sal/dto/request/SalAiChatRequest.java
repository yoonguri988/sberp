package com.sb.erp.sal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** AI 급여 Q&A 질문 요청. 필드명은 API 명세와 1:1로 동일하다(JSON 키도 동일). */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAiChatRequest {

    @NotBlank(message = "질문 내용은 필수입니다.")
    private String question;
}
