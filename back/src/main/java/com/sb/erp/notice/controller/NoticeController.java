package com.sb.erp.notice.controller;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.notice.dto.request.NoticeRequest;
import com.sb.erp.notice.dto.request.NoticeSearchRequest;
import com.sb.erp.notice.dto.response.NoticeResponse;
import com.sb.erp.notice.service.NoticeService;
import com.sb.erp.util.dto.PagingUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name="Notice Api", description = "Notice 관련 Api")
@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {

	private final NoticeService noticeService;

	// 공지 목록 조회
	@Operation(summary = "공지 목록 조회", description = "긴급 공지+검색 조건에 맞는 공지 목록 조회")
	@GetMapping
	public ResponseEntity<Map<String, Object>> getNotices(
			@ModelAttribute NoticeSearchRequest search,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!isRoot) { search.setComId(principal.getComId()); }

		int currentPage = search.getPstartno();
		List<NoticeResponse> notices = noticeService.getNoticeListWithUrgent(search);
		int totalCnt = noticeService.selectCount(search);
		long pagingCnt = noticeService.selectCountNoticeList(search);
		PagingUtil paging = new PagingUtil((int) pagingCnt, currentPage);

		Map<String, Object> result = new HashMap<>();
		result.put("paging", paging);
		result.put("notices", notices);
		result.put("totalCnt", totalCnt);
		return ResponseEntity.ok(result);
	}

	// 공지 등록 (관리자 전용)
	@Operation(summary = "공지 등록", description = "신규 공지 등록")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, Object>> createNotice(
			@Parameter(description = "공지 등록 정보") @Valid @ParameterObject @ModelAttribute NoticeRequest dto,
			@Parameter(description = "첨부파일") @RequestParam(value = "file", required = false) MultipartFile file,
			@AuthenticationPrincipal CustomUserPrincipal principal) {
		Map<String, Object> result = new HashMap<>();

		dto.setComId(principal.getComId());
		dto.setEmpId(principal.getEmpId());

		try {
			noticeService.insert(dto, file);
			result.put("success", true);
			result.put("message", "공지 등록 성공");
			result.put("bno", dto.getBno());
			result.put("notice", noticeService.select(dto.getBno()));
			return ResponseEntity.status(HttpStatus.CREATED).body(result);
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", "공지 등록 실패");
			return ResponseEntity.badRequest().body(result);
		}
	}

	// 공지 수정 (관리자 전용)
	@Operation(summary = "공지 수정", description = "공지 수정")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@PutMapping(value = "/{bno}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<Map<String, Object>> updateNotice(
			@ModelAttribute NoticeRequest dto,
			@PathVariable("bno") Long bno,
			@RequestPart(name = "file", required = false) MultipartFile file,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		NoticeResponse original = noticeService.select(bno);
		if (original == null) {
			return ResponseEntity.notFound().build();
		}

		// 회사 소속 체크는 권한(ADMIN/ROOT) 문제와 별개라 그대로 유지
		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!isRoot && !original.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

		dto.setBno(bno);
		Map<String, Object> result = new HashMap<>();

		try {
			noticeService.update(dto, file);
			result.put("success", true);
			result.put("message", "공지 수정 성공");
			result.put("notice", noticeService.select(bno));
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			result.put("success", false);
			result.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(result);
		}
	}

	// 공지 삭제 (관리자 전용)
	@Operation(summary = "공지 삭제", description = "공지를 삭제합니다.")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@DeleteMapping("/{bno}")
	public ResponseEntity<Map<String, Object>> deleteNotice(
			@PathVariable("bno") Long bno,
			@AuthenticationPrincipal CustomUserPrincipal principal) {
		NoticeResponse original = noticeService.select(bno);
		if (original == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!isRoot && !original.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

		noticeService.delete(bno);
		Map<String, Object> result = new HashMap<>();
		result.put("success", true);
		result.put("message", "공지 삭제 성공");
		return ResponseEntity.ok(result);
	}

	// 공지 상세 조회
	@Operation(summary = "공지 상세조회", description = "공지 상세 정보를 조회합니다. (조회수 1 증가)")
	@GetMapping("/{bno}")
	public ResponseEntity<NoticeResponse> getNotice(
			@PathVariable("bno") Long bno,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		NoticeResponse dto = noticeService.select(bno);

		if (dto == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isRoot = principal.getRoles().contains("ROOT");

		if (!isRoot && !dto.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}

		noticeService.updateHit(bno);

		dto = noticeService.select(bno);

		return ResponseEntity.ok(dto);
	}

	// 검색 결과 카운트
	@Operation(summary = "공지 검색 결과 카운트", description = "검색 조건에 맞는 공지 건수만 조회합니다.")
	@GetMapping("/search-count")
	public ResponseEntity<Integer> getSearchCount(NoticeSearchRequest search) {
		return ResponseEntity.ok(noticeService.selectCountNoticeList(search));
	}

	@GetMapping("/{bno}/file")
	public ResponseEntity<byte[]> downloadFile(
			@PathVariable("bno") Long bno,
			@AuthenticationPrincipal CustomUserPrincipal principal) throws Exception {

		NoticeResponse notice = noticeService.select(bno);
		if (notice == null || notice.getBfile() == null || notice.getBfile().isBlank()) {
			return ResponseEntity.notFound().build();
		}
		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!isRoot && !notice.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}
		String[] parts = notice.getBfile().split("\\|", 3);
		if (parts.length < 3) { return ResponseEntity.notFound().build(); }
		String fileName = parts[0];
		String contentType = parts[1];
		byte[] data;
		try {
			data = Base64.getDecoder().decode(parts[2]);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.notFound().build();
		}
		String encodedName = java.net.URLEncoder.encode(fileName, "UTF-8");
		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType))
				.header(
					"Content-Disposition",
					"attachment; filename*=UTF-8''" + encodedName
				)
				.body(data);
	}
}