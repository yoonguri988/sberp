package com.sb.erp.emp.chatbot.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 답변의 근거가 된 HR 규정 - 응답 안에 포함되는 근거 조항
// 원문 전체가 아니라 발췌(snippet)만
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrAiReferenceResponse {

    private Long chunkId; // 청크 PK — 프론트에서 리스트 렌더링 시 key로 사용
    private String article;	// "제6조(연차)" 사원에게 "어디에 근거한 답변인지" 보여줌
    private Integer page;	// 원본 PDF 페이지 수 — "원문 확인하려면 3페이지 참고" 안내용
    private String snippet; // chunkText 앞부분 발췌 — 전체 원문 대신 미리보기만 노출
    private Double similarity; // 코사인 유사도(0~1) — 답변 신뢰도 참고용
}

/*
snippet을 따로 두는 이유: chunkText 전체는 수백 자가 될 수 있기 때문에
API 응답에 그대로 내리면 불필요하게 무거워질 수 있다.
Service 계층에서 앞 100~150자만 잘라서 넣어준다.
*/