package com.sb.erp.auth.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.dto.request.LoginHistorySearchRequest;
import com.sb.erp.auth.dto.response.LoginHistoryResponse;
import com.sb.erp.auth.dto.response.LoginHistoryStatsResponse;
import com.sb.erp.auth.service.LoginHistoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 로그인 이력 관리 - 시스템 관리자 확인 페이지
 * ADMIN 또는 ROOT 권한만 접근 가능.
 */
@Tag(name = "Login History REST API", description = "시스템 관리자(ROOT)만 로그인 성공/실패 이력 조회 API")
@RestController
@RequestMapping("/api/admin/login-history")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROOT')")
public class LoginHistoryController {

    private final LoginHistoryService loginHistoryService;

    @Operation(summary = "로그인 이력 목록 조회", description = "이메일/성공-실패/기간 조건으로 검색 및 페이징")
    @GetMapping
    public Map<String, Object> list(@ModelAttribute LoginHistorySearchRequest search) {
        Page<LoginHistoryResponse> result = loginHistoryService.search(search);
        return Map.of(
                "list", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "page", search.getPage() == null ? 1 : search.getPage()
        );
    }

    @Operation(summary = "로그인 이력 통계", description = "검색 조건에 해당하는 전체/성공/실패 건수")
    @GetMapping("/stats")
    public LoginHistoryStatsResponse stats(@ModelAttribute LoginHistorySearchRequest search) {
        return loginHistoryService.stats(search);
    }
}
