package com.sb.erp.util.dto;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.global.exception.FileUploadException;

import jakarta.annotation.PostConstruct;

/**
 * 파일 업로드 공통 유틸. (컨트롤러/서비스에서는 정적 메서드로만 호출)
 *
 * 사용법:
 *   FileUploadDto result = FileUploadUtil.upload(multipartFile, FileUploadType.COMPANY_LOGO);
 *   company.setComLogoUrl(result.getFileUrl());   // DB 저장용 URL
 *
 * 주의: 저장된 파일을 브라우저에서 "/home/ubuntu/app/back/build/libs/uploads/company/logo/xxx.png" 로 접근하려면
 * WebUploadConfig(WebMvcConfigurer) 에서 upload.path ↔ resource.path 를 리소스 핸들러로
 * 매핑해줘야 한다. (같이 전달한 WebUploadConfig.java 참고)
 */
@Component
public class FileUploadUtil {

    private static String urlPrefix;
    private static String baseDir;

    @Value("${upload.path}")
    private String urlPrefixValue;

    @Value("${resource.path}")
    private String baseDirValue;

    @PostConstruct
    private void init() {
        urlPrefix = urlPrefixValue.endsWith("/") ? urlPrefixValue : urlPrefixValue + "/";
        baseDir = baseDirValue.endsWith("/") ? baseDirValue : baseDirValue + "/";
    }

    /** 검증 + 저장을 한 번에 처리. 보통 컨트롤러에서 이 메서드만 호출하면 됨 */
    public static FileUploadDto upload(MultipartFile file, FileUploadType type) {
        validate(file, type);
        return store(file, type);
    }

    /** 확장자 / Content-Type / 용량 / 매직바이트 검증. 실패 시 FileUploadException 발생 */
    public static void validate(MultipartFile file, FileUploadType type) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("업로드할 파일이 없습니다.");
        }
        if (file.getSize() > type.getMaxSize()) {
            throw new FileUploadException(String.format(
                "파일 용량은 최대 %dMB까지 업로드 가능합니다.", type.getMaxSize() / (1024 * 1024)));
        }

        String originalName = getOriginalFileName(file);
        String ext = getExtension(originalName);
        if (ext.isEmpty() || !type.getAllowedExtensions().contains(ext)) {
            throw new FileUploadException("허용되지 않는 파일 형식입니다. (허용 확장자: "
                + String.join(", ", type.getAllowedExtensions()) + ")");
        }

        String contentType = file.getContentType();
        if (contentType == null || !type.getAllowedMimeTypes().contains(contentType.toLowerCase())) {
            // 브라우저/OS에 따라 svg, webp 의 Content-Type이 다르게 잡히는 경우가 있어
            // 실제 테스트에서 너무 자주 막히면 이 블록을 경고 로그로만 바꾸고 확장자 검증에 맡겨도 된다.
            throw new FileUploadException("허용되지 않는 파일 형식입니다. (Content-Type 불일치: " + contentType + ")");
        }

        // 이미지 확장자는 매직바이트(파일 헤더)로 한번 더 확인해 확장자 위장을 막는다.
        // svg, hwp/hwpx 등 텍스트/문서 포맷은 아래 isValidFileSignature에서 지원하지 않는 확장자만
        // 검사 대상에서 제외한다. (지원 확장자를 넓히고 싶으면 isValidFileSignature에 case만 추가)
        if (!ext.equals("svg")) {
            try {
                byte[] header = readHeader(file, 12);
                if (!isValidFileSignature(header, ext)) {
                    throw new FileUploadException("파일 내용이 손상되었거나 확장자를 위장한 파일입니다.");
                }
            } catch (IOException e) {
                throw new FileUploadException("파일을 읽는 중 오류가 발생했습니다.", e);
            }
        }
    }

    /**
     * 이전에 upload()가 돌려준 fileUrl(예: /home/ubuntu/app/back/build/libs/uploads/notice/attach/xxxx.pdf)을
     * 다시 디스크 절대경로로 변환한다. 첨부파일 교체(update)/삭제 시 기존 파일을 정리할 때 사용.
     * (FileUploadDto.savedPath를 DB에 별도로 저장해두지 않는 경우를 위한 보조 메서드)
     */
    public static String resolveDiskPath(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }
        String relative = fileUrl.startsWith(urlPrefix) ? fileUrl.substring(urlPrefix.length()) : fileUrl;
        return Paths.get(baseDir, relative).toString();
    }

    /** 검증이 끝난 파일을 디스크에 저장하고 결과를 반환 (validate를 먼저 호출했다는 전제) */
    public static FileUploadDto store(MultipartFile file, FileUploadType type) {
        String originalName = getOriginalFileName(file);
        String ext = getExtension(originalName);
        String savedName = UUID.randomUUID().toString().replace("-", "") + "." + ext;

        Path dir = Paths.get(baseDir, type.getSubDir());
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(savedName);
            file.transferTo(target.toFile());

            String fileUrl = urlPrefix + type.getSubDir() + "/" + savedName;
            return new FileUploadDto(originalName, savedName, target.toString(), fileUrl, file.getSize());
        } catch (IOException e) {
            throw new FileUploadException("파일 저장 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /** 로고 교체 등으로 기존 파일을 지울 때 사용. savedPath는 FileUploadDto.getSavedPath() 값 */
    public static boolean delete(String savedPath) {
        if (savedPath == null || savedPath.isEmpty()) {
            return false;
        }
        File f = new File(savedPath);
        return f.exists() && f.delete();
    }

    // ===================== 내부 헬퍼 =====================

    private static String getOriginalFileName(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name == null) {
            return "";
        }
        // 구형 브라우저가 풀 경로를 같이 보내는 경우 대비, 파일명만 추출 (경로 조작 방지 겸용)
        name = name.replace("\\", "/");
        return name.substring(name.lastIndexOf("/") + 1);
    }

    private static String getExtension(String fileName) {
        int dot = fileName.lastIndexOf(".");
        if (dot < 0 || dot == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dot + 1).toLowerCase();
    }

    private static byte[] readHeader(MultipartFile file, int size) throws IOException {
        byte[] header = new byte[size];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(header, 0, size);
            if (read < size) {
                byte[] trimmed = new byte[Math.max(read, 0)];
                System.arraycopy(header, 0, trimmed, 0, trimmed.length);
                return trimmed;
            }
        }
        return header;
    }

    private static boolean isValidFileSignature(byte[] header, String ext) {
        if (header == null) {
            return false;
        }
        switch (ext) {
            case "png":
                return header.length >= 4
                    && (header[0] & 0xFF) == 0x89 && header[1] == 0x50
                    && header[2] == 0x4E && header[3] == 0x47;
            case "jpg":
            case "jpeg":
                return header.length >= 3
                    && (header[0] & 0xFF) == 0xFF
                    && (header[1] & 0xFF) == 0xD8
                    && (header[2] & 0xFF) == 0xFF;
            case "webp":
                return header.length >= 12
                    && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                    && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';
            case "gif":
                return header.length >= 6
                    && header[0] == 'G' && header[1] == 'I' && header[2] == 'F'
                    && header[3] == '8' && (header[4] == '7' || header[4] == '9') && header[5] == 'a';
            case "pdf":
                return header.length >= 4
                    && header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F';
            // docx/xlsx/pptx/hwpx는 내부적으로 zip 포맷이라 zip과 같은 시그니처를 사용한다.
            case "zip":
            case "docx":
            case "xlsx":
            case "pptx":
            case "hwpx":
                return header.length >= 4
                    && (header[0] & 0xFF) == 0x50 && (header[1] & 0xFF) == 0x4B
                    && ((header[2] & 0xFF) == 0x03 || (header[2] & 0xFF) == 0x05 || (header[2] & 0xFF) == 0x07);
            // doc/xls/ppt(구 바이너리 오피스 포맷)와 구버전 hwp는 OLE 복합 문서 시그니처를 공유한다.
            case "doc":
            case "xls":
            case "ppt":
            case "hwp":
                return header.length >= 8
                    && (header[0] & 0xFF) == 0xD0 && (header[1] & 0xFF) == 0xCF
                    && (header[2] & 0xFF) == 0x11 && (header[3] & 0xFF) == 0xE0
                    && (header[4] & 0xFF) == 0xA1 && (header[5] & 0xFF) == 0xB1
                    && (header[6] & 0xFF) == 0x1A && (header[7] & 0xFF) == 0xE1;
            default:
                return false;
        }
    }
}