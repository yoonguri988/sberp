package com.sb.erp.appr.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.appr.dto.request.ApprAutoDelegationCancelRequest;
import com.sb.erp.appr.dto.response.ApprAutoDelegationResponse;
import com.sb.erp.appr.service.ApprAutoDelegationService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 스코프 제외 - 위임전결 자동화
 * 미구현으로 배포 대상에서 제외됨. 인가 모델(ROOT → comId 스코프 ADMIN) 마이그레이션도
 * 적용 안 된 상태로 코드만 보존. 재개 시 ApprFormController와 동일한 패턴으로 맞출 것.
 */
@Tag(name = "위임전결", description = "휴가/출장 연동 위임전결 조회 및 취소 API / 스코프 제외")
@RestController
@RequestMapping("/api/appr/delegations")
@RequiredArgsConstructor
public class ApprAutoDelegationController {
	
	private final ApprAutoDelegationService autoService;
	
	@Operation(summary = "내 위임전결 현황", description = "본인이 위임한 위임전결 목록 조회")
	@GetMapping("/my")
	public ResponseEntity<List<ApprAutoDelegationResponse>> myDelegations(
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		return ResponseEntity.ok(autoService.myDelegation(principal.getEmpId()));
	}
	
	@Operation(summary = "위임전결 현황 조회 (관리자)", description = "상태별 위임전결 목록 조회")
	@PreAuthorize("hasAuthority('ROOT')")
	@GetMapping
	public ResponseEntity<List<ApprAutoDelegationResponse>> listByStatus(
			@RequestParam("status") String deleStatus
	) {
		return ResponseEntity.ok(autoService.listByStatus(deleStatus));
	}
	
	@Operation(summary = "위임전결 취소 요청", description = "본인 위임전결에 대해 취소 요청")
	@PostMapping("/{autoDelegId}/cancel-request")
	public ResponseEntity<Void> requestCancel(
			@PathVariable("autoDelegId") Long autoDelegId,
			@Valid
			@RequestBody ApprAutoDelegationCancelRequest req,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		autoService.requestCancel(autoDelegId, principal.getEmpId(), req);
		return ResponseEntity.noContent().build();
	}
	
	@Operation(summary = "위임전결 취소 승인 (관리자)", description = "취소 요청 승인, 즉시 원 결재자로 복귀")
	@PreAuthorize("hasAuthority('ROOT')")
	@PostMapping("/{autoDelegId}/cancel-approve")
	public ResponseEntity<Void> approveCancel(
			@PathVariable("autoDelegId") Long autoDelegId,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		autoService.approveCancel(autoDelegId, principal.getEmpId());
		return ResponseEntity.noContent().build();
	}
	
	@Operation(summary = "위임전결 취소 반려 (관리자)", description = "취소 요청 려, 위임 계속 유지")
	@PreAuthorize("hasAuthority('ROOT')")
	@PostMapping("/{autoDelegId}/cancel-reject")
	public ResponseEntity<Void> rejectCancel(
			@PathVariable("autoDelegId") Long autoDelegId,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		autoService.rejectCancel(autoDelegId, principal.getEmpId());
		return ResponseEntity.noContent().build();
	}
	
}
