package com.sb.erp.emp.chatbot.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.emp.chatbot.entity.HrAiChatLog;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 사용자와 HR AI 챗봇 대화 - 본인의 과거 대화 이력 조회
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrAiChatHistoryResponse {

    private Long logId;			// 저장된 이력 PK — 프론트에서 고유 키로 사용
    private String question;	// 사용자가 작성한 질문
    private String answer;		// AI가 생성한 답변
    private boolean grounded;	// true=근거 조항 기반 답변 / false=근거 못 찾음
    private LocalDateTime createdAt; // 질문 시각 — 프론트에서 "2026-08-25 14:30" 형태로 표시

    public static HrAiChatHistoryResponse from(HrAiChatLog entity) {
        return HrAiChatHistoryResponse.builder()
                .logId(entity.getLogId())
                .question(entity.getQuestion())
                .answer(entity.getAnswer())
                .grounded(entity.isGrounded())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

/*
from() 정적 팩토리 메서드 : 
Service에서 entity.getLogId(), entity.getQuestion()... 
일일이 세팅하는 코드를 쓰지 않고 HrAiChatHistoryResponse.from(entity) 한 줄로 변환하기 위해

추가로 이력 목록은 언제 뭘 물어봤고 뭐라고 답했는지에 대한 이력 목록만 보여주는 용도라 
근거 조항(references)까지 다시 내려줄 필요가 없다
*/