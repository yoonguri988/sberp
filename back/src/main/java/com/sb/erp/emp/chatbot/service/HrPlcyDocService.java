package com.sb.erp.emp.chatbot.service;

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

import com.sb.erp.emp.chatbot.dto.response.HrPlcyDocResponse;
import com.sb.erp.emp.chatbot.entity.HrPlcyChunk;
import com.sb.erp.emp.chatbot.entity.HrPlcyDoc;
import com.sb.erp.emp.chatbot.integration.HrAiEmbeddingClient;
import com.sb.erp.emp.chatbot.repository.HrPlcyDocRepository;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.util.dto.FileUploadDto;
import com.sb.erp.util.dto.FileUploadType;
import com.sb.erp.util.dto.FileUploadUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/*
	회사별 HR 규정 문서(hr_plcy_doc) 관리 — RAG "Ingestion" 단계.
	업로드 흐름:
	PDF 업로드 → PDFBox로 페이지별 텍스트 추출
	→ 조항(제n조) 단위 Chunking (긴 조항은 슬라이딩 윈도우 재분할)
	→ 청크마다 OpenAI 임베딩 호출 → HrPlcyChunk로 저장

	MultipartFile.getBytes()를 먼저 읽어두고 FileUploadUtil.upload()를 호출
	(transferTo()가 임시파일을 "이동"하면 이후 다시 읽을 수 없는 문제 방지)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class HrPlcyDocService {

    // ─── 조항 분할(Chunking) 설정 ─────────────────────────
    // 조항 헤더 패턴: "제6조(연차)"처럼 숫자+조+괄호 제목
    // 괄호 안 제목 길이를 30자로 제한해 과매칭 방지
    private static final Pattern ARTICLE_PATTERN =
            Pattern.compile("제\\d+조\\([^)]{1,30}\\)");

    // 조항 형식이 아닌 문서(마크다운 등) fallback용 고정 길이 분할
    private static final int FALLBACK_CHUNK_SIZE = 700;
    private static final int FALLBACK_OVERLAP    = 100;
    /* 
    	한 청크의 최대 글자 수 FALLBACK_CHUNK_SIZE
		이전 청크와 겹치는 글자 수 FALLBACK_OVERLAP
		
		겹치는 부분이 필요한 이유
		청크1 끝: "...연차는 입사일 기준 1개월 근속 시"
		청크2 시작: "1일이 발생하며 최대 25일까지..."
		
		→ 겹침이 없으면 "1개월 근속 시 1일이 발생"이라는 문장이 두 청크에 찢어져서
		  어느 쪽도 완전한 의미를 갖지 못함
		→ 겹침이 있으면 청크2가 "...1개월 근속 시 1일이 발생하며..."를 포함하므로
		  이 문장에 대한 질문이 들어왔을 때 청크2가 정확히 매칭됨
	*/
    
    // 조항 하나가 너무 길면(표가 많은 조항 등) 슬라이딩 윈도우로 재분할
    private static final int MAX_CHUNK_SIZE = 800; // 조항 하나의 허용 최대 길이
    private static final int CHUNK_OVERLAP  = 100; // 재분할 시 겹치는 구간

    private final HrPlcyDocRepository hrPlcyDocRepository;
    private final HrAiEmbeddingClient embeddingClient;   // jsj 키 사용


    // ==================== 문서 등록 (PDF 업로드) ====================
    /*
     PDF 업로드 → 텍스트 추출 → 조항 단위 Chunking → 임베딩 → DB 저장.
     @param file        관리자가 업로드한 HR 규정 PDF
     @param title       문서 제목 (null이면 원본 파일명 사용)
     @param targetComId 대상 회사 ID (null이면 로그인 사원의 소속 회사)
     @param actor       JWT에서 추출한 로그인 정보
     @return 저장된 문서의 메타 응답
     */
    @Transactional
    public HrPlcyDocResponse register(MultipartFile file, 
    									String title,
    									Long targetComId,
    									ActorContext actor) {

        Long comId = (targetComId != null) ? targetComId : actor.comId();
        if (!actor.canAccessCompany(comId)) {
            throw new AccessDeniedException("다른 회사의 HR 규정 문서는 등록할 수 없습니다.");
        }

        // ── ① 파일 바이트를 먼저 읽어둔다 ──
        /* 
         FileUploadUtil.upload()가 내부적으로 transferTo()를 호출하면 
         임시파일이 이동되어 getBytes()가 실패할 수 있다. PDF 추출용 바이트를 먼저 확보
        */
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes(); 
            // MultipartFile을 두 번 쓸 때는 순서가 중요. 
            // 바이트를 먼저 읽어두고, 파일 저장은 그 다음에 하는 게 안전한 패턴
        } catch (IOException e) {
            throw new IllegalStateException(
                    "업로드된 파일을 읽는 중 오류가 발생했습니다: " + e.getMessage(), e);
        }

        // ── ② 파일 저장 (FileUploadType.HR_POLICY_DOC 사용) ──
        // util.dto.FileUploadType에 해당 타입 추가, [파일 저장 + URL 생성]
        FileUploadDto uploaded = FileUploadUtil.upload(file, FileUploadType.HR_POLICY_DOC);

        // ── ③ PDFBox로 페이지별 텍스트 추출 ──
        List<PageSegment> pages;
        try {
            pages = extractPages(fileBytes);
        } catch (IOException e) {
            throw new IllegalStateException(
                    "PDF 텍스트 추출 실패: " + e.getMessage(), e);
        }
        
		// PDFBox 추출 텍스트 정리 — 탭·다중 공백·불필요한 줄바꿈 제거
		pages = pages.stream()
				.map(p -> new PageSegment(p.page, cleanText(p.text)))
				.toList();

        String fullText = pages.stream()
                .map(p -> p.text)
                .collect(Collectors.joining());

        // ── ④ 조항 단위 Chunking ──
        List<ChunkDraft> drafts = splitIntoChunks(pages); // 조항 패턴("제n조(...)") 단위로 분할
        if (drafts.isEmpty()) {
            throw new IllegalStateException("문서에서 청크로 나눌 내용을 찾지 못했습니다.");
        }

        // ── ⑤ 기존 활성 문서가 있으면 종료 처리 (버저닝) ──
        int nextVersion = 1;
        Optional<HrPlcyDoc> prevOpt = hrPlcyDocRepository.findByComIdAndActvTrue(comId);
        
        if (prevOpt.isPresent()) {
            HrPlcyDoc prev = prevOpt.get();
            prev.closeAsHistory();	// actv=0으로 전환
            nextVersion = prev.getDocVersion() + 1;
        }
        
        hrPlcyDocRepository.flush();
        // flush(): JPA에서 메모리에 쌓아둔 변경 사항을 즉시 DB에 SQL로 보내는 명령
        // flush()를 호출하면 커밋 전이라도 그 시점까지의 변경을 DB에 반영함. sql 실행 순서를 보장하기 위한 용도
        // 유니크 인덱스 충돌 방지를 위해 기존 행 UPDATE 먼저 반영

        // ── ⑥ 새 문서 엔티티 생성 ──
        HrPlcyDoc doc = HrPlcyDoc.builder()
                .comId(comId)
                .title((title == null || title.isBlank())
                        ? uploaded.getOriginalFileName() : title)
                .docVersion(nextVersion)
                .actv(true)
                .srcFileName(uploaded.getOriginalFileName())
                .srcFileUrl(uploaded.getFileUrl())
                .fullText(fullText)
                .build();

        // ── ⑦ 청크마다 임베딩 벡터 생성 + 자식 엔티티 추가 ──
        long order = 0;
        for (ChunkDraft d : drafts) {
            // OpenAI embedding API 호출 (청크 수만큼 반복, 문서 등록 시 1회성)
            double[] vector = embeddingClient.embed(d.text);

            HrPlcyChunk chunk = HrPlcyChunk.builder()
                    .doc(doc)
                    .chunkOrder(order++)
                    .article(d.article)
                    .page(d.page)
                    .chunkText(d.text)
                    .chunkEmbedding(embeddingClient.toJson(vector))
                    .build();
            doc.getChunks().add(chunk);
        }

        // ── ⑧ CascadeType.ALL로 문서 + 청크 한번에 저장 ──
        // save(doc) 한 줄로 문서 + 청크 전체를 한 트랜잭션에서 한번에 저장할 수 있게 해주는 설정
        HrPlcyDoc saved = hrPlcyDocRepository.save(doc);
        return HrPlcyDocResponse.from(saved);
    }


    // ==================== 문서 목록 조회 (관리자용) ====================
    // 개정 이력 포함 전체 조회 (최신 버전이 먼저)
    
    public List<HrPlcyDocResponse> findAll(Long comId, ActorContext actor) {
        if (!actor.canAccessCompany(comId)) {
            throw new AccessDeniedException("다른 회사의 HR 규정 문서는 조회할 수 없습니다.");
        }
        return hrPlcyDocRepository
                .findAllByComIdOrderByDocVersionDesc(comId).stream()
                .map(HrPlcyDocResponse::from)
                .toList();
    }

    // ==================== PDF → 페이지별 텍스트 추출 ====================
    // PDFBox로 PDF 바이트를 페이지 단위로 분리해서 텍스트를 추출
    // 반환되는 PageSegment.page는 1부터 시작 (PDF 페이지 번호와 일치)
    
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


    // ==================== 조항 단위 Chunking ====================
    /*
     페이지별 텍스트를 이어붙인 후, "제n조(...)" 패턴으로 분할한다.
     분할 방식:
     	1) 조항 헤더가 있으면 → 조항 단위로 분할 (article 라벨 부여)
     	2) 조항 헤더가 없으면 → 고정 길이 슬라이딩 윈도우(fallback)
     	3) 분할된 조항이 MAX_CHUNK_SIZE를 초과하면 → 겹침 구간을 두고 재분할

     겹침(overlap)을 두는 이유: 조항 경계에서 맥락이 끊기지 않도록
     	앞 청크의 끝부분을 다음 청크 시작에 중복 포함시켜 검색 품질을 높인다.
     */
    private List<ChunkDraft> splitIntoChunks(List<PageSegment> pages) {

        // 페이지별 텍스트를 이어붙이면서, 전체 텍스트 내 각 페이지의 시작 offset을 기록
        // (조항 헤더가 몇 페이지에서 시작했는지 역추적용)
        StringBuilder fullTextBuilder = new StringBuilder();
        int[] pageStartOffsets = new int[pages.size()];
        for (int i = 0; i < pages.size(); i++) {
            pageStartOffsets[i] = fullTextBuilder.length();
            fullTextBuilder.append(pages.get(i).text);
        }
        String fullText = fullTextBuilder.toString();

        // 정규식으로 조항 헤더 위치를 모두 찾는다
        Matcher matcher = ARTICLE_PATTERN.matcher(fullText);
        List<Integer> starts   = new ArrayList<>();
        List<String>  articles = new ArrayList<>();
        while (matcher.find()) {
            starts.add(matcher.start());
            articles.add(matcher.group());
        }

        List<ChunkDraft> drafts = new ArrayList<>();

        // ── CASE 1: 조항 헤더가 없는 문서 → 고정 길이 슬라이딩 윈도우 ──
        if (starts.isEmpty()) {
            for (int from = 0; from < fullText.length();
                 from += (FALLBACK_CHUNK_SIZE - FALLBACK_OVERLAP)) {
                int to = Math.min(from + FALLBACK_CHUNK_SIZE, fullText.length());
                String text = fullText.substring(from, to).trim();
                if (!text.isEmpty()) {
                    drafts.add(new ChunkDraft(null,
                            findPage(from, pageStartOffsets), text));
                }
                if (to == fullText.length()) break;
            }
            return drafts;
        }

        // ── CASE 2: 조항 단위 분할 ──
        for (int i = 0; i < starts.size(); i++) {
            int start = starts.get(i);
            int end   = (i + 1 < starts.size()) ? starts.get(i + 1) : fullText.length();
            String article     = articles.get(i);
            int    page        = findPage(start, pageStartOffsets);
            String articleText = fullText.substring(start, end).trim();

            if (articleText.length() <= MAX_CHUNK_SIZE) {
                // 적정 크기 → 그대로 1개 청크
                drafts.add(new ChunkDraft(article, page, articleText));
            } else {
                // 너무 긴 조항 → 겹침 구간 두고 재분할 (같은 article/page 라벨 유지)
                for (int from = 0; from < articleText.length();
                     from += (MAX_CHUNK_SIZE - CHUNK_OVERLAP)) {
                    int to = Math.min(from + MAX_CHUNK_SIZE, articleText.length());
                    String sub = articleText.substring(from, to).trim();
                    if (!sub.isEmpty()) {
                        drafts.add(new ChunkDraft(article, page, sub));
                    }
                    if (to == articleText.length()) break;
                }
            }
        }
        return drafts;
    }

    // 전체 텍스트 내 offset이 속한 페이지 번호(1부터)를 찾는다. 페이지 수가 적어 선형 탐색으로 충분.
    private int findPage(int offset, int[] pageStartOffsets) {
        for (int p = pageStartOffsets.length - 1; p >= 0; p--) {
            if (offset >= pageStartOffsets[p]) {
                return p + 1;   // 페이지 번호는 1부터
            }
        }
        return 1;
    }

    // PDF 페이지 하나의 텍스트를 담는 내부 VO.
    private record PageSegment(int page, String text) {}

    // Chunking 결과를 임시로 담는 내부 VO. 임베딩 전 단계
    private record ChunkDraft(String article, Integer page, String text) {}
    
	// PDFBox 추출 텍스트의 노이즈를 제거
	private String cleanText(String raw) {
		if (raw == null) return "";
		
		log.info("[cleanText] 호출됨, 탭 포함 여부: " + raw.contains("\t"));
		
		return raw.replace('\t', ' ') // 탭 → 공백
				.replaceAll(" {2,}", " ") // 다중 공백 → 단일 공백
				.replaceAll("\\r\\n|\\r", "\n") // 줄바꿈 통일
				.replaceAll("(?<=\\S)\\n(?=\\S)", " ") // 단어 중간 줄바꿈 → 공백
				.trim();
	}
}