package com.sb.erp.rec.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.rec.dto.response.RecruitResponse;
import com.sb.erp.rec.service.RecruitService;
import com.sb.erp.util.dto.PagingUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "채용공고(공개)", description = "비회원 지원자용 공개 API - OPEN 공고 조회")
@RestController
@RequestMapping("/api/public/recruit")
@RequiredArgsConstructor
public class RecruitController {

    private final RecruitService recruitService;

    @Operation(summary = "채용공고 목록")
    @GetMapping
    public ResponseEntity<Map<String, Object>> getOpenList(
    		@RequestParam(name = "comId", required = false) Long comId,
    		@RequestParam(name = "recTitle", required = false) String recTitle,
            @RequestParam(name = "pstartno", defaultValue = "1") int pstartno) {

        int onepagelist = 10;
        int totalCnt = recruitService.getOpenCnt(comId, recTitle);
        PagingUtil paging = new PagingUtil(totalCnt, pstartno);
        List<RecruitResponse> list = recruitService.getOpenListAsList(comId, recTitle, pstartno, onepagelist);

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("paging", paging);
        return ResponseEntity.ok(result);
    }
    
    @Operation(summary = "채용공고 상세")
    @GetMapping("/{recId}")
    public ResponseEntity<RecruitResponse> getDetail(@PathVariable("recId") Long recId) {
        return ResponseEntity.ok(recruitService.getDetail(recId));
    }
}