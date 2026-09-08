package com.sb.erp.appr.controller;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.appr.dto.request.ApprLineDelegationRequest;
import com.sb.erp.appr.dto.request.ApprLineFavoriteRequest;
import com.sb.erp.appr.dto.request.ApprLineRequestSearchCondition;
import com.sb.erp.appr.dto.response.ApprLineDelegationResponse;
import com.sb.erp.appr.dto.response.ApprLineFavoriteResponse;
import com.sb.erp.appr.service.ApprLineDelegationService;
import com.sb.erp.appr.service.ApprLineFavoriteService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "결재선 위임/즐겨찾기", description = "결재선 위임/대결 요청 및 즐겨찾기 관리 API")
@RestController
@RequestMapping("/api/appr/lines")
@RequiredArgsConstructor
public class ApprLineController {
	
	private final ApprLineDelegationService delService;
	private final ApprLineFavoriteService favService;
	
	////////////////////////////// 위임/대결 //////////////////////////////
	
	@Operation(summary = "위임/대결 요청 생성", description = "본인의 대기중이 결재 순번에 대해 위임/대결 요청")
	@PostMapping("/requests")
	public ResponseEntity<Void> createRequest(
			@Valid
			@RequestBody ApprLineDelegationRequest req,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) { 
		Long reqId = delService.createRequest(req, principal.getEmpId());
		URI location = URI.create("/appr/lines/requests/" + reqId);
		return ResponseEntity.created(location).build();
	}

	@Operation(summary = "내 위임 요청 목록", description = "본인이 신청한 위임 요청 확인")
	@GetMapping("/requests/my")
	public ResponseEntity<List<ApprLineDelegationResponse>> myRequests(
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		return ResponseEntity.ok(delService.myRequests(principal.getEmpId()));
	}
	
	@Operation(summary = "위임 요청 승인 대기 목록 (관리자)", description = "승인 대기중인 요청 확인")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/requests/pending")
	public ResponseEntity<List<ApprLineDelegationResponse>> pendingRequests(
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		return ResponseEntity.ok(delService.pendingRequests(principal.getComId()));
	}
	
	@Operation(summary = "위임 요청 승인 (관리자)", description = "결재선 emp_id 교체 + 감사로그 기록")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/requests/{reqId}/app")
	public ResponseEntity<Void> approveRequest(
			@PathVariable("reqId") Long reqId,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		delService.approve(reqId, principal.getEmpId(), principal.getComId());
		return ResponseEntity.noContent().build();
	}
	
	@Operation(summary = "위임 요청 반려 (관리자)", description = "위임 요청을 반려")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/requests/{reqId}/rej")
	public ResponseEntity<Void> rejectRequest(
			@PathVariable("reqId") Long reqId,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		delService.reject(reqId, principal.getEmpId(), principal.getComId());
		return ResponseEntity.noContent().build();
	}
	
	@Operation(summary = "위임요청 처리 이력 조회 (관리자)", description = "상태/요청자/기간 필터로 전체 위임")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/requests/history")
	public ResponseEntity<Page<ApprLineDelegationResponse>> searchRequestHistory(
			ApprLineRequestSearchCondition cond,
			@PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		return ResponseEntity.ok(delService.searchHistory(cond, pageable, principal.getComId()));
	}
	
	
	////////////////////////////// 위임/대결 //////////////////////////////
	
	////////////////////////////// 즐겨찾기 //////////////////////////////

	@Operation(summary = "결재선 즐겨찾기 추천 목록", description = "부서+양식 기준, 재직상태/직급 재검증 후 반환")
	@GetMapping("/favorites")
	public ResponseEntity<List<ApprLineFavoriteResponse>> recommend(
			@RequestParam("deptId") Long deptId,
			@RequestParam("forId") Long forId,
			@AuthenticationPrincipal CustomUserPrincipal principal
	) {
		return ResponseEntity.ok(favService.recommend(deptId, forId, principal.getEmpId()));		
	}
	
	@Operation(summary = "결재선 즐겨찾기 등록", description = "동일 조합이면 사용횟수 증가 없을시 신규등록")
	@PostMapping("/favorites")
	public ResponseEntity<Void> saveOrIncrement(
			@Valid
			@RequestBody ApprLineFavoriteRequest req
	) {
		Long favId = favService.saveOrIncrement(req);
		URI location = URI.create("/appr/lines/favorites/" + favId);
		return ResponseEntity.created(location).build();
	}
	
	@Operation(summary = "결재선 즐겨찾기 삭제", description = "즐겨찾기 항목 삭제")
	@DeleteMapping("/favorites/{favId}")
	public ResponseEntity<Void> deleteFavorite(
			@PathVariable("favId") Long favId
	) {
		favService.delete(favId);
		return ResponseEntity.noContent().build();
	}
	
	////////////////////////////// 즐겨찾기 //////////////////////////////
}
