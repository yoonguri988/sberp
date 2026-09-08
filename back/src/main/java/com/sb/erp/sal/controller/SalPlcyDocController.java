package com.sb.erp.sal.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.response.SalPlcyDocResponse;
import com.sb.erp.sal.service.SalPlcyDocService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 회사별 급여 규정집·수당 기준·연말정산 가이드 문서 관리(AI Q&A의 근거 문서).
 * ROLE_ADMIN 전용, 소속 회사로 스코프 제한(ROOT는 comId를 지정해 다른 회사 문서도 등록/조회 가능).
 */
@Tag(name = "Salary AI Policy Doc REST API", description = "AI 급여 Q&A 근거 문서(PDF) 업로드·조회 API")
@RestController
@RequestMapping("/api/salai/docs")
@RequiredArgsConstructor
public class SalPlcyDocController {

    private final SalPlcyDocService salPlcyDocService;
    private final AuthUserJwtService authUserJwtService;

    @Operation(summary = "급여 규정 문서 업로드(개정)",
            description = "PDF 업로드 시 조항(제n조) 단위로 청킹+임베딩하여 RAG 검색 대상에 반영한다. "
                    + "기존 활성 문서는 자동으로 이력 처리된다. ROOT는 comId를 지정해 다른 회사 문서를 등록할 수 있다.")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SalPlcyDocResponse> upload(
            @Parameter(description = "정책 문서 PDF 파일") @RequestParam("file") MultipartFile file,
            @Parameter(description = "문서 제목(생략 시 원본 파일명 사용)", required = false)
            @RequestParam(value = "title", required = false) String title,
            @Parameter(description = "대상 회사 ID(ROOT만 사용, 생략 시 본인 소속 회사)", required = false)
            @RequestParam(value = "comId", required = false) Long comId,
            @Parameter(hidden = true) Authentication authentication) {
        SalPlcyDocResponse response = salPlcyDocService.register(file, title, comId, actor(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "급여 규정 문서 전체 조회(개정 이력 포함)", description = "본인 소속 회사 문서만 조회한다.")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<SalPlcyDocResponse>> findAll(@Parameter(hidden = true) Authentication authentication) {
        Long comId = authUserJwtService.getCurrentComId(authentication);
        return ResponseEntity.ok(salPlcyDocService.findAll(comId, actor(authentication)));
    }

    private ActorContext actor(Authentication authentication) {
        return new ActorContext(
                authUserJwtService.getCurrentEmpId(authentication),
                authUserJwtService.getCurrentComId(authentication),
                authUserJwtService.isRoot(authentication));
    }
}
