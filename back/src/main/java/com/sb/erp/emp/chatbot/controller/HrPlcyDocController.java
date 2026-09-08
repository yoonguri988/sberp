package com.sb.erp.emp.chatbot.controller;

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
import com.sb.erp.emp.chatbot.dto.response.HrPlcyDocResponse;
import com.sb.erp.emp.chatbot.service.HrPlcyDocService;
import com.sb.erp.global.security.ActorContext;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;


@Tag(name = "사내 규정 AI Policy Doc REST API",
     description = "HR 규정 AI 챗봇용 문서 업로드·조회 API")
@RestController
@RequestMapping("/api/hrai/docs")
@RequiredArgsConstructor
public class HrPlcyDocController {

    private final HrPlcyDocService hrPlcyDocService;
    private final AuthUserJwtService authUserJwtService;

    /*
     HR 규정 문서 업로드(개정).
     PDF를 업로드하면 조항(제n조) 단위로 청킹 + 임베딩하여 RAG 검색 대상에 반영된다.
     기존 활성 문서는 자동으로 이력 처리된다.
	 ROOT는 comId를 지정해 다른 회사 문서를 등록할 수 있다.
    */
    @Operation(summary = "HR 규정 문서 업로드(개정)",
            description = "PDF 업로드 시 조항(제n조) 단위로 청킹+임베딩하여 RAG 검색 대상에 반영한다. "
                    + "기존 활성 문서는 자동으로 이력 처리된다.")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HrPlcyDocResponse> upload(
            @Parameter(description = "HR 규정 문서 PDF 파일")
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "문서 제목 (생략 시 원본 파일명 사용)", required = false)
            @RequestParam(value = "title", required = false) String title,

            @Parameter(description = "대상 회사 ID (ROOT만 사용, 생략 시 본인 소속 회사)", required = false)
            @RequestParam(value = "comId", required = false) Long comId,

            @Parameter(hidden = true) Authentication authentication) {

        HrPlcyDocResponse response = hrPlcyDocService.register(
                file, title, comId, actor(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 본인 소속 회사 문서 조회
    @Operation(summary = "HR 규정 문서 전체 조회 (개정 이력 포함)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<HrPlcyDocResponse>> findAll(
            @Parameter(hidden = true) Authentication authentication) {

        Long comId = authUserJwtService.getCurrentComId(authentication);
        return ResponseEntity.ok(hrPlcyDocService.findAll(comId, actor(authentication)));
    }

    /*
     Authentication에서 ActorContext를 조립하는 헬퍼.
     Controller가 JWT 정보를 꺼내서 Service에 파라미터로 전달
     Service가 Security에 직접 의존하지 않게
    */
    private ActorContext actor(Authentication authentication) {
        return new ActorContext(
                authUserJwtService.getCurrentEmpId(authentication),
                authUserJwtService.getCurrentComId(authentication),
                authUserJwtService.isRoot(authentication));
    }
}
