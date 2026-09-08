package com.sb.erp.global.integration;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.json.JsonMapper;



@Service
public class ApprFormAiService {
	
	@Value("${kjy.openai.api.key}")
	private String apiKey;
	
	private static final String API_URL = "https://api.openai.com/v1/chat/completions";
	private final JsonMapper jsonMapper = new JsonMapper();
	private final RestClient restClient;
	
	public ApprFormAiService(RestClient.Builder restClientBuilder) {
		SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
		requestFactory.setConnectTimeout(10000); // 연결 타임아웃 10초
		requestFactory.setReadTimeout(30000); // 응답 대기 타임아웃 30초
		
		this.restClient = restClientBuilder
				.baseUrl(API_URL)
				.requestFactory(requestFactory)
				.build();
	}
	
	
	public String formSchema(String userPrompt) {
		
		
		String systemPrompt = """
			당신은 사내 전자결재 시스템의 양식 설계 도우미입니다.
			사용자가 원하는 결재 양식을 설명하면, 필요한 입력 필드들을 설계해주세요.
			
			각 필드는 다음 구조를 따릅니다:
			{
				"key": "필드의 영문 식별자 (snake_case)",
				"label": "필드의 한글 라벨",
				"type": "text, textarea, date, number, select 중 하나",
				"required": true 또는 false,
				"options": ["select 타입일 때만 존재하는 선택지 배열"]
			}
			
			반드시 아래 형식의 JSON 객체만 응답하세요. 다른 설명은 절대 하지 마세요.
			{
				"title": "양식 제목 추천",
				"fields": [...]
			}		
			""";
		
		Map<String, Object> body = Map.of(
				"model", "gpt-4o-mini",
				"messages", List.of(
					Map.of("role", "system", "content", systemPrompt),
					Map.of("role", "user", "content", userPrompt)
				),
				"response_format", Map.of("type", "json_object")
		);
		
		try {
			String responseBody = restClient.post()
					.contentType(MediaType.APPLICATION_JSON)
					.header("Authorization", "Bearer " + apiKey)
					.body(body)
					.retrieve()
					.body(String.class);
			JsonNode root = jsonMapper.readTree(responseBody);
			return root.path("choices").get(0).path("message").path("content").asText();
		} catch (Exception e) {
			throw new RuntimeException("openAi 양식 생성 실패", e);
		}
		
	}
	
}
