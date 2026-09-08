package com.sb.erp.global.integration;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sb.erp.api.dto.request.OcrRequest;
import com.sb.erp.api.dto.response.OcrResponse;

@Service
public class OcrNaverApi {

    @Value("${naver.ocr.secret}")
    private String secretKey;

    @Value("${naver.ocr.apiUrl}")
    private String apiUrl;

    private final RestClient restClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OcrNaverApi(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    /**
     * 사업자등록증 이미지를 NCP CLOVA OCR로 전송하고,
     * 화면에서 바로 쓸 수 있도록 파싱된 결과(OcrResultDto)를 반환한다.
     */
    public OcrResponse executeOcr(MultipartFile file) throws Exception {
        OcrRequest requestDto = new OcrRequest();
        requestDto.setRequestId(UUID.randomUUID().toString());
        requestDto.setTimestamp(System.currentTimeMillis());

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);

        OcrRequest.ImageDto imageDto = new OcrRequest.ImageDto();
        imageDto.setFormat(extension);
        imageDto.setName("ocr_target");
        requestDto.setImages(Collections.singletonList(imageDto));
        // 참고: file 파트로 실제 이미지를 별도 전송하므로 base64 data는 생략 가능하지만
        // 기존 DTO 구조를 유지하기 위해 필요시만 채운다.
        // imageDto.setData(Base64.getEncoder().encodeToString(file.getBytes()));

        // 1. message 파트 - JSON 문자열 + Content-Type 명시 (NCP 요구 형식)
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

        HttpHeaders messagePartHeaders = new HttpHeaders();
        messagePartHeaders.setContentType(MediaType.APPLICATION_JSON);
        String messageJson = objectMapper.writeValueAsString(requestDto);
        body.add("message", new HttpEntity<>(messageJson, messagePartHeaders));

        // 2. file 파트
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return originalFilename;
            }
        });

        // 3. 호출
        ResponseEntity<String> response = restClient.post()
                .uri(apiUrl)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .header("X-OCR-SECRET", secretKey)
                .body(body)
                .retrieve()
                .toEntity(String.class);

        return parseBizLicenseResult(response.getBody());
    }

    /** NCP 사업자등록증 특화 응답을 OcrResultDto로 매핑 */
    private OcrResponse parseBizLicenseResult(String rawJson) throws Exception {
        JsonNode root = objectMapper.readTree(rawJson);
        JsonNode images = root.path("images");

        if (!images.isArray() || images.isEmpty()) {
            throw new IllegalStateException("OCR 응답에 이미지 결과가 없습니다.");
        }

        JsonNode imageResult = images.get(0);

        String inferResult = imageResult.path("inferResult").asText("");
        if (!"SUCCESS".equals(inferResult)) {
            String msg = imageResult.path("message").asText("이미지 인식에 실패했습니다.");
            throw new IllegalStateException("사업자등록증 양식으로 인식되지 않았습니다: " + msg);
        }

        JsonNode fields = imageResult.path("fields");
        if (!fields.isArray() || fields.isEmpty()) {
            throw new IllegalStateException("사업자등록증 양식으로 인식되지 않았습니다. 이미지를 다시 확인해 주세요.");
        }

        Map<String, StringBuilder> fieldMap = new LinkedHashMap<>();
        for (JsonNode field : fields) {
            String name = field.path("name").asText("");
            String text = field.path("inferText").asText("");
            if (name.isEmpty()) continue;

            StringBuilder sb = fieldMap.computeIfAbsent(name, k -> new StringBuilder());
            if (sb.length() > 0) sb.append(" ");
            sb.append(text);
        }

        OcrResponse dto = new OcrResponse();
        dto.setBizNo(getFieldText(fieldMap, "bizNo"));
        dto.setComName(getFieldText(fieldMap, "comName"));
        dto.setComCeo(getFieldText(fieldMap, "comCeo"));
        dto.setStartDt(normalizeDate(getFieldText(fieldMap, "startDt")));
        dto.setIndustryGrpText(getFieldText(fieldMap, "industryGrpCode"));
        dto.setIndustryCodeText(getFieldText(fieldMap, "industryCode"));
        return dto;
    }
    
    private String getFieldText(Map<String, StringBuilder> fieldMap, String name) {
        StringBuilder sb = fieldMap.get(name);
        return sb == null ? "" : sb.toString().trim();
    }

    /** "2024 년 06 월 24 일" / "2024년06월 24일" 등 다양한 표기를 yyyy-MM-dd 로 정규화 */
    private String normalizeDate(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String digitsOnly = raw.replaceAll("[^0-9]", " ").trim().replaceAll("\\s+", " ");
        String[] parts = digitsOnly.split(" ");
        if (parts.length >= 3) {
            String y = parts[0];
            String m = String.format("%02d", Integer.parseInt(parts[1]));
            String d = String.format("%02d", Integer.parseInt(parts[2]));
            return y + "-" + m + "-" + d;
        }
        return raw;
    }
}