package com.sb.erp.sal.controller;

import java.time.LocalDateTime;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.response.SalaryChangeHistoryResponse;
import com.sb.erp.sal.entity.type.ChangeType;
import com.sb.erp.sal.service.SalaryChangeHistoryService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 8. 급여 변경이력 관리
 * 이력은 시스템이 자동 기록하며(급여기준/급여지급 서비스 내부에서 기록), 조회만 제공한다.
 */
@Tag(name = "Salary Change History REST API", description = "급여 등록/수정/삭제/상태변경 등 모든 변경 이력 조회 API")
@RestController
@RequestMapping("/api/salhist")
@RequiredArgsConstructor
public class SalaryChangeHistoryController {

    private final SalaryChangeHistoryService salaryChangeHistoryService;
    private final AuthUserJwtService authUserJwtService;

    /** 8-1 급여 변경이력 조회 - 행위자/처리유형/기간 필터, 페이지네이션. ROLE_ADMIN가 아니면 소속 회사로 스코프 제한 */
    @Operation(summary = "급여 변경이력 조회", description = "행위자/처리유형/기간 필터, 페이지네이션. ROLE_ADMIN가 아니면 소속 회사로 스코프 제한")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<Page<SalaryChangeHistoryResponse>> search(
    		@Parameter(description = "사원 ID", example = "132", required = false) @RequestParam(value="actorEmpId", required = false) Long actorEmpId,
    		@Parameter(description = "급여 변경이력 처리 유형", required = false) @RequestParam(value="changeType", required = false) ChangeType changeType,
    		@Parameter(description = "시작일", required = false) @RequestParam(value="from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
    		@Parameter(description = "종료일", required = false) @RequestParam(value="to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @Parameter(hidden = true) Authentication authentication,
            @ParameterObject Pageable pageable) {
        ActorContext actor = new ActorContext(
                authUserJwtService.getCurrentEmpId(authentication),
                authUserJwtService.getCurrentComId(authentication),
                authUserJwtService.isRoot(authentication));
        return ResponseEntity.ok(salaryChangeHistoryService.search(actorEmpId, changeType, from, to, actor, pageable));
    }
}
