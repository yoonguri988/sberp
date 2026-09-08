package com.sb.erp.dashboard.member.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.dashboard.member.dto.response.DashboardSummaryResponse;
import com.sb.erp.dashboard.member.service.DashboardService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "사용자 대시보드")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class MemberDashboardController {
	
	private final DashboardService dashService;
	
	@Operation(summary = "대시보드 요약 조회", description = "결재/연차/근태/인사평가/공지/프로젝트/예약 통합 요약")
	@GetMapping("/member")
	public ResponseEntity<DashboardSummaryResponse> getSummary(
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		return ResponseEntity.ok(dashService.getSummary(principal.getEmpId(), principal.getComId()));
	}
}
