package com.sb.erp.resv.controller;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.resv.dto.request.ResvRequest;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.dto.response.StatsResvResponse;
import com.sb.erp.resv.service.ReservationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

// 관리자 전용 예약 관리 API - 목록/통계/승인/반려
// 클래스 레벨 @PreAuthorize 로 전체 메서드에 ADMIN/ROOT 권한을 일괄 적용
@Tag(name = "Admin Reservation REST API", description = "관리자 전용 예약 관리 REST API")
@RestController
@RequestMapping("/api/resv/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
public class AdminResvController {

    private static final String STATUS_APPROVED = "APP";
    private static final String STATUS_REJECTED = "REJ";

    private final ReservationService service;
    private final AuthUserJwtService authUserJwtService;

    // 예약 관리 목록 조회 GET /api/resv/admin
    @Operation(summary = "예약 관리 목록 조회", description = "회사 전체 예약 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<ResvResponse>> list(
            @ParameterObject @ModelAttribute ResvSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        if (!authUserJwtService.isRoot(authentication)) {
            search.setComId(authUserJwtService.getCurrentComId(authentication));
        }
        if (search.getStartDt() == null) {
            search.setStartDt(LocalDateTime.now().minusDays(30));
        }
        if (search.getEndDt() == null) {
            search.setEndDt(LocalDateTime.now());
        } else {
            search.setEndDt(search.getEndDt().toLocalDate().atTime(LocalTime.MAX)); // 23:59:59.999999999
        }
        return ResponseEntity.ok(service.getResvList(search));
    }

    // 예약 관리 전체 개수 조회 GET /api/resv/admin/count (페이징 계산용)
    @Operation(summary = "예약 관리 전체 개수 조회", description = "검색 조건에 맞는 예약의 전체 개수를 조회합니다.")
    @GetMapping("/count")
    public ResponseEntity<Integer> count(
            @ParameterObject @ModelAttribute ResvSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        if (!authUserJwtService.isRoot(authentication)) {
            search.setComId(authUserJwtService.getCurrentComId(authentication));
        }
        if (search.getStartDt() == null) {
            search.setStartDt(LocalDateTime.now().minusDays(30));
        }
        if (search.getEndDt() == null) {
            search.setEndDt(LocalDateTime.now());
        } else {
            search.setEndDt(search.getEndDt().toLocalDate().atTime(LocalTime.MAX)); // 23:59:59.999999999
        }
        return ResponseEntity.ok(service.getResvCount(search));
    }

    // 예약 통계 조회 GET /api/resv/admin/stats (전체/승인/대기/반려 건수)
    @Operation(summary = "예약 통계 조회", description = "회사 예약 현황(전체/승인/대기/반려 건수)을 조회합니다.")
    @GetMapping("/stats")
    public ResponseEntity<StatsResvResponse> stats(
            @ParameterObject @ModelAttribute ResvSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        if (!authUserJwtService.isRoot(authentication)) {
            search.setComId(authUserJwtService.getCurrentComId(authentication));
        }
        return ResponseEntity.ok(service.countByStats(search));
    }

    // 예약 승인 PUT /api/resv/admin/{revId}/approve
    @Operation(summary = "예약 승인", description = "대기 중인 예약을 승인 처리합니다.")
    @PutMapping("/{revId}/approve")
    public ResponseEntity<Map<String, Object>> approve(
            @Parameter(description = "승인할 예약 ID", example = "1", required = true) @PathVariable("revId") long revId,
            @Parameter(hidden = true) Authentication authentication) {
        Map<String, Object> result = new HashMap<>();

        ResvResponse existing = service.getResvDetail(revId);
        if (existing == null) {
            result.put("success", false);
            result.put("message", "해당 예약을 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
        if (authUserJwtService.isForbiddenCompanyAccess(authentication, existing.getComId())) {
            result.put("success", false);
            result.put("message", "본인 소속 회사의 예약만 승인할 수 있습니다.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        }

        ResvRequest approveDto = new ResvRequest();
        approveDto.setRevId(revId);
        approveDto.setStatus(STATUS_APPROVED);
        approveDto.setApprovedEmpId(authUserJwtService.getCurrentEmpId(authentication));
        approveDto.setApprovedAt(LocalDateTime.now());

        service.updateApprove(approveDto);
        result.put("success", true);
        result.put("message", "예약이 승인되었습니다.");
        return ResponseEntity.ok(result);
    }

    // 예약 반려 PUT /api/resv/admin/{revId}/reject
    @Operation(summary = "예약 반려", description = "대기 중인 예약을 반려 처리합니다.")
    @PutMapping("/{revId}/reject")
    public ResponseEntity<Map<String, Object>> reject(
            @Parameter(description = "반려할 예약 ID", example = "1", required = true) @PathVariable("revId") long revId,
            @RequestBody ResvRequest body,
            @Parameter(hidden = true) Authentication authentication) {
        Map<String, Object> result = new HashMap<>();

        ResvResponse existing = service.getResvDetail(revId);
        if (existing == null) {
            result.put("success", false);
            result.put("message", "해당 예약을 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
        if (authUserJwtService.isForbiddenCompanyAccess(authentication, existing.getComId())) {
            result.put("success", false);
            result.put("message", "본인 소속 회사의 예약만 반려할 수 있습니다.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        }

        ResvRequest rejectDto = new ResvRequest();
        rejectDto.setRevId(revId);
        rejectDto.setStatus(STATUS_REJECTED);
        rejectDto.setApprovedEmpId(authUserJwtService.getCurrentEmpId(authentication));
        rejectDto.setApprovedAt(LocalDateTime.now());
        rejectDto.setRejectReason(body.getRejectReason());

        service.updateReject(rejectDto);
        result.put("success", true);
        result.put("message", "예약이 반려되었습니다.");
        return ResponseEntity.ok(result);
    }
}