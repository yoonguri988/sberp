package com.sb.erp.global.integration.openAi;

/**
 * OpenAI Chat API의 메시지 단위.
 * - role: system / user / assistant
 * - content: 실제 메시지 텍스트
 *
 * 요청 messages 배열에도, 응답 choice의 message 필드에도 재사용됨.
 */

public record ChatMessage(String role, String content) {
	
	// ─── 정적 팩토리: 편의 생성자 ───
    // new ChatMessage("system", "...") 대신 ChatMessage.system("...") 로
    // 코드 읽을 때 role이 뭔지 즉시 보이게 하려는 관례.

    public static ChatMessage system(String content) {
        return new ChatMessage("system", content);
    }

    public static ChatMessage user(String content) {
        return new ChatMessage("user", content);
    }
    
}

/* 
### dto/openai/ 구성

ChatMessage.java       ← 요청/응답 공용 메시지 단위
ChatRequest.java       ← 요청 바디 (JSON mode, temperature 포함)
Choice.java            ← 응답 배열 원소
ChatResponse.java      ← 응답 최상단 (firstContent 편의 메서드)
ReportContent.java     ← content 안의 JSON (둘째 파싱 대상)


### 전체 파싱 흐름
[GPT 서버]
    │ HTTP 응답 (JSON 문자열)
    ↓
[RestClient가 자동 파싱: 1차 파싱]
    │
    ↓
ChatResponse (record 인스턴스)
    │
    │ .firstContent()
    ↓
"content 안의 JSON 문자열"
    │
    ↓
[ObjectMapper로 우리가 파싱: 2차 파싱]
    │
    ↓
ReportContent (record 인스턴스)
    │
    │ .summary(), .sentimentPositive() ...
    ↓
[EvalReportServiceImpl이 이 값을 리포트 필드에 매핑]

*/