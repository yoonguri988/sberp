package com.sb.erp.global.integration;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * OpenAI 임베딩(text-embedding-3-small) 호출 전용 클라이언트.
 * 급여 규정 문서 청크 적재(SalPlcyDocService)와 질문 임베딩(SalAiChatService) 양쪽에서 공용으로 쓴다.
 *
 * cyj.openai.* 설정(OpenAiRecomClient/OpenAiReturnMsg와 동일 네임스페이스, application.yml 기존 값 재사용 —
 * 새 환경변수 추가 불필요)을 그대로 쓴다. 임베딩 모델은 응답 스키마가 채팅 모델과 달라 별도 엔드포인트를 쓰므로
 * 모델명은 cyj.openai.model(채팅용)과 분리해 상수로 고정한다.
 */
@Component
public class SalAiEmbeddingClient {

    private static final String API_URL = "https://api.openai.com/v1/embeddings";
    private static final String EMBEDDING_MODEL = "text-embedding-3-small";

    @Value("${cyj.openai.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    public SalAiEmbeddingClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(API_URL).build();
    }

    /** 텍스트 하나를 임베딩 벡터(double[])로 변환. 실패 시 예외를 그대로 던진다(호출부에서 흐름 제어). */
    public double[] embed(String text) {
        Map<String, Object> body = Map.of(
                "model", EMBEDDING_MODEL,
                "input", text
        );

        String responseBody = restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apiKey)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode vector = root.path("data").get(0).path("embedding");
            double[] result = new double[vector.size()];
            for (int i = 0; i < vector.size(); i++) {
                result[i] = vector.get(i).asDouble();
            }
            return result;
        } catch (Exception e) {
            throw new RuntimeException("OpenAI 임베딩 응답 파싱 실패: " + e.getMessage(), e);
        }
    }

    /** double[] -> JSON 문자열 (chunk_embedding CLOB 저장용). */
    public String toJson(double[] vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (Exception e) {
            throw new RuntimeException("임베딩 벡터 직렬화 실패: " + e.getMessage(), e);
        }
    }

    /** JSON 문자열 -> double[] (chunk_embedding CLOB 조회 후 유사도 계산용). */
    public double[] fromJson(String json) {
        try {
            return objectMapper.readValue(json, double[].class);
        } catch (Exception e) {
            throw new RuntimeException("임베딩 벡터 역직렬화 실패: " + e.getMessage(), e);
        }
    }
}
