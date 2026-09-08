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

import com.sb.erp.sal.dto.request.SalaryIncomeTaxBracketCreateRequest;
import com.sb.erp.sal.dto.response.SalaryIncomeTaxBracketResponse;
import com.sb.erp.sal.service.SalaryIncomeTaxBracketService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 소득세 간이 구간표 관리
 * 회사 무관 전국 공통 근사치 정책이므로 등록은 ROOT 전용이다.
 */
@Tag(name = "Salary Income Tax Bracket REST API", description = "기본급 구간별 단순 정률 소득세 근사치 구간표 조회·등록 API (부양가족 미반영)")
@RestController
@RequestMapping("/api/calc/salinctaxbrkt")
@RequiredArgsConstructor
public class SalaryIncomeTaxBracketController {

    private final SalaryIncomeTaxBracketService salaryIncomeTaxBracketService;

    @Operation(summary = "소득세 구간표 행 등록")
    @PreAuthorize("hasAuthority('ROOT')")
    @PostMapping
    public ResponseEntity<SalaryIncomeTaxBracketResponse> register(
            @Valid @RequestBody SalaryIncomeTaxBracketCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(salaryIncomeTaxBracketService.register(request));
    }

    @Operation(summary = "소득세 구간표 전체 조회 (구간 하한 오름차순)")
    @PreAuthorize("hasAnyAuthority('ROOT','ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<SalaryIncomeTaxBracketResponse>> findAll() {
        return ResponseEntity.ok(salaryIncomeTaxBracketService.findAll());
    }
}
