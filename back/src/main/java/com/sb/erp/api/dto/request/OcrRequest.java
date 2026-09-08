package com.sb.erp.api.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter @Setter
public class OcrRequest {
    private String version = "V2";
    private String requestId;
    private long timestamp;
    private List<ImageDto> images;

    @Getter @Setter
    public static class ImageDto {
        private String format; // jpg, png 등
        private String name;   // 이미지 명
        private String data;   // Base64 인코딩된 이미지 문자열
    }
}