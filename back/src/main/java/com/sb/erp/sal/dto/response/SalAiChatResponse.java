package com.sb.erp.sal.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AI 급여 Q&A 답변.
 * grounded=false면 유사도 임계값을 넘는 근거 조항을 찾지 못해 GPT를 아예 호출하지 않고
 * 고정 안내문(answer)을 반환한 것이다(환각 방지 + 불필요한 API 비용 절감).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAiChatResponse {

    private Long logId;
    private String answer;
    private boolean grounded;
    private List<SalAiReferenceResponse> references;
}
