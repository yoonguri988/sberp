package com.sb.erp.sal.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.chunk.entity.SalPlcyChunk;
import com.sb.erp.global.integration.SalAiEmbeddingClient;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.response.SalPlcyDocResponse;
import com.sb.erp.sal.entity.SalPlcyDoc;
import com.sb.erp.sal.repository.SalPlcyDocRepository;
import com.sb.erp.util.dto.FileUploadDto;
import com.sb.erp.util.dto.FileUploadType;
import com.sb.erp.util.dto.FileUploadUtil;

import lombok.RequiredArgsConstructor;

/**
 * 회사별 급여 규정집·수당 기준·연말정산 가이드 문서(sal_plcy_doc) 관리.
 *
 * 업로드 흐름(RAG "Ingestion" 단계): PDF 업로드 -> PDFBox로 페이지별 텍스트 추출
 * -> 조항(제n조) 단위 Chunking(+ 너무 긴 조항은 슬라이딩 윈도우로 재분할)
 * -> 청크마다 OpenAI 임베딩 호출 -> SalPlcyChunk로 저장.
 *
 * 문서를 새로 올리면(=개정) in-place update가 아니라 SalStd/SalPosAlw와 동일한 버저닝 방식을 쓴다:
 * 기존 활성(actv=1) 문서를 종료 처리하고 새 문서를 새 버전으로 추가한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalPlcyDocService {

    // 조항 헤더 패턴: "제6조(식대)"처럼 숫자+조+괄호 제목. 괄호 안 제목은 과매칭 방지를 위해 길이를 제한한다.
    private static final Pattern ARTICLE_PATTERN = Pattern.compile("제\\d+조\\([^)]{1,30}\\)");
    // 조항이 발견되지 않는 문서(마크다운 등 향후 확장 대비) fallback용 고정 길이 청크 설정
    private static final int FALLBACK_CHUNK_SIZE = 700;
    private static final int FALLBACK_OVERLAP = 100;
    // 조항 하나가 너무 길면(예: 표가 많은 조항) 재분할한다
    private static final int MAX_CHUNK_SIZE = 800;
    private static final int CHUNK_OVERLAP = 100;

    private final SalPlcyDocRepository salPlcyDocRepository;
    private final SalAiEmbeddingClient embeddingClient;

    @Transactional
    public SalPlcyDocResponse register(MultipartFile file, String title, Long targetComId, ActorContext actor) {
        Long comId = (targetComId != null) ? targetComId : actor.comId();
        if (!actor.canAccessCompany(comId)) {
            throw new AccessDeniedException("다른 회사의 급여 규정 문서는 등록할 수 없습니다.");
        }

        // 파일 바이트를 먼저 한 번만 읽어서 확보해둔다.
        // FileUploadUtil.upload()가 내부적으로 MultipartFile.transferTo()를 호출하는데, Tomcat의
        // DiskFileItem처럼 임시파일 기반 구현체는 transferTo()가 "복사"가 아니라 "이동(rename)"으로
        // 동작할 수 있다 - 그러면 그 뒤에 같은 MultipartFile로 getBytes()/getInputStream()을 다시
        // 읽으려 할 때 임시파일을 더 이상 찾을 수 없어 실패한다(에러 메시지에 임시파일 경로만 찍히는
        // 증상이 바로 이것). 그래서 업로드 저장을 하기 "전에" 딱 한 번 바이트를 읽어 PDF 추출에 재사용한다.
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new IllegalStateException("업로드된 파일을 읽는 중 오류가 발생했습니다: " + e.getMessage(), e);
        }

        FileUploadDto uploaded = FileUploadUtil.upload(file, FileUploadType.SALARY_POLICY_DOC);

        List<PageSegment> pages;
        try {
            pages = extractPages(fileBytes);
        } catch (IOException e) {
            throw new IllegalStateException("PDF 텍스트 추출 실패: " + e.getMessage(), e);
        }

        String fullText = pages.stream().map(p -> p.text).collect(Collectors.joining());
        List<ChunkDraft> drafts = splitIntoChunks(pages);
        if (drafts.isEmpty()) {
            throw new IllegalStateException("문서에서 청크로 나눌 내용을 찾지 못했습니다.");
        }

        // 기존 활성 문서가 있으면 종료 처리(이력 보존, 버저닝)
        int nextVersion = 1;
        Optional<SalPlcyDoc> prevOpt = salPlcyDocRepository.findByComIdAndActvTrue(comId);
        if (prevOpt.isPresent()) {
            SalPlcyDoc prev = prevOpt.get();
            prev.closeAsHistory();
            nextVersion = prev.getDocVersion() + 1;
        }
        salPlcyDocRepository.flush();

        SalPlcyDoc doc = SalPlcyDoc.builder()
                .comId(comId)
                .title((title == null || title.isBlank()) ? uploaded.getOriginalFileName() : title)
                .docVersion(nextVersion)
                .actv(true)
                .srcFileName(uploaded.getOriginalFileName())
                .srcFileUrl(uploaded.getFileUrl())
                .fullText(fullText)
                .build();

        long order = 0;
        for (ChunkDraft d : drafts) {
            double[] vector = embeddingClient.embed(d.text);
            SalPlcyChunk chunk = SalPlcyChunk.builder()
                    .doc(doc)
                    .chunkOrder(order++)
                    .article(d.article)
                    .page(d.page)
                    .chunkText(d.text)
                    .chunkEmbedding(embeddingClient.toJson(vector))
                    .build();
            doc.getChunks().add(chunk);
        }

        SalPlcyDoc saved = salPlcyDocRepository.save(doc);
        return SalPlcyDocResponse.from(saved);
    }

    // 개정 이력 포함 전체 조회(관리자용)
    public List<SalPlcyDocResponse> findAll(Long comId, ActorContext actor) {
        if (!actor.canAccessCompany(comId)) {
            throw new AccessDeniedException("다른 회사의 급여 규정 문서는 조회할 수 없습니다.");
        }
        return salPlcyDocRepository.findAllByComIdOrderByDocVersionDesc(comId).stream()
                .map(SalPlcyDocResponse::from)
                .toList();
    }

    // ===================== PDF -> 페이지별 텍스트 =====================

    private List<PageSegment> extractPages(byte[] pdfBytes) throws IOException {
        List<PageSegment> pages = new ArrayList<>();
        try (PDDocument pdf = Loader.loadPDF(pdfBytes)) {
            int total = pdf.getNumberOfPages();
            for (int p = 1; p <= total; p++) {
                PDFTextStripper stripper = new PDFTextStripper();
                stripper.setStartPage(p);
                stripper.setEndPage(p);
                pages.add(new PageSegment(p, stripper.getText(pdf)));
            }
        }
        return pages;
    }

    // ===================== 조항 단위 Chunking =====================

    private List<ChunkDraft> splitIntoChunks(List<PageSegment> pages) {
        // 페이지별 텍스트를 이어붙이면서, 이어붙인 전체 텍스트에서 각 페이지가 시작하는 offset을 기록해둔다
        // (조항 헤더가 몇 페이지에서 시작했는지 역추적하기 위함)
        StringBuilder fullTextBuilder = new StringBuilder();
        int[] pageStartOffsets = new int[pages.size()];
        for (int i = 0; i < pages.size(); i++) {
            pageStartOffsets[i] = fullTextBuilder.length();
            fullTextBuilder.append(pages.get(i).text);
        }
        String fullText = fullTextBuilder.toString();

        Matcher matcher = ARTICLE_PATTERN.matcher(fullText);
        List<Integer> starts = new ArrayList<>();
        List<String> articles = new ArrayList<>();
        while (matcher.find()) {
            starts.add(matcher.start());
            articles.add(matcher.group());
        }

        List<ChunkDraft> drafts = new ArrayList<>();
        if (starts.isEmpty()) {
            // 조항 형식이 아닌 문서(마크다운 등) - 고정 길이 슬라이딩 윈도우로 대체
            for (int from = 0; from < fullText.length(); from += (FALLBACK_CHUNK_SIZE - FALLBACK_OVERLAP)) {
                int to = Math.min(from + FALLBACK_CHUNK_SIZE, fullText.length());
                String text = fullText.substring(from, to).trim();
                if (!text.isEmpty()) {
                    drafts.add(new ChunkDraft(null, findPage(from, pageStartOffsets), text));
                }
                if (to == fullText.length()) {
                    break;
                }
            }
            return drafts;
        }

        for (int i = 0; i < starts.size(); i++) {
            int start = starts.get(i);
            int end = (i + 1 < starts.size()) ? starts.get(i + 1) : fullText.length();
            String article = articles.get(i);
            int page = findPage(start, pageStartOffsets);
            String articleText = fullText.substring(start, end).trim();

            if (articleText.length() <= MAX_CHUNK_SIZE) {
                drafts.add(new ChunkDraft(article, page, articleText));
            } else {
                // 표가 많거나 긴 조항은 겹치는 구간을 두고 재분할한다(같은 article/page 라벨 유지)
                for (int from = 0; from < articleText.length(); from += (MAX_CHUNK_SIZE - CHUNK_OVERLAP)) {
                    int to = Math.min(from + MAX_CHUNK_SIZE, articleText.length());
                    String sub = articleText.substring(from, to).trim();
                    if (!sub.isEmpty()) {
                        drafts.add(new ChunkDraft(article, page, sub));
                    }
                    if (to == articleText.length()) {
                        break;
                    }
                }
            }
        }
        return drafts;
    }

    /** offset이 속한 페이지 번호(1부터)를 이진 탐색 없이 뒤에서부터 선형 탐색으로 찾는다(페이지 수가 적어 충분). */
    private int findPage(int offset, int[] pageStartOffsets) {
        for (int p = pageStartOffsets.length - 1; p >= 0; p--) {
            if (offset >= pageStartOffsets[p]) {
                return p + 1;
            }
        }
        return 1;
    }

    private record PageSegment(int page, String text) {
    }

    private record ChunkDraft(String article, Integer page, String text) {
    }
}
