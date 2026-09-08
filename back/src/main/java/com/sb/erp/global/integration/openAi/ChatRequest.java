package com.sb.erp.global.integration.openAi;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * OpenAI Chat Completions API 요청 바디.
 * - model: 사용할 GPT 모델 이름 (application.properties에서 주입)
 * - messages: 대화 메시지 배열 (system + user 조합)
 * - responseFormat: JSON mode 활성화 → 잡담 없이 순수 JSON만 응답
 * - temperature: 0.3 (일관된 리포트 생성)
 */

public record ChatRequest(String model, 
		List<ChatMessage> messages,
		@JsonProperty("response_format") ResponseFormat responseFormat,
		//JSON 필드명과 자바 필드명이 다를 때 매핑 @JsonProperty 사용
		double temperature) {
	
	
	public record ResponseFormat(String type) {
		// JSON mode 전용 정적 팩토리 메서드
		public static ResponseFormat jsonObject() {
			return new ResponseFormat("json_object");
		}
	}
	
	/* response_format 필드의 값 구조.
    OpenAI 스펙상 { "type": "json_object" } 형태여야 함.
    별도 record로 안 빼고 record 안에 중첩으로 정의. 
    
    ResponseFormat은 오직 ChatRequest에서만 사용하므로 여기에
    */
	
}


/*

{
"model": "gpt-4o-mini",
"messages": [ ... ],
"response_format": { "type": "json_object" },
"temperature": 0.3
}

## OpenAI가 제공하는 옵션 / JSON mode 
GPT가 유효한 JSON을 반환하도록, 파싱 실패 위험 줄이기
필수 조건: 프롬프트 어딘가에 "JSON"이라는 단어가 반드시 포함되어야 함. 


## temperature — GPT의 창의성 조절
0.0 ~ 2.0 사이 숫자. 낮을수록 일관성/정확성, 높을수록 창의성/다양성.
0.3은 대체로 일관적이나 약간의 변화가 있음 : 인사평가 리포트, 요약 ⭐
*/