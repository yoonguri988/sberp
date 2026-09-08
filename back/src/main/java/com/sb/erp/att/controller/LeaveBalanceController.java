package com.sb.erp.att.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.att.dto.request.LeaveGrantRequest;
import com.sb.erp.att.dto.response.LeaveBalanceResponse;
import com.sb.erp.att.dto.response.LeaveGrantResponse;
import com.sb.erp.att.service.LeaveBalanceService;
import com.sb.erp.auth.service.AuthUserJwtService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/att/leave")
@RequiredArgsConstructor
@Tag(name = "연차 관리", description = "연차 발생, 조회, 차감 및 수동 조정")
public class LeaveBalanceController {

    private final LeaveBalanceService leaveBalanceService;
    private final AuthUserJwtService authUserJwtService;

    // ── 관리자 판별 ──
    private boolean isAdmin(Authentication auth) {
        List<String> roles = authUserJwtService.getCurrentRoles(auth);
        return roles != null && (roles.contains("ROLE_ADMIN") || roles.contains("ROOT"));
    }

    // ================================================================
    //  1. 조회
    // ================================================================

    // 본인 연차 현황 — 연도별 이력 목록
    @Operation(summary = "내 연차 현황 조회", description = "본인의 연도별 연차 잔여 현황 목록")
    @GetMapping("/balance/my")
    public ResponseEntity<List<LeaveBalanceResponse>> myBalances(Authentication auth) {

        // JWT → empId 추출 (AttendanceController.my() 와 동일 패턴)
        Long empId = authUserJwtService.getCurrentEmpId(auth);

        List<LeaveBalanceResponse> list = leaveBalanceService.getMyBalances(empId);
        return ResponseEntity.ok(list);
    }
    
    // 본인 연차 사용 내역 확인
    @Operation(summary = "본인 연차 사용 이력")
    @GetMapping("/grant/my")
    public ResponseEntity<List<LeaveGrantResponse>> myGrantHistory(Authentication auth) {
    	Long empId = authUserJwtService.getCurrentEmpId(auth);
        List<LeaveGrantResponse> list = leaveBalanceService.getGrantHistory(empId);
        return ResponseEntity.ok(list);
    }
    

    // 관리자 — 특정 연도 전체 사원 연차 현황
    @Operation(summary = "전체 사원 연차 현황", description = "특정 연도 전체 사원의 연차 잔여 현황")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/balance")
    public ResponseEntity<?> allBalances(
            Authentication auth,
            @RequestParam("year") Integer year,
            @RequestParam(name = "keyword", required = false) String keyword) {

        Long comId = authUserJwtService.getCurrentComId(auth);
        List<LeaveBalanceResponse> list = leaveBalanceService.getAllBalances(comId, year, keyword);
        return ResponseEntity.ok(list);
    }

    // 관리자 — 특정 사원의 특정 연도 연차 단건 조회
    @Operation(summary = "사원 연차 단건 조회", description = "특정 사원의 특정 연도 연차 잔여 현황")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/balance/{empId}")
    public ResponseEntity<?> balance(
            Authentication auth,
            @PathVariable("empId") Long empId,
            @Parameter(description = "조회 연도 (예: 2026)")
            @RequestParam("year") Integer year) {
        Long comId = authUserJwtService.getCurrentComId(auth);
        LeaveBalanceResponse result = leaveBalanceService.getBalance(empId, year, comId);
        return ResponseEntity.ok(result);
    }
    

    // 관리자 — 특정 사원의 부여/차감 이력
    @Operation(summary = "연차 부여/차감 이력 조회", description = "특정 사원의 연차 부여 및 사용 이력")
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/grant/{empId}")
    public ResponseEntity<?> grantHistory(
            Authentication auth,
            @PathVariable("empId") Long empId) {
        Long comId = authUserJwtService.getCurrentComId(auth);
        List<LeaveGrantResponse> list = leaveBalanceService.getGrantHistory(empId, comId);
        return ResponseEntity.ok(list);
    }


    // ================================================================
    //  2. 쓰기
    // ================================================================

    @Operation(summary = "연차 발생", description = "입사일 기준 근로기준법에 따른 연차 자동 계산 및 부여")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/calculate/{empId}")
    public ResponseEntity<?> calculate(
            Authentication auth,
            @PathVariable("empId") Long empId,
            @Parameter(description = "발생 연도 (예: 2026)")
            @RequestParam("year") Integer year) {

        Long comId = authUserJwtService.getCurrentComId(auth);
    	try {
            LeaveBalanceResponse result = leaveBalanceService.calculateAnnual(empId, year, comId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }
    
    @Operation(summary = "전체 사원 연차 일괄 발생")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/calculate-all")
    public ResponseEntity<?> calculateAll(
            Authentication auth,
            @RequestParam("year") Integer year) {
        Long comId = authUserJwtService.getCurrentComId(auth);
        int count = leaveBalanceService.calculateAllForYear(comId, year);
        return ResponseEntity.ok(Map.of(
            "message", year + "년 연차 일괄 발생 완료",
            "count", count
        ));
    }

    @Operation(summary = "연차 사용 차감", description = "연차 또는 반차 사용 시 잔여 차감 처리")
    @PostMapping("/deduct")
    public ResponseEntity<?> deduct(
            Authentication auth,
            @Valid @RequestBody LeaveGrantRequest request) {
    	
        // 본인 연차 사용 시 JWT empId를 강제 세팅
        // → 다른 사원의 연차를 본인이 차감하는 것을 방지
        Long empId = authUserJwtService.getCurrentEmpId(auth);

        // 관리자가 다른 사원의 연차를 차감하는 경우에만 request.empId → 이 경로만 comId 검증 필요
        if (isAdmin(auth) && request.getEmpId() != null) {
            Long comId = authUserJwtService.getCurrentComId(auth);
            LeaveGrantResponse result =
                    leaveBalanceService.deductLeave(request.getEmpId(), request, comId);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }

        LeaveGrantResponse result = leaveBalanceService.deductLeave(empId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @Operation(summary = "연차 수동 조정", description = "관리자가 수동으로 연차를 부여하거나 차감")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/adjust")
    public ResponseEntity<?> adjust(
            Authentication auth,
            @Valid @RequestBody LeaveGrantRequest request) {
        Long comId = authUserJwtService.getCurrentComId(auth);
        LeaveGrantResponse result = leaveBalanceService.adjustLeave(request, comId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
}
