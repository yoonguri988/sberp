package com.sb.erp.rsm.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.apct.entity.Applicant;
import com.sb.erp.apct.oauth2.ApplicantPrincipal;
import com.sb.erp.apct.repository.ApplicantRepository;
import com.sb.erp.chunk.entity.ResumeChunk;
import com.sb.erp.chunk.repository.ResumeChunkRepository;
import com.sb.erp.global.integration.OpenAiGpt;
import com.sb.erp.global.integration.OpenAiGpt.ResumeAnalysis;
import com.sb.erp.global.integration.ResumeEmbeddingClient;
import com.sb.erp.rsm.dto.request.ResumeRequest;
import com.sb.erp.rsm.dto.response.ResumeResponse;
import com.sb.erp.rsm.entity.Resume;
import com.sb.erp.rsm.repository.ResumeRepository;
import com.sb.erp.util.dto.FileUploadDto;
import com.sb.erp.util.dto.FileUploadType;
import com.sb.erp.util.dto.FileUploadUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResumeService {
	
    private final ResumeRepository resumeRepository;
    private final ApplicantRepository applicantRepository;
    private final ResumeChunkRepository resumeChunkRepository;
    private final ResumeEmbeddingClient embeddingClient;
    private final OpenAiGpt openAiGpt;
    private static final int CHUNK_SIZE = 800;
    private static final int CHUNK_OVERLAP = 100;
    
    // 이력서 내 것 조회 (지원자 본인만, 미리보기용)
    public Resume getMyResume(Long apctId, Authentication authentication) {
        Applicant applicant = applicantRepository.findById(apctId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지원자입니다."));

        ApplicantPrincipal principal = (ApplicantPrincipal) authentication.getPrincipal();
        if (!applicant.getProvider().equals(principal.getProvider())
                || !applicant.getProviderId().equals(principal.getProviderId())) {
            throw new IllegalArgumentException("본인 지원 건의 이력서만 조회할 수 있습니다.");
        }

        return resumeRepository.findByApplicant_ApctId(apctId)
                .orElseThrow(() -> new IllegalArgumentException("제출된 이력서가 없습니다."));
    }
    
    // 이력서 업로드
    @Transactional
    public ResumeResponse upload(ResumeRequest req, MultipartFile file, Authentication authentication) {

    	// 1. 파일 검증
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이력서 파일이 없습니다.");
        }

        if (!"application/pdf".equalsIgnoreCase(file.getContentType())) {
            throw new IllegalArgumentException("PDF 형식의 이력서만 업로드할 수 있습니다.");
        }

        // 2. 지원자 조회
        Applicant applicant = applicantRepository.findById(req.getApctId())
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 지원자입니다."));
        
        // ★ 소유권 검증 
        ApplicantPrincipal principal = (ApplicantPrincipal) authentication.getPrincipal();
        if (!applicant.getProvider().equals(principal.getProvider())
                || !applicant.getProviderId().equals(principal.getProviderId())) {
            throw new IllegalArgumentException("본인 지원 건의 이력서만 업로드할 수 있습니다.");
        }
        
        // 검토 후 이력서 재업로드 방지
        if (!"RECEIVED".equals(applicant.getApctStatus())) {
            throw new IllegalStateException("이미 검토가 시작된 지원 건은 이력서를 재업로드할 수 없습니다.");
        }

        // 3. 기존 이력서 조회
        Resume existing = resumeRepository
                .findByApplicant_ApctId(req.getApctId())
                .orElse(null);

        // 4. 기존 이력서 + 파일 + 청크 삭제
        if (existing != null) {

            if (existing.getRsmFileUrl() != null) {
                String oldPath =
                        FileUploadUtil.resolveDiskPath(existing.getRsmFileUrl());

                FileUploadUtil.delete(oldPath);
            }

            resumeChunkRepository.deleteByResume_RsmId(existing.getRsmId());
            resumeRepository.delete(existing);
        }

        // 5. 파일 저장 + PDF 텍스트 추출
        FileUploadDto uploadResult =
                FileUploadUtil.upload(file, FileUploadType.RESUME);

        String text;

        try {
            text = extractText(uploadResult.getSavedPath());

        } catch (IOException e) {

            log.error("PDF 텍스트 추출 실패", e);

            FileUploadUtil.delete(uploadResult.getSavedPath());

            throw new IllegalStateException(
                    "PDF 텍스트 추출에 실패했습니다: " + e.getMessage(), e);
        }

        // 6. 추출된 텍스트 검증
        if (text == null || text.isBlank()) {
            throw new IllegalStateException(
                    "PDF에서 추출된 텍스트가 없습니다.");
        }

        // 7. 텍스트 청크 분할
        List<String> chunks = splitIntoChunks(text);

        if (chunks.isEmpty()) {
            throw new IllegalStateException(
                    "이력서 내용을 청크로 분할하지 못했습니다.");
        }

        // 8. 이력서 저장
        Resume resume = Resume.builder()
                .applicant(applicant)
                .rsmFileName(file.getOriginalFilename())
                .rsmFileUrl(uploadResult.getFileUrl())
                .rsmExtractedText(text)
                .rsmStatus("PENDING")
                .rsmUploadedAt(LocalDateTime.now())
                .build();

        Resume saved = resumeRepository.save(resume);

        // 9. 청크 생성 + 임베딩 생성 + 저장
        for (int i = 0; i < chunks.size(); i++) {

            String chunkText = chunks.get(i);

            try {
                double[] vector = embeddingClient.embed(chunkText);

                ResumeChunk chunk = ResumeChunk.builder()
                        .resume(saved)
                        .chunkOrder((long) i)
                        .chunkText(chunkText)
                        .chunkEmbedding(embeddingClient.toJson(vector))
                        .build();

                resumeChunkRepository.save(chunk);

            } catch (Exception e) {
                throw new IllegalStateException(
                        "이력서 청크 임베딩 생성에 실패했습니다. "
                        + "(chunkOrder: " + i + ")", e);
            }
        }

        // 10. AI 이력서 분석
        try {
            ResumeAnalysis analysis =
                    openAiGpt.analyzeResume(text, applicant.getRecruit());

            saved.setRsmAiSummary(analysis.summary());
            saved.setRsmFitScore(analysis.fitScore());
            saved.setRsmAnalyzedAt(LocalDateTime.now());

        } catch (Exception e) {
            throw new IllegalStateException( "이력서 AI 분석에 실패했습니다.", e);
        }

        // 11. 분석 완료
        saved.setRsmStatus("COMPLETED");

        return new ResumeResponse(saved);
    }
    /**
     * PDF 파일에서 텍스트를 추출한다.
     *
     * 업로드된 MultipartFile의 바이트 데이터를 PDFBox로 읽고,
     * PDF 전체 페이지의 텍스트를 하나의 문자열로 반환한다.
     *
     * @param file 업로드된 PDF 이력서
     * @return PDF에서 추출한 전체 텍스트
     * @throws IOException PDF 파일을 읽을 수 없는 경우
     */
    private String extractText(String filePath) throws IOException {
        try (PDDocument document =
                Loader.loadPDF(new java.io.File(filePath))) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(document);
        }
    }
    
    /**
     * 추출된 이력서 텍스트를 RAG 검색에 사용할 수 있도록 여러 개의 청크로 분할한다.
     *
     * 한 청크의 최대 길이는 800자로 설정하고,
     * 청크 사이에 100자를 겹치도록 만들어 문장이 잘리는 경우에도
     * 앞뒤 문맥이 어느 정도 유지되도록 한다.
     *
     * 예:
     * 1번 청크: 0 ~ 800
     * 2번 청크: 700 ~ 1500
     * 3번 청크: 1400 ~ 2200
     *
     * 이후 각 청크는 OpenAI Embedding API를 통해 벡터로 변환하고
     * resume_chunk 테이블에 chunk_text와 chunk_embedding으로 저장한다.
     *
     * @param text PDF에서 추출한 전체 이력서 텍스트
     * @return 분할된 이력서 청크 목록
     */
    private List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();
        text = text.replaceAll("\\s+", " ").trim();
        int start = 0;
        while (start < text.length()) {
            int end = Math.min(start + CHUNK_SIZE, text.length());
            String chunk = text.substring(start, end).trim();
            if (!chunk.isBlank()) { chunks.add(chunk); }
            if (end == text.length()) { break; }
            start = end - CHUNK_OVERLAP;
        }
        return chunks;
    }
}
