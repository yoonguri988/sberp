package com.sb.erp.sal.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.chunk.entity.SalPlcyChunk;
import com.sb.erp.chunk.repository.SalPlcyChunkRepository;
import com.sb.erp.global.integration.SalAiAnswerClient;
import com.sb.erp.global.integration.SalAiEmbeddingClient;
import com.sb.erp.sal.dto.request.SalAiChatRequest;
import com.sb.erp.sal.dto.response.SalAiChatHistoryResponse;
import com.sb.erp.sal.dto.response.SalAiChatResponse;
import com.sb.erp.sal.dto.response.SalAiReferenceResponse;
import com.sb.erp.sal.entity.SalAiChatLog;
import com.sb.erp.sal.repository.SalAiChatLogRepository;

import lombok.RequiredArgsConstructor;

/**
 * AI 급여 Q&A(RAG) 질의응답. "이번 달 수당 왜 줄었죠?" 같은 반복 질문에 사내 급여 규정 조항을 근거로 답한다.
 *
 * 흐름(Retrieval -> Generation):
 *  1) 질문을 임베딩
 *  2) 로그인 사용자의 회사(comId)에 속한 "현재 유효" 정책 문서의 청크 전체를 불러와(SalPlcyChunkRepository),
 *     Java에서 코사인 유사도를 계산(ResumeChunk와 동일하게 VectorDB 없이 애플리케이션 레이어에서 처리)
 *  3) 유사도 임계값을 넘는 청크가 하나도 없으면 GPT를 호출하지 않고 고정 안내문을 반환한다
 *     (환각 방지 + 불필요한 API 비용 절감의 핵심 지점)
 *  4) 임계값을 넘는 상위 K개 청크를 근거 조항으로 GPT(gpt-4o-mini)에 답변을 생성시킨다
 *  5) 질문/답변/근거 청크ID를 SalAiChatLog에 기록한다
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalAiChatService {

    private static final int TOP_K = 3;
    private static final double SIMILARITY_THRESHOLD = 0.3; // 이 미만이면 "관련 근거 없음"으로 간주
    private static final int SNIPPET_LENGTH = 120;
    private static final String NO_EVIDENCE_ANSWER =
            "등록된 급여 규정에서 관련 근거를 찾지 못했어요. 인사팀에 문의해 주세요.";

    private final SalPlcyChunkRepository salPlcyChunkRepository;
    private final SalAiChatLogRepository salAiChatLogRepository;
    private final SalAiEmbeddingClient embeddingClient;
    private final SalAiAnswerClient answerClient;

    @Transactional
    public SalAiChatResponse ask(SalAiChatRequest request, Long empId, Long comId) {
        List<SalPlcyChunk> candidates = salPlcyChunkRepository.findByDoc_ComIdAndDoc_ActvTrue(comId);

        List<ScoredChunk> top = List.of();
        if (!candidates.isEmpty()) {
            double[] questionVector = embeddingClient.embed(request.getQuestion());
            top = candidates.stream()
                    .map(c -> new ScoredChunk(c,
                            cosineSimilarity(questionVector, embeddingClient.fromJson(c.getChunkEmbedding()))))
                    .filter(sc -> sc.similarity() >= SIMILARITY_THRESHOLD)
                    .sorted(Comparator.comparingDouble(ScoredChunk::similarity).reversed())
                    .limit(TOP_K)
                    .toList();
        }

        boolean grounded = !top.isEmpty();
        String answer;
        List<SalAiReferenceResponse> references;

        if (!grounded) {
            // 근거 조항이 없으면 GPT를 아예 호출하지 않는다 - 이게 환각 방지의 핵심.
            answer = NO_EVIDENCE_ANSWER;
            references = List.of();
        } else {
            String contextText = top.stream()
                    .map(sc -> (sc.chunk().getArticle() != null ? sc.chunk().getArticle() : "(조항 미상)")
                            + ": " + sc.chunk().getChunkText())
                    .collect(Collectors.joining("\n\n"));

            String gptAnswer = answerClient.answer(request.getQuestion(), contextText);
            // OpenAI 호출 실패(네트워크/쿼터 등)해도 전체 흐름은 막지 않고 안전한 문구로 대체한다.
            answer = (gptAnswer != null) ? gptAnswer : NO_EVIDENCE_ANSWER;

            references = top.stream()
                    .map(sc -> SalAiReferenceResponse.builder()
                            .chunkId(sc.chunk().getChunkId())
                            .article(sc.chunk().getArticle())
                            .page(sc.chunk().getPage())
                            .snippet(snippet(sc.chunk().getChunkText()))
                            .similarity(Math.round(sc.similarity() * 1000) / 1000.0)
                            .build())
                    .toList();
        }

        String refChunkIds = references.stream()
                .map(r -> String.valueOf(r.getChunkId()))
                .collect(Collectors.joining(","));

        SalAiChatLog log = SalAiChatLog.builder()
                .empId(empId)
                .comId(comId)
                .question(request.getQuestion())
                .answer(answer)
                .refChunkIds(refChunkIds.isBlank() ? null : refChunkIds)
                .grounded(grounded)
                .build();
        SalAiChatLog savedLog = salAiChatLogRepository.save(log);

        return SalAiChatResponse.builder()
                .logId(savedLog.getLogId())
                .answer(answer)
                .grounded(grounded)
                .references(references)
                .build();
    }

    // 본인 대화 이력(최신순, 페이지네이션)
    public Page<SalAiChatHistoryResponse> myHistory(Long empId, Pageable pageable) {
        return salAiChatLogRepository.findByEmpIdOrderByCreatedAtDesc(empId, pageable)
                .map(SalAiChatHistoryResponse::from);
    }

    private String snippet(String text) {
        if (text == null) {
            return null;
        }
        String trimmed = text.trim();
        return trimmed.length() <= SNIPPET_LENGTH ? trimmed : trimmed.substring(0, SNIPPET_LENGTH) + "...";
    }

    private double cosineSimilarity(double[] a, double[] b) {
        if (a == null || b == null || a.length != b.length || a.length == 0) {
            return 0.0;
        }
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA == 0 || normB == 0) {
            return 0.0;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private record ScoredChunk(SalPlcyChunk chunk, double similarity) {
    }
}
