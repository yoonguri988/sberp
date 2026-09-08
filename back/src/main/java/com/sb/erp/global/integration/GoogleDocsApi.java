package com.sb.erp.global.integration;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class GoogleDocsApi {
	
	private final RestClient restClient;
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	@Value("${google.report.client-id}")private String clientId;
	@Value("${google.report.client-secret}")private String clientSecret;
	@Value("${google.report.refresh-token}")private String refreshToken;
	
	public GoogleDocsApi(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }
	
    public String getNewAccessToken() {
        try {

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("client_id", clientId);
            formData.add("client_secret", clientSecret);
            formData.add("refresh_token", refreshToken);
            formData.add("grant_type", "refresh_token");

            String response = restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            return root.path("access_token").asText();
        } catch (Exception e) {
            throw new RuntimeException("Google Access Token 갱신 실패: " + e.getMessage(), e);
        }
    }
   
    //템플릿 문서 복사
    public String copyTemplate(String accessToken, String templateId, String newTitle) {
        Map<String, Object> body = Map.of("name", newTitle);
            String response = restClient.post()
                    .uri("https://www.googleapis.com/drive/v3/files/{fileId}/copy", templateId)
                    .header("Authorization", "Bearer " + accessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            try {
            	return objectMapper.readTree(response).path("id").asText();
            }catch(Exception e) {throw new RuntimeException("템플릿 복사 실패:"+e.getMessage(),e);}
    }
    // 사본 문서 안의 {{...}} placeholder들을 실제 값으로 치환
    public void replacePlaceholders(String accessToken, String documentId, Map<String,Object> values) {
        List<Map<String, Object>> requests = values.entrySet().stream()
        									 .map(entry->Map.<String,Object>of(
        									 "replaceAllText",Map.of(
        									 "containsText",Map.of("text",entry.getKey(),"matchCase",true),
        									 "replaceText",entry.getValue())))
        									 .toList();
        Map<String,Object>body=Map.of("requests",requests);
        
        restClient.post()
        .uri("https://docs.googleapis.com/v1/documents/{documentId}:batchUpdate", documentId)
        .header("Authorization", "Bearer " + accessToken)
        .contentType(MediaType.APPLICATION_JSON)
        .body(body)
        .retrieve()
        .toBodilessEntity();
    }
    //완성된 문서를 pdf 바이트로 변환
    public byte[] exportAsPdf(String accessToken, String fileId) {
        byte[] rawPdf = restClient.get()
                .uri("https://www.googleapis.com/drive/v3/files/{fileId}/export?mimeType=application/pdf", fileId)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .body(byte[].class);

        return removeCoverPage(rawPdf);
    }

    //구글 docs 버그/사양으로 인해 강제 1페이지 제거
    public byte[] removeCoverPage(byte[] rawPdf) {
        try (PDDocument doc = Loader.loadPDF(rawPdf);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            if (doc.getNumberOfPages() > 1) {
                doc.removePage(0); // 탭 이름 표지(1페이지) 제거
            }
            doc.save(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("PDF 표지 제거 실패: " + e.getMessage(), e);
        }
    }
    //개발자용 pdf로 변환한 후에 사본은 삭제시켜주는 용도
    public void deleteDoc(String accessToken, String documentId) {
        restClient.delete()
                .uri("https://www.googleapis.com/drive/v3/files/{fileId}", documentId)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .toBodilessEntity();
    }
    
}
