package com.sb.erp.global.integration;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sb.erp.global.integration.openAi.ChatMessage;
import com.sb.erp.global.integration.openAi.ChatRequest;
import com.sb.erp.global.integration.openAi.ChatResponse;
import com.sb.erp.global.integration.openAi.ReportContent;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class OpenAiClient {

    @Value("${jsj.openai.api.model}") private String model;

    private final RestClient openAiRestClient;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public OpenAiClient(
            @Qualifier("openAiRestClient") RestClient openAiRestClient,
            ObjectMapper objectMapper) {
        this.openAiRestClient = openAiRestClient;
        this.objectMapper = objectMapper;
    }

    public ReportContent generateReport(List<ChatMessage> messages) {
    	log.info("[OpenAiClient] model=[" + model + "] length=" + model.length());
        try {
            ChatRequest request = new ChatRequest(
                model,
                messages,
                ChatRequest.ResponseFormat.jsonObject(),
                0.3
            );
            
         // ★ 디버그: 실제 전송 JSON 확인
            log.info("[OpenAiClient] request JSON: " + objectMapper.writeValueAsString(request));

            ChatResponse response = openAiRestClient.post()
                .uri("/chat/completions")
                .body(request)
                .retrieve()
                .body(ChatResponse.class);

            String contentJson = (response == null) ? null : response.firstContent();
            if (contentJson == null || contentJson.isBlank()) {
                log.error("[OpenAiClient] 응답 content가 비어있음");
                return null;
            }

            return objectMapper.readValue(contentJson, ReportContent.class);

        } catch (Exception e) {
            log.error("[OpenAiClient] GPT 호출 실패", e);
            return null;
        }
    }
}
