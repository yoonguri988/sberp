package com.sb.erp.emp.chatbot.controller;

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
import com.sb.erp.emp.chatbot.dto.request.HrAiChatRequest;
import com.sb.erp.emp.chatbot.dto.response.HrAiChatHistoryResponse;
import com.sb.erp.emp.chatbot.dto.response.HrAiChatResponse;
import com.sb.erp.emp.chatbot.service.HrAiChatService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/*
 HR 규정 AI 챗봇(RAG) — 사원용 질의응답 + 대화 이력 API.
 로그인한 사원이면 누구나 본인 소속 회사의 HR 규정에 대해 질문할 수 있음
*/
@Tag(name = "사내 규정 AI Chat REST API",
     description = "HR 규정(근태·연차·복리후생 등) AI 질의응답 API")
@RestController
@RequestMapping("/api/hrai")
@RequiredArgsConstructor
public class HrAiChatController {

    private final HrAiChatService hrAiChatService;
    private final AuthUserJwtService authUserJwtService;

    /*
     본인 소속 회사의 HR 규정 문서에서 근거 조항을 검색해 답변
     근거를 찾지 못하면 AI를 호출하지 않고 고정 안내문만 반환(환각 방지)
     */
    @Operation(summary = "HR 규정 AI 질의응답",
            description = "본인 소속 회사의 HR 규정 문서에서 근거 조항을 검색해 답변한다. "
                    + "근거를 찾지 못하면 GPT를 호출하지 않고 고정 안내문만 반환한다(환각 방지).")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/chat")
    public ResponseEntity<HrAiChatResponse> chat(
            @Valid @RequestBody HrAiChatRequest request,
            @Parameter(hidden = true) Authentication authentication) {

        Long empId = authUserJwtService.getCurrentEmpId(authentication);
        Long comId = authUserJwtService.getCurrentComId(authentication);
        return ResponseEntity.ok(hrAiChatService.ask(request, empId, comId));
    }

    // 본인의 HR AI 챗봇 대화 이력을 최신순으로 조회
    @Operation(summary = "본인 HR AI 대화 이력 조회")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/chat/history")
    public ResponseEntity<Page<HrAiChatHistoryResponse>> history(
            @Parameter(hidden = true) Authentication authentication,
            @ParameterObject Pageable pageable) {

        Long empId = authUserJwtService.getCurrentEmpId(authentication);
        return ResponseEntity.ok(hrAiChatService.myHistory(empId, pageable));
    }
}
