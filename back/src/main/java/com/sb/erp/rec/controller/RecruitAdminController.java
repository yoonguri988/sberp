package com.sb.erp.rec.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.rec.dto.request.RecruitRequest;
import com.sb.erp.rec.dto.request.RecruitSearchRequest;
import com.sb.erp.rec.dto.response.RecruitResponse;
import com.sb.erp.rec.service.RecruitService;
import com.sb.erp.util.dto.PagingUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "채용공고(관리자)", description = "직원용 관리자 API - 공고 CRUD")
@RestController
@RequestMapping("/api/admin/recruit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
public class RecruitAdminController {

    private final RecruitService recruitService;

    // 공고 목록 — 같은 회사 공고만 조회. ROOT는 전체 조회
    @Operation(summary = "채용공고 목록")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAdminList(
            @ModelAttribute RecruitSearchRequest search,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        boolean isRoot = principal.getRoles().contains("ROOT");
        if (!isRoot) {
            search.setComId(principal.getComId());
        }

        int totalCnt = recruitService.selectCnt(search);
        PagingUtil paging = new PagingUtil(totalCnt, search.getPstartno());
        List<RecruitResponse> list = recruitService.selectAll(search);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("paging", paging);
        return ResponseEntity.ok(result);
    }

    // 공고 상세 — 같은 회사 + ROOT는 전체 접근 허용
    @Operation(summary = "채용공고 상세")
    @GetMapping("/{recId}")
    public ResponseEntity<RecruitResponse> getDetail(
            @PathVariable("recId") Long recId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        RecruitResponse dto = recruitService.getDetail(recId);

        boolean isRoot = principal.getRoles().contains("ROOT");
        if (!isRoot && !dto.getComId().equals(principal.getComId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(dto);
    }

    // 공고 등록
    @Operation(summary = "채용공고 등록")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @Valid @RequestBody RecruitRequest req,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        Long recId = recruitService.insert(req, principal.getComId(), principal.getEmpId());

        Map<String, Object> result = new HashMap<>();
        if (recId != null) {
            result.put("success", true);
            result.put("message", "채용공고 등록 성공");
            result.put("recId", recId);
            result.put("recruit", recruitService.getDetail(recId));  // 등록된 상세도 같이 반환
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }

        result.put("success", false);
        result.put("message", "채용공고 등록 실패");
        return ResponseEntity.internalServerError().body(result);
    }

    // 공고 수정
    @Operation(summary = "채용공고 수정")
    @PutMapping("/{recId}")
    public ResponseEntity<Map<String, Object>> update(
    		@PathVariable("recId") Long recId,
            @Valid @RequestBody RecruitRequest req,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        recruitService.update(recId, req, principal.getComId());
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "공고 수정 성공");
        result.put("recId", recId);
        return ResponseEntity.ok().build();
    }

    // 공고 삭제
    @Operation(summary = "채용공고 삭제")
    @DeleteMapping("/{recId}")
    public ResponseEntity<Map<String, Object>> delete(
    		@PathVariable("recId") Long recId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        recruitService.delete(recId, principal.getComId());
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "공고 삭제 성공");
        result.put("recId", recId);
        return ResponseEntity.ok(result);
    }
    
    // 채용공고 복제
    @Operation(summary = "채용공고 복제")
    @GetMapping("/{recId}/clone")
    public ResponseEntity<RecruitRequest> cloneRecruit(
            @PathVariable("recId") Long recId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        Long comId = principal.getComId();
        return ResponseEntity.ok(recruitService.getCloneData(recId, comId));
    }
}