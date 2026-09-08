package com.sb.erp.emp.chatbot.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
HR 규정 AI 챗봇 답변 - 질문에 대한 즉시 응답
grounded=false면 근거 조항을 찾지 못해 GPT를 아예 호출하지 않고 고정 안내문(answer)을 반환한 것이다.
(환각 방지 + 불필요한 API 비용 절감)
*/
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrAiChatResponse {

    private Long logId; // 저장된 이력 PK - 프론트에서 고유 키로 사용
    private String answer; // AI가 생성한 답변, 또는 grounded=false일 때 고정 안내문
    private boolean grounded; // true=근거 조항 기반 답변 / false=근거 못 찾음
    private List<HrAiReferenceResponse> references; // 답변의 근거가 된 조항 목록 (0~N개)
    
}
