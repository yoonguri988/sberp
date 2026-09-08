package com.sb.erp.global.integration.openAi;

import java.math.BigDecimal;

/* GPT가 생성한 리포트 콘텐츠 (JSON 문자열 안의 구조).

1. OpenAI 응답 flow:
	- HTTP body      → ChatResponse (첫 파싱: RestClient 자동)
	- choice.message.content (String) → ReportContent (둘째 파싱: ObjectMapper 수동)

2. GPT에게 이런 JSON을 반환하라고 프롬프트에서 지시:
	{
		"summary": "요약문...",
	"sentimentPositive": 0.70,
	"sentimentNeutral": 0.25,
	 "sentimentNegative": 0.05
	}

 */
public record ReportContent(
    String summary,
    BigDecimal sentimentPositive,
    BigDecimal sentimentNeutral,
    BigDecimal sentimentNegative
) { }