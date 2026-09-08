package com.sb.erp.global.integration;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sb.erp.api.dto.response.AiRecomResponse;
import com.sb.erp.dept.dto.response.DeptResponse;

@Component
public class OpenAiRecomClient {
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";
	
	@Value("${cyj.openai.api.key}") private String apiKey;
	@Value("${cyj.openai.model}") private String model;
	 
	private final ObjectMapper objectMapper = new ObjectMapper();
	private final RestClient restClient;
	 
	public OpenAiRecomClient(RestClient.Builder restClientBuilder) {
		 this.restClient = restClientBuilder.baseUrl(API_URL).build();
	}
	/**
     * @param deptName        해체 대상 부서명
     * @param pendingDocTitles 참고용 진행중 결재문서 제목 요약 (없으면 null/빈 문자열 가능)
     * @param candidates      휴리스틱 필터링을 거친 이관 후보 부서 목록 (이 안에서만 고르도록 강제)
     * @return 추천 결과, 실패/후보없음/환각 응답인 경우 null
     */
	public AiRecomResponse recommend(String deptName, String pendingDocTitles, List<DeptResponse> candidates) {
        if (candidates == null || candidates.isEmpty()) {
            return null; // 추천할 후보 자체가 없음
        }
 
        String candidateText = candidates.stream()
                .map(c -> c.getDeptId() + ":" + c.getDeptName())
                .collect(Collectors.joining(", "));
 
        String titles = (pendingDocTitles == null || pendingDocTitles.isBlank()) ? "없음" : pendingDocTitles;
 
        String userPrompt = "해체되는 부서는 [" + deptName + "]이며, 남은 결재 문서 제목은 [" + titles + "] 이다. "
                + "다음 후보 부서 중에서만 이관 대상을 하나 선택하고, 반드시 JSON으로만 답하라. "
                + "스키마: {\"targetDeptId\": number, \"reason\": string(한국어, 2문장 이내)}. "
                + "후보 목록(부서ID:부서명): " + candidateText;
 
        Map<String, Object> body = Map.of(
                "model", model,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "너는 사내 ERP의 부서 이관 추천 도우미다. 반드시 주어진 후보 목록 안에서만 고르고, JSON 외의 텍스트는 절대 출력하지 않는다."),
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
            JsonNode parsed = objectMapper.readTree(content);
 
            long targetDeptId = parsed.path("targetDeptId").asLong();
            String reason = parsed.hasNonNull("reason") ? parsed.path("reason").asText() : null;
 
            // 환각 방지: 후보 목록에 없는 deptId를 답했다면 추천 자체를 버린다
            DeptResponse matched = candidates.stream()
                    .filter(c -> c.getDeptId() == targetDeptId)
                    .findFirst()
                    .orElse(null);
            if (matched == null) {
                return null;
            }
 
            return new AiRecomResponse(targetDeptId, matched.getDeptName(), reason);
        } catch (Exception e) {
            // AI 실패는 전체 흐름을 막지 않는다 — 관리자가 수동 선택
            return null;
        }
    }
}
