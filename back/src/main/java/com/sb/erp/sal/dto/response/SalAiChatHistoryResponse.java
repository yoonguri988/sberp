package com.sb.erp.sal.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalAiChatLog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 본인 AI 급여 Q&A 대화 이력 한 건. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAiChatHistoryResponse {

    private Long logId;
    private String question;
    private String answer;
    private boolean grounded;
    private LocalDateTime createdAt;

    public static SalAiChatHistoryResponse from(SalAiChatLog entity) {
        return SalAiChatHistoryResponse.builder()
                .logId(entity.getLogId())
                .question(entity.getQuestion())
                .answer(entity.getAnswer())
                .grounded(entity.isGrounded())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
