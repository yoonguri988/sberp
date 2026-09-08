package com.sb.erp.global.integration;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * 급여 규정 근거 조항을 바탕으로 사용자 질문에 답하는 gpt-4o-mini 호출 전용 클라이언트 (RAG의 Generation 단계).
 * cyj.openai.* 설정(OpenAiRecomClient/OpenAiReturnMsg와 동일 네임스페이스)을 그대로 재사용한다.
 *
 * 환각 방지 핵심:
 *  1) 시스템 프롬프트로 "제공된 근거 조항 밖의 내용은 답하지 말라"를 강제.
 *  2) 애초에 유사도 임계값을 넘는 근거 조항이 없으면 SalAiChatService가 이 클래스를 호출조차 하지 않는다.
 */
@Component
public class SalAiAnswerClient {

    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
            너는 사내 ERP의 급여 규정 안내 도우미다.
            아래 사용자 메시지에 "근거 조항"으로 주어지는 내용 안에서만 답변하고,
            근거 조항에 없는 내용은 절대 추측하거나 지어내지 마라.
            근거 조항만으로 답할 수 없으면 "제공된 규정에서 근거를 찾을 수 없습니다. 인사팀에 문의해 주세요."라고만 답하라.
            답변은 한국어로 3~5문장 이내로 간결하게 작성하고, 실제로 사용한 조항 번호를 문장 안에 함께 언급하라.
            """;

    @Value("${cyj.openai.api.key}")
    private String apiKey;

    @Value("${cyj.openai.model}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    public SalAiAnswerClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(API_URL).build();
    }

    /**
     * @param question    사용자 질문
     * @param contextText 검색된 근거 조항들을 "제n조(...): 내용" 형식으로 이어붙인 문자열
     * @return GPT 답변. 호출 실패 시 null을 반환한다(AI 실패가 전체 흐름을 막으면 안 되므로,
     *         호출부(SalAiChatService)에서 fallback 안내문으로 대체 처리).
     */
    public String answer(String question, String contextText) {
        String userPrompt = "근거 조항:\n" + contextText + "\n\n질문: " + question;

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.2,
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        try {
            String responseBody = restClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + apiKey)
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            return (content == null || content.isBlank()) ? null : content.trim();
        } catch (Exception e) {
            return null; // fallback 메시지는 SalAiChatService에서 처리
        }
    }
}
