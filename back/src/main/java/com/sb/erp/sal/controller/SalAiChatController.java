package com.sb.erp.sal.controller;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.sal.dto.request.SalAiChatRequest;
import com.sb.erp.sal.dto.response.SalAiChatHistoryResponse;
import com.sb.erp.sal.dto.response.SalAiChatResponse;
import com.sb.erp.sal.service.SalAiChatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** AI 급여 Q&A(RAG) 챗봇. 로그인한 사용자면 누구나 본인 소속 회사의 급여 규정에 대해 질의할 수 있다. */
@Tag(name = "Salary AI Chat REST API", description = "급여/연말정산 규정 AI 질의응답(RAG) API")
@RestController
@RequestMapping("/api/salai")
@RequiredArgsConstructor
public class SalAiChatController {

    private final SalAiChatService salAiChatService;
    private final AuthUserJwtService authUserJwtService;

    @Operation(summary = "급여 규정 AI 질의응답",
            description = "본인 소속 회사의 급여 규정 문서에서 근거 조항을 검색해 답변한다. "
                    + "근거를 찾지 못하면 GPT를 호출하지 않고 고정 안내문만 반환한다(환각 방지).")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/chat")
    public ResponseEntity<SalAiChatResponse> chat(
            @Valid @RequestBody SalAiChatRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        Long empId = authUserJwtService.getCurrentEmpId(authentication);
        Long comId = authUserJwtService.getCurrentComId(authentication);
        return ResponseEntity.ok(salAiChatService.ask(request, empId, comId));
    }

    @Operation(summary = "본인 AI 급여 Q&A 대화 이력 조회")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/chat/history")
    public ResponseEntity<Page<SalAiChatHistoryResponse>> history(
            @Parameter(hidden = true) Authentication authentication,
            @ParameterObject Pageable pageable) {
        Long empId = authUserJwtService.getCurrentEmpId(authentication);
        return ResponseEntity.ok(salAiChatService.myHistory(empId, pageable));
    }
}
