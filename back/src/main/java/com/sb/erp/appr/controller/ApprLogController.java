package com.sb.erp.appr.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.appr.dto.request.ApprLogSearchCondition;
import com.sb.erp.appr.dto.response.ApprLogResponse;
import com.sb.erp.appr.service.ApprLogService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "결재선 감사로그", description = "결재선 위임/대결 처리 감사로그 조회 API")
@RestController
@RequestMapping("/api/appr/logs")
@RequiredArgsConstructor
public class ApprLogController {
	
	private final ApprLogService logService;
	
	@Operation(summary = "결재선 감사로그 조회", description = "문서/사원/기간 필터로 감사로그 조회")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping
	public ResponseEntity<Page<ApprLogResponse>> searchLog(
			ApprLogSearchCondition cond,
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		return ResponseEntity.ok(logService.searchLog(cond,pageable, principal.getComId()));
	}
}
