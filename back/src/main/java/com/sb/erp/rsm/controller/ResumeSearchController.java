package com.sb.erp.rsm.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.apct.entity.Applicant;
import com.sb.erp.apct.repository.ApplicantRepository;
import com.sb.erp.chunk.service.ResumeChunkService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.rec.entity.Recruit;
import com.sb.erp.rec.repository.RecruitRepository;
import com.sb.erp.rsm.dto.response.ResumeResponse;
import com.sb.erp.rsm.dto.response.ResumeSearchResponse;
import com.sb.erp.rsm.entity.Resume;
import com.sb.erp.rsm.repository.ResumeRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "이력서 검색 Api", description = "이력서 RAG 검색")
@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
public class ResumeSearchController {

	private final ApplicantRepository applicantRepository;
    private final ResumeChunkService resumeChunkService;
    private final RecruitRepository recruitRepository;
    private final ResumeRepository resumeRepository;

    @Operation(summary = "이력서 RAG 검색")
    @GetMapping("/search")
    public ResponseEntity<List<ResumeSearchResponse>> search(
            @RequestParam("recId") Long recId,
            @RequestParam("query") String query,
            @RequestParam(value = "topK", defaultValue = "5") int topK,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        Recruit recruit = recruitRepository.findById(recId).orElse(null);
        if (recruit == null) { return ResponseEntity.notFound().build(); }

        // ROOT는 전체 접근 허용, 나머지는 같은 회사인지 확인
        boolean isRoot = principal.getRoles().contains("ROOT");
        if (!isRoot && !recruit.getCompany().getComId().equals(principal.getComId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<ResumeSearchResponse> response = resumeChunkService.search(recId, query, topK);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "지원자 이력서 상세 조회")
    @GetMapping("/applicants/{apctId}")
    public ResponseEntity<ResumeResponse> getResume(
            @PathVariable("apctId") Long apctId,
            @RequestParam("recId") Long recId,
            @AuthenticationPrincipal CustomUserPrincipal principal) {

        Recruit recruit = recruitRepository.findById(recId).orElse(null);
        if (recruit == null) { return ResponseEntity.notFound().build(); }

        boolean isRoot = principal.getRoles().contains("ROOT");
        if (!isRoot && !recruit.getCompany().getComId().equals(principal.getComId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Applicant applicant = applicantRepository
                .findByApctIdAndRecruit_RecId(apctId, recId)
                .orElse(null);
        if (applicant == null) { return ResponseEntity.notFound().build(); }

        Resume resume = resumeRepository.findByApplicant_ApctId(apctId).orElse(null);
        if (resume == null) { return ResponseEntity.notFound().build(); }

        return ResponseEntity.ok(new ResumeResponse(resume));
    }
}