package com.sb.erp.apct.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.apct.dto.request.ApplicantRequest;
import com.sb.erp.apct.dto.response.MyApplicationResponse;
import com.sb.erp.apct.service.ApplicantService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "지원자(공개)", description = "지원자용 공개 API - 지원서 제출, 내 지원현황 조회")
@RestController
@RequestMapping("/api/public/applicant")   // ★ 경로만 수정 (public/api → api/public)
@RequiredArgsConstructor
public class ApplicantController {

    private final ApplicantService applicantService;

    // 지원서 제출 - 소셜로그인 필요
    @Operation(summary = "지원서 제출")
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> apply(@Validated(ApplicantRequest.OnCreate.class)
    								   @RequestBody ApplicantRequest req,
                                       Authentication authentication) {
        Long apctId = applicantService.apply(req, authentication);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "지원서 제출 성공");
        result.put("apctId", apctId);
        result.put("applicant", applicantService.getDetail(apctId));
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // 내 지원현황 조회 - 소셜로그인 필요
    @Operation(summary = "내 지원현황 조회")
    @GetMapping("/me")
    public ResponseEntity<List<MyApplicationResponse>> getMyApplications(Authentication authentication) {
        return ResponseEntity.ok(applicantService.getMyApplications(authentication));
    }
    
    // 지원 정보 수정 - 소셜로그인 필요
    @Operation(summary = "지원 정보 수정")
    @PutMapping("/{apctId}")
    public ResponseEntity<Map<String, Object>> update(
    		@PathVariable("apctId") Long apctId,
            @Valid @RequestBody ApplicantRequest req,
            Authentication authentication) {
        applicantService.update(apctId, req, authentication);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "지원 정보 수정 성공");
        result.put("apctId", apctId);
        return ResponseEntity.ok(result);
    }

    // 지원 취소 - 소셜로그인 필요, 본인 것만
    @Operation(summary = "지원 취소")
    @DeleteMapping("/{apctId}")
    public ResponseEntity<Map<String, Object>> cancel(@PathVariable("apctId") Long apctId, Authentication authentication) {
        applicantService.cancel(apctId, authentication);
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "지원 취소 성공");
        result.put("apctId", apctId);
        return ResponseEntity.ok(result);
    }
}