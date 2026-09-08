package com.sb.erp.apct.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.apct.dto.response.ApplicantResponse;
import com.sb.erp.apct.dto.response.ApplicantStatusCountResponse;
import com.sb.erp.apct.service.ApplicantService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "지원자(관리자)", description = "직원용 관리자 API - 지원자 목록/상세/대시보드/순위/상태변경")
@RestController
@RequestMapping("/api/admin/applicant")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
public class ApplicantAdminController {

    private final ApplicantService applicantService;

    // 지원자 목록 — 같은 회사만 조회. ROOT는 전체 조회
    @Operation(summary = "지원자 목록")
    @GetMapping
    public ResponseEntity<Page<ApplicantResponse>> getAdminList(
            @RequestParam(name = "recId", required = false) Long recId,
            @RequestParam(name = "apctStatus", required = false) String apctStatus,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        boolean isRoot = principal.getRoles().contains("ROOT");
        Long comId = isRoot ? null : principal.getComId();

        Pageable pageable = PageRequest.of(page, size);

        return ResponseEntity.ok( applicantService.getAdminList( comId, recId, apctStatus, pageable ) );
    }
    
    // 지원자 칸반보드 — 공고 하나의 지원자 전체 (페이징 없음). 같은 회사만 조회, ROOT는 전체 조회
    @Operation(summary = "지원자 칸반보드 (공고별 전체 조회)")
    @GetMapping("/kanban")
    public ResponseEntity<List<ApplicantResponse>> getKanban(
            @RequestParam(name = "recId") Long recId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        boolean isRoot = principal.getRoles().contains("ROOT");
        Long comId = isRoot ? null : principal.getComId();

        return ResponseEntity.ok(applicantService.getKanbanList(comId, recId));
    }

    // 지원자 상세
    @Operation(summary = "지원자 상세")
    @GetMapping("/{apctId}")
    public ResponseEntity<ApplicantResponse> getDetail(
            @PathVariable("apctId") Long apctId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        ApplicantResponse dto = applicantService.getDetail(apctId);

        boolean isRoot = principal.getRoles().contains("ROOT");
        if (!isRoot && !dto.getComId().equals(principal.getComId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(dto);
    }

    // 대시보드 - 상태별 집계
    @GetMapping("/dashboard")
    public ResponseEntity<List<ApplicantStatusCountResponse>> getDashboard(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(applicantService.getDashboardStats(principal.getComId()));
    }

    // 공고별 fit_score 순위
    @Operation(summary = "공고별 fit_score 순위")
    @GetMapping("/rank")
    public ResponseEntity<Page<ApplicantResponse>> getRank(
		  @RequestParam(name = "recId") Long recId,
          @RequestParam(name = "page", defaultValue = "0") int page,
          @RequestParam(name = "size", defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(applicantService.getRankByFitScore(recId, pageable));
    }

    // 상태 변경
    @Operation(summary = "지원자 상태 변경")
    @PutMapping("/{apctId}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable("apctId") Long apctId,
            @RequestParam(name = "newStatus") String newStatus,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        applicantService.updateStatus( apctId, newStatus, principal.getComId() );

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "지원자 상태 변경 성공");
        result.put("apctId", apctId);
        result.put("status", newStatus);

        return ResponseEntity.ok(result);
    }
}