package com.sb.erp.global.integration.openAi;

/**
 * OpenAI 응답의 choices 배열 원소.
 * - message: GPT가 생성한 실제 답변 메시지
 * - 다른 필드(index, finish_reason)는 우리가 안 써서 정의 생략
 *   → Jackson은 정의된 필드만 매핑, 나머지는 무시
 */
public record Choice(ChatMessage message) { }


/*

{
"choices": [
  {                                  ← Choice 하나
    "index": 0,
    "message": { ... },
    "finish_reason": "stop"
  }
]
}

*/