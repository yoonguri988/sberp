package com.sb.erp.util.dto;

import java.util.Arrays;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 업로드 종류별 정책(허용 확장자 / MIME / 최대용량 / 저장 하위경로)을 정의한다.
 *
 *   EMP_PROFILE(Arrays.asList("png","jpg","jpeg"), Arrays.asList("image/png","image/jpeg"), 2*1024*1024, "emp/profile"),
 *   BOARD_ATTACH(Arrays.asList("png","jpg","jpeg","pdf","zip"), Arrays.asList(...), 10*1024*1024, "board/attach"),
 */

@Getter @AllArgsConstructor
public enum FileUploadType {
	// 회사 로고 : PNG, JPG, SVG, WEBP / 최대 2MB
    COMPANY_LOGO(
        Arrays.asList("png", "jpg", "jpeg", "svg", "webp"),
        Arrays.asList("image/png", "image/jpeg", "image/svg+xml", "image/webp"),
        2L * 1024 * 1024,
        "company/logo"
    ),

    // 공지사항 첨부파일 : 이미지 + 문서(pdf/office/hwp) + zip / 최대 10MB
    // ※ hwp/office 계열은 브라우저·OS에 따라 Content-Type이 application/octet-stream 등으로
    //   들쭉날쭉하게 잡히는 경우가 많다. 실제 운영 중 정상 파일이 자주 막히면
    //   FileUploadUtil.validate()의 Content-Type 검증 블록을 완화(경고 로그 처리)하고
    //   확장자 + 매직바이트 검증에만 맡기는 것을 고려한다.
    NOTICE_ATTACH(
        Arrays.asList("png", "jpg", "jpeg", "gif", "pdf",
            "doc", "docx", "xls", "xlsx", "ppt", "pptx", "hwp", "hwpx", "zip"),
        Arrays.asList(
            "image/png", "image/jpeg", "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/x-hwp", "application/vnd.hancom.hwp",
            "application/zip", "application/x-zip-compressed",
            "application/octet-stream"
        ),
        10L * 1024 * 1024,
        "notice/attach"
    ),
    
    // AI 급여 Q&A 근거 문서(급여 규정집/수당기준/연말정산 가이드) : PDF만 / 최대 5MB
    SALARY_POLICY_DOC(
        Arrays.asList("pdf"),
        Arrays.asList("application/pdf"),
        5L * 1024 * 1024,
        "salary/policy"
    ),
    
	// HR 규정 근거 문서(취업규칙/연차규정 등) : PDF만 / 최대 5MB
	HR_POLICY_DOC(
		Arrays.asList("pdf"), 
		Arrays.asList("application/pdf"), 
		5L * 1024 * 1024,
		"hr/policy"
	),

    // TODO: 팀원별 기능에 맞는 업로드 타입을 여기에 추가
    // 이력서 pdf
    RESUME(
    	    Arrays.asList("pdf"),
    	    Arrays.asList("application/pdf"),
    	    10L * 1024 * 1024,
    	    "resume"
    	),
    ;
 
    private final List<String> allowedExtensions;
    private final List<String> allowedMimeTypes;
    private final long maxSize;
    private final String subDir;
}