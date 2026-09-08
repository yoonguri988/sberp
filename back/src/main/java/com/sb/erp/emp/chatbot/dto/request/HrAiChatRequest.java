package com.sb.erp.emp.chatbot.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// HR 규정 AI 챗봇 질문 요청 - 사원이 질문을 전송할 시
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrAiChatRequest {

    @NotBlank(message = "질문 내용은 필수입니다.")
    private String question; // 사원이 입력한 질문 텍스트
}
