package com.sb.erp.global.integration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class OpenAiReturnMsg {
	@Value("${cyj.openai.api.key}") private String apiKey;
	@Value("${cyj.openai.model}") private String model;
	
	private static final String CHAT_URL = "https://api.openai.com/v1/chat/completions";
	
	private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
	
	/**
     * systemPrompt(역할/톤 지시) + userPrompt(실제 상황 데이터)를 넣어 문장을 생성한다.
     * API 호출이 실패하더라도 알림 발송 자체는 끊기면 안 되므로,
     * 실패 시 fallbackMessage(정적 템플릿 문장)를 그대로 반환한다.
     */
	public String generateMessage(String systemPrompt, String userPrompt, String fallbackMessage) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
 
            List<Map<String, String>> messages = new ArrayList<>();
 
            Map<String, String> sysMsg = new HashMap<>();
            sysMsg.put("role", "system");
            sysMsg.put("content", systemPrompt);
            messages.add(sysMsg);
 
            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt);
            messages.add(userMsg);
 
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("temperature", 0.6);
            body.put("max_tokens", 300);
            body.put("messages", messages);
 
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(CHAT_URL, request, String.class);
 
            JsonNode root = objectMapper.readTree(response.getBody());
            String content = root.path("choices").get(0).path("message").path("content").asText();
 
            if (content == null || content.isBlank()) {
                return fallbackMessage;
            }
            return content.trim();
 
        } catch (Exception e) {
            log.warn("ChatGPT 메시지 생성 실패, fallback 문구로 대체합니다.", e);
            return fallbackMessage;
        }
    }
}
