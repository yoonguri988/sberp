package com.sb.erp.global.integration.openAi;

import java.util.List;

/*
	OpenAI Chat Completions API 응답의 최상단 구조.
	- choices: 답변 후보 배열 (보통 1개, 기본 n=1)
	- 다른 필드(id, model, usage 등)는 우리가 안 써서 정의 생략
 */

public record ChatResponse(List<Choice> choices) {

    /* 첫번째 content를 안전하게 꺼내는 편의용 메서드. choices가 null이거나 비어있으면 null 반환.
     - GPT가 정상 응답 시: JSON 문자열 반환 (그 안엔 summary, sentiment 등이 담김)
     - 이상 응답 시: null → 서비스 계층에서 fallback 처리
     */
    public String firstContent() {
        if (choices == null || choices.isEmpty()) {
            return null;
        }
        ChatMessage msg = choices.get(0).message();
        return msg == null ? null : msg.content();
    }
        
}
/*
record에서도 일반 메서드를 추가할 수 있다.

ChatResponse resp = ...;
String content = resp.firstContent();   // 인스턴스 메서드
ChatMessage msg = ChatMessage.system("..."); // 정적 팩토리

record는 불변 데이터 상자지만, 그 데이터를 편리하게 다루는 행위 메서드를 추가할 수 있다. 
다만 setter처럼 필드를 바꾸는 메서드는 못 만든다. (final)

*/