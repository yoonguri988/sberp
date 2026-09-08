package com.sb.erp.sal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.sal.dto.request.SalaryRatePolicyCreateRequest;
import com.sb.erp.sal.dto.response.SalaryRatePolicyResponse;
import com.sb.erp.sal.service.SalaryRatePolicyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 4대보험 요율 정책 관리
 * 회사 무관 전국 공통 법정 요율이므로 등록/수정은 ROOT 전용이다.
 */
@Tag(name = "Salary Rate Policy REST API", description = "국민연금/건강보험/장기요양보험료/고용보험 요율 정책 조회·등록 API")
@RestController
@RequestMapping("/api/calc/salrateplcy")
@RequiredArgsConstructor
public class SalaryRatePolicyController {

    private final SalaryRatePolicyService salaryRatePolicyService;

    @Operation(summary = "4대보험 요율 정책 등록", description = "기존 유효 정책은 자동 이력 처리")
    @PreAuthorize("hasAuthority('ROOT')")
    @PostMapping
    public ResponseEntity<SalaryRatePolicyResponse> register(
    		@Valid @RequestBody SalaryRatePolicyCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salaryRatePolicyService.register(request));
    }

    @Operation(summary = "4대보험 요율 정책 전체 조회", description = "이력 포함, 최신순")
    @PreAuthorize("hasAnyAuthority('ROOT','ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<SalaryRatePolicyResponse>> findAll() {
        return ResponseEntity.ok(salaryRatePolicyService.findAll());
    }
}
