package com.sb.erp.global.integration;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ResumeEmbeddingClient {

    private static final String API_URL = "https://api.openai.com/v1/embeddings";
    private static final String EMBEDDING_MODEL = "text-embedding-3-small";
    @Value("${openai.api.key}") private String apikey;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;
    
    public ResumeEmbeddingClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl(API_URL)
                .build();
    }

    // 텍스트 → 임베딩 벡터
    public double[] embed(String text) {

        Map<String, Object> body = Map.of(
                "model", EMBEDDING_MODEL,
                "input", text
        );

        String response = restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .header("Authorization", "Bearer " + apikey)
                .body(body)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);

            JsonNode vector =
                    root.path("data").get(0).path("embedding");

            double[] result = new double[vector.size()];

            for (int i = 0; i < vector.size(); i++) {
                result[i] = vector.get(i).asDouble();
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException(
                    "이력서 임베딩 응답 파싱 실패: " + e.getMessage(), e);
        }
    }

    // double[] → JSON 문자열
    public String toJson(double[] vector) {

        try {
            return objectMapper.writeValueAsString(vector);

        } catch (Exception e) {
            throw new RuntimeException(
                    "임베딩 벡터 변환 실패: " + e.getMessage(), e);
        }
    }

    // JSON 문자열 → double[]
    public double[] fromJson(String json) {

        try {
            return objectMapper.readValue(json, double[].class);

        } catch (Exception e) {
            throw new RuntimeException(
                    "임베딩 벡터 변환 실패: " + e.getMessage(), e);
        }
    }
}