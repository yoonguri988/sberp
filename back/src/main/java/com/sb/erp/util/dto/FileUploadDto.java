package com.sb.erp.util.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FileUploadDto {
	private String originalFileName; // 사용자가 올린 원본 파일명 (예: my_logo.png)
    private String savedFileName;    // 서버에 저장된 파일명 (UUID, 예: 3f2a1c....png)
    private String savedPath;        // 서버 디스크 절대경로 (예: C:/home/ubuntu/app/back/build/libs/home/ubuntu/app/back/build/libs/home/ubuntu/app/back/build/libs/uploadsss/company/logo/3f2a1c....png)
    private String fileUrl;          // 웹에서 접근 가능한 URL (예: /home/ubuntu/app/back/build/libs/uploads/company/logo/3f2a1c....png)
    private long fileSize;           // 파일 용량 (byte)
}