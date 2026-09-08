package com.sb.erp.emp.chatbot.integration;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/*
HR 규정 RAG 전용 OpenAI 임베딩(text-embedding-3-small) 클라이언트.
급여 파트의 SalAiEmbeddingClient와 구조는 동일

두 곳에서 호출:
	① PDF 업로드 시(HrPlcyDocService): 각 청크 원문 → 벡터 변환 후 DB 저장
	② 질문 시(HrAiChatService): 질문 → 벡터 변환 후 저장된 청크 벡터와 코사인 유사도 비교
*/
@Component
public class HrAiEmbeddingClient {

    private static final String API_URL = "https://api.openai.com/v1/embeddings";

    // 임베딩 모델은 채팅 모델(gpt-4o-mini)과 다르므로 상수로 고정
    private static final String EMBEDDING_MODEL = "text-embedding-3-small";
    /*	임베딩 모델이란? 
    	텍스트를 숫자 배열(벡터)로 변환하는 AI 모델. 사람이 읽는 문장을 컴퓨터가 비교할 수 있는 형태로 바꿔준다.
    	
    	중요: "의미가 비슷한 문장은 비슷한 벡터가 된다"
    	"연차 사용 시기가 궁금합니다."  →  [0.011, -0.043, 0.035, ...]  ← 거의 비슷한 벡터
		"사무실 복장 규정이 뭔가요?"   →  [0.891, 0.234, -0.567, ...]  ← 완전히 다른 벡터
		
		그래서 질문 벡터와 각 청크 벡터를 코사인 유사도로 비교하면 "질문에 가장 관련 있는 조항"을 찾아낼 수 있다. 
		이게 RAG의 Retrieval(검색) 단계다.
		
		'text-embedding-3-small'은 현재 OpenAI가 제공하는 임베딩 모델 중 하나
		text-embedding-3-small의 출력: [0.012, -0.045, 0.033, 0.087, ..., 0.008]
 									──────────── 1536개의 숫자(1536차원) ────────────
 		차원(숫자 배열의 길이)이 많을수록 텍스트의 의미를 더 세밀하게 표현한다.
 		예:
		1차원 — 숫자 1개로 사람을 표현: "키 175cm". 키가 비슷한 사람은 전부 같은 사람으로 보임
		2차원 — 숫자 2개: "키 175cm, 몸무게 70kg". 구분력이 조금 나아짐
		3차원 — 숫자 3개: "키, 몸무게, 나이". 더 정밀하게 구분 가능
		1536차원 — 숫자 1536개로 문장의 의미를 표현. 문맥, 주제, 뉘앙스, 관련 개념 등이 각 숫자에 분산되어 담겨 있음
    */

    // ─── OPENAI_API_KEY 설정 ───
    @Value("${jsj.openai.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    public HrAiEmbeddingClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.baseUrl(API_URL).build();
    }

    /*
     * 텍스트 하나를 임베딩 벡터(double[])로 변환.
     * @param text 질문 또는 청크 원문
     * @return 1536차원 벡터 배열
     * @throws RuntimeException 파싱 실패 시 (호출부에서 흐름 제어)
     */
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

    // double[] → JSON 문자열. hr_plcy_chunk.chunk_embedding CLOB에 저장할 때 사용.
    public String toJson(double[] vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (Exception e) {
            throw new RuntimeException("임베딩 벡터 직렬화 실패: " + e.getMessage(), e);
        }
    }

    //JSON 문자열 → double[]. DB에서 조회한 chunk_embedding을 유사도 계산에 쓸 때 사용.
    public double[] fromJson(String json) {
        try {
            return objectMapper.readValue(json, double[].class);
        } catch (Exception e) {
            throw new RuntimeException("임베딩 벡터 역직렬화 실패: " + e.getMessage(), e);
        }
    }
}