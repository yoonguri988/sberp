package com.sb.erp.api.controller;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.api.dto.request.BizNoVerifyRequest;
import com.sb.erp.api.dto.response.OcrResponse;
import com.sb.erp.global.integration.BizNoVerifyApi;
import com.sb.erp.global.integration.OcrNaverApi;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

// 사업자번호 진위확인 / OCR 은 모두 외부 유료 API 호출이라, 회사 등록 흐름(ADMIN/ROOT 전용)에서만 쓰도록 제한
@Tag(name = "Util REST API", description = "사업자번호 진위확인, OCR 등 외부 연동 유틸 API")
@RestController
@RequestMapping("/api/util")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
public class ApiUtilController {

	private static final Logger log = LoggerFactory.getLogger(ApiUtilController.class);

	private final BizNoVerifyApi bizNoVerifyApi;
	private final OcrNaverApi ocrNaverApi;

	/**
	 * 사업자등록번호 진위확인
	 * POST /api/util/bizno/verify
	 * body: {
	 *     "bizNo": "123-45-67890",
	 *     "startDt": "2024-01-01",
	 *     "ceoName": "홍길동"
	 * }
	 */
	@Operation(summary = "사업자등록번호 진위확인", description = "국세청 사업자등록정보 진위확인 API를 호출합니다.")
	@PostMapping(value = "/bizno/verify", produces = MediaType.APPLICATION_JSON_VALUE)
	public ResponseEntity<String> verify(@RequestBody BizNoVerifyRequest bizNoVerify) {
		try {
			String response = bizNoVerifyApi.getResponse(bizNoVerify);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			// 외부 API 예외 원문(URL, 인증정보 등이 섞여있을 수 있음)은 서버 로그에만 남기고,
			// 클라이언트에는 일반화된 메시지만 전달
			log.error("사업자번호 진위확인 API 호출 실패", e);
			return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
					.body("{\"status\":\"error\",\"message\":\"사업자번호 진위확인 중 오류가 발생했습니다.\"}");
		}
	}

	@Operation(summary = "명함/사업자등록증 OCR", description = "네이버 클로바 OCR API로 이미지에서 텍스트를 추출합니다.")
	@PostMapping(value = "/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, Object>> processOcr(@RequestParam(name = "file") MultipartFile file) {

		Map<String, Object> resultMap = new HashMap<>();

		if (file == null || file.isEmpty()) {
			resultMap.put("status", "error");
			resultMap.put("message", "업로드된 파일이 없습니다.");
			return ResponseEntity.badRequest().body(resultMap);
		}

		try {
			OcrResponse parsed = ocrNaverApi.executeOcr(file);
			resultMap.put("status", "success");
			resultMap.put("data", parsed); // 화면에서 필드별로 바로 사용
			return ResponseEntity.ok(resultMap);
		} catch (Exception e) {
			log.error("OCR API 호출 실패", e);
			resultMap.put("status", "error");
			resultMap.put("message", "OCR 처리 중 오류가 발생했습니다.");
			return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(resultMap);
		}
	}
}