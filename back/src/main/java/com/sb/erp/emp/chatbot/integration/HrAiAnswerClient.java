package com.sb.erp.emp.chatbot.integration;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

/* 

★HR 규정 안내 도우미
HR 규정 근거 조항을 바탕으로 사원 질문에 답하는 GPT 호출 클라이언트(RAG 파이프라인의 Generation 단계).

급여파트의 SalAiAnswerClient(급여 규정 안내)와 구조는 같으나,
시스템 프롬프트가 HR 규정 도우미 버전으로 교체된다.

환각 방지 내용:
① 시스템 프롬프트: "근거 조항 밖의 내용은 답하지 말라"
② HrAiChatService: 유사도 임계값을 넘는 조항이 없으면 이 클래스를 호출하지 않음

*/
@Component
@Slf4j
public class HrAiAnswerClient {

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    /*
     HR 규정 도우미 시스템 프롬프트.
     급여 파트의 SalAiAnswerClient와 동일한 환각 방지 전략을 따르되, 도메인만 "HR 규정"(근태·연차·복리후생·복장·보안 등)으로 변경.
     답변 불가 시 안내 문구에 "인사팀 문의"를 명시할 것
     */
    private static final String SYSTEM_PROMPT = """
            당신은 사내 ERP의 HR 규정 안내 도우미입니다.
            아래 사용자 메시지에 "근거 조항"으로 주어지는 내용 안에서만 답변하고,
            근거 조항에 없는 내용은 절대 추측하거나 지어내지 않습니다.
            근거 조항만으로 답할 수 없으면 "제공된 규정에서 근거를 찾을 수 없습니다. 인사팀에 문의해 주세요."라고만 답합니다.
            답변은 한국어로 3~5문장 이내로 간결하게 작성하며, 실제로 답변에 사용한 조항 번호를 문장 안에 함께 언급합니다.
            """;

    // ─── OPENAI_API_KEY 설정 ───
    @Value("${jsj.openai.api.key}")
    private String apiKey;

    @Value("${jsj.openai.api.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;
    
    // ① 생성: Spring이 주입해주는 Builder로 baseUrl만 지정해서 만듦
    public HrAiAnswerClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(API_URL).build();
    }

    /*
     GPT에 근거 조항 + 질문을 전달하고 답변을 받는다.
     @param question    사원이 입력한 질문
     @param contextText 검색된 근거 조항들을 "제n조(...): 내용" 형식으로 이어붙인 문자열
     @return GPT 답변 텍스트. 호출 실패 시 null 반환
     (null이면 호출부인 HrAiChatService에서 fallback 안내문으로 대체)
     */
    public String answer(String question, String contextText) {

        // 유저 프롬프트: 근거 조항 + 질문을 구분해서 GPT에 전달
        String userPrompt = "근거 조항:\n" + contextText + "\n\n질문: " + question;

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.2,	// 낮은 temperature = 일관된 답변 (창의성보다 정확성 우선)
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        try { // ② 호출: 체이닝 방식으로 HTTP 요청을 조립
            String responseBody = restClient.post() 
            		// .post() — HTTP POST 요청을 시작. baseUrl로 POST를 보냄
                    .contentType(MediaType.APPLICATION_JSON) // 요청 본문이 JSON이라고 서버에 알려줌
                    .header("Authorization", "Bearer " + apiKey) // OpenAI가 요구하는 API 키 인증
                    .body(body)	// 요청 본문, Java의 Map을 JSON으로 자동 직렬화해서 요청 본문에 넣음
                    .retrieve()	// 실제 요청 실행
                    .body(String.class); // 응답 본문을 String으로 받음. 이후 ObjectMapper로 직접 파싱

            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0)
                                 .path("message").path("content").asText();

            return (content == null || content.isBlank()) ? null : content.trim();

        } catch (Exception e) {
            // AI 호출 실패가 전체 기능을 막으면 안 됨 → null 반환은 유지하되,
            // 로그를 남기지 않으면 OpenAI 장애/키 만료/rate limit이
            // "규정에 근거 없음"과 구분되지 않아 운영 모니터링에 안 잡힌다.
            // 질문 원문에는 개인정보가 섞일 수 있으므로 길이만 기록한다.
            log.error("[HrAiAnswer] GPT 호출 실패 model={}, questionLen={}",
                    model, question == null ? 0 : question.length(), e);
            return null;
        }
    }
}