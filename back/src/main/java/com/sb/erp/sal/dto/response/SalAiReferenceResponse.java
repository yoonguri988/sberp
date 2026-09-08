package com.sb.erp.sal.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** 답변의 근거가 된 조항 하나. 원문 전체가 아니라 발췌(snippet)만 내려준다. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAiReferenceResponse {

    private Long chunkId;
    private String article;    // 예: "제6조(식대)"
    private Integer page;
    private String snippet;    // chunkText 앞부분 발췌
    private Double similarity; // 코사인 유사도(0~1) - 신뢰도 참고용, 화면에는 선택적으로 노출
}
