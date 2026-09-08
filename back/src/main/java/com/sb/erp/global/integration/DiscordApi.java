package com.sb.erp.global.integration;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class DiscordApi {

    @Value("${webhook.discord.url}")
    private String webhookUrl;

    private final RestClient restClient;

    public DiscordApi(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    public void sendMessage(String message) {

        Map<String, String> body = Map.of(
                "content", message
        );

        restClient.post()
                .uri(webhookUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

}