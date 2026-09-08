package com.sb.erp.emp.chatbot.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.emp.chatbot.dto.request.HrAiChatRequest;
import com.sb.erp.emp.chatbot.dto.response.HrAiChatHistoryResponse;
import com.sb.erp.emp.chatbot.dto.response.HrAiChatResponse;
import com.sb.erp.emp.chatbot.dto.response.HrAiReferenceResponse;
import com.sb.erp.emp.chatbot.entity.HrAiChatLog;
import com.sb.erp.emp.chatbot.entity.HrPlcyChunk;
import com.sb.erp.emp.chatbot.integration.HrAiAnswerClient;
import com.sb.erp.emp.chatbot.integration.HrAiEmbeddingClient;
import com.sb.erp.emp.chatbot.repository.HrAiChatLogRepository;
import com.sb.erp.emp.chatbot.repository.HrPlcyChunkRepository;

import lombok.RequiredArgsConstructor;

/*
HR 규정 AI 챗봇(RAG) 핵심 서비스 — 질문 → 근거 검색 → 답변 생성 → 이력 저장.

SalAiChatService(급여 Q&A)와 동일한 RAG 파이프라인:
1) 질문을 임베딩 벡터로 변환	(HrAiEmbeddingClient)
2) 로그인 사원의 회사(comId)에 속한 활성 HR 규정 문서의 청크를 전부 로드	(HrPlcyChunkRepository)
3) Java에서 코사인 유사도를 계산하여 임계값 이상인 청크만 Top-K로 추림
4) 근거가 없으면 GPT를 호출하지 않고 고정 안내문을 반환	(환각 방지의 핵심)
5) 근거가 있으면 GPT에게 근거 + 질문을 전달하여 답변 생성	(HrAiAnswerClient)
6) 질문/답변/근거 청크ID를 로그에 기록 (HrAiChatLog)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HrAiChatService {

    // ─── RAG 검색 설정 ───────────────────────────────────
    // TOP_K: 유사도 상위 몇 개 청크를 근거로 사용할지
    private static final int TOP_K = 5;

    // SIMILARITY_THRESHOLD: 이 값 미만이면 "관련 근거 없음"으로 간주
    // private static final double SIMILARITY_THRESHOLD = 0.0;
    // 0.15~0.3 까지 값을 써봤는데 임베딩 모델이 한국어에서 유사도 값 자체가 너무 낮게 나오는 문제로 답변 필터링이 안됨
    // 절대 유사도 임계값 대신 상대적인 방법을 사용하는 것으로 변경
    private static final double MIN_RELEVANT_RATIO = 0.5;     // 1위 대비 50% 이상만 포함

    // SNIPPET_LENGTH: 프론트에 내려줄 청크 원문 미리보기 길이
    private static final int SNIPPET_LENGTH = 120;

    // 근거를 못 찾았을 때, 또는 GPT 호출이 실패했을 때 반환하는 고정 안내문
    private static final String NO_EVIDENCE_ANSWER =
            "등록된 HR 규정에서 관련 근거를 찾지 못했어요. 인사팀에 문의해 주세요.";

    private final HrPlcyChunkRepository hrPlcyChunkRepository;
    private final HrAiChatLogRepository hrAiChatLogRepository;
    private final HrAiEmbeddingClient embeddingClient;
    private final HrAiAnswerClient answerClient;


    // ==================== 질문 처리 (RAG 전체 파이프라인) ====================
    /*
     사원의 질문을 받아 RAG 파이프라인을 실행하고 답변을 반환한다.
     @param request 질문 DTO
     @param empId   질문한 사원 PK (JWT에서 추출, 컨트롤러가 전달)
     @param comId   사원 소속 회사 PK (검색 스코프 + 로그 기록용)
     @return 답변 + 근거 목록 + grounded 여부
     */
    @Transactional
    public HrAiChatResponse ask(HrAiChatRequest request, Long empId, Long comId) {

        // ── ① 회사의 활성 HR 규정 청크 전체 로드 ──
        List<HrPlcyChunk> candidates =
                hrPlcyChunkRepository.findByDoc_ComIdAndDoc_ActvTrue(comId);

        // ── ② 질문 임베딩 + 코사인 유사도 계산 + Top-K 필터링 ──
        List<ScoredChunk> top = List.of(); // 빈 리스트로 시작(근거를 찾지 못할 수 있음)
        
        if (!candidates.isEmpty()) {
            double[] questionVector = embeddingClient.embed(request.getQuestion());
            // 사용자의 질문을 벡터로 변환하기
			// 예 : "연차는 언제부터 쓸 수 있나요?" → [0.012, -0.045, 0.033, ...]

			// ★ 디버그: 전체 유사도 출력
//			candidates.forEach(c -> {
//				double sim = cosineSimilarity(questionVector, embeddingClient.fromJson(c.getChunkEmbedding()));
//				System.out.println("[RAG] " + c.getArticle() + " → 유사도: " + String.format("%.4f", sim));
//			});

            top = candidates.stream() // 청크를 하나씩 꺼내어 아래 단계를 통과시킨다
                    .map(c -> new ScoredChunk(c,
                            cosineSimilarity(questionVector,
                                    embeddingClient.fromJson(c.getChunkEmbedding()))))
                    // 청크에 저장된 벡터(JSON 문자열)를 double[]로 변환, 
                    // 질문 벡터와 코사인 유사도를 계산해서 ScoredChunk(청크, 유사도) 쌍으로 만든다.
                    .sorted(Comparator.comparingDouble(ScoredChunk::similarity).reversed())
                    // 유사도가 높은 순으로 정렬
                    .limit(TOP_K) // 상위 TOP_K개만 남김(현재 3)
					.toList(); // 최종 결과를 List<ScoredChunk>로 만듦

			// 1위 유사도 대비 50% 미만인 청크는 노이즈로 간주하여 제거
			if (!top.isEmpty()) {
				double best = top.get(0).similarity();
				// best가 음수일 경우 best*0.5가 best보다 커져서 1위 청크까지 필터에서 탈락함
				double cutoff = (best > 0) ? best * MIN_RELEVANT_RATIO : best;
				top = top.stream().filter(sc -> sc.similarity() >= cutoff).toList();
			}
        }

        // ── ③ 근거 유무에 따라 분기 ──
        boolean grounded = !top.isEmpty();
        String answer;
        List<HrAiReferenceResponse> references;

        if (!grounded) {
            // 근거 조항이 하나도 없으면 API를 호출하지 않는다 → 환각 방지 + 불필요한 API 비용 절감
            answer = NO_EVIDENCE_ANSWER;
            references = List.of();

        } else {
            // ── ④ 근거 조항 텍스트를 조립하여 GPT에 전달 ──
            // "제6조(연차): 입사일 기준 1개월..." 형태로 이어붙임
            String contextText = top.stream()
                    .map(sc -> (sc.chunk().getArticle() != null
                            ? sc.chunk().getArticle() : "(조항 미상)")
                            + ": " + sc.chunk().getChunkText())
                    .collect(Collectors.joining("\n\n"));

            String gptAnswer = answerClient.answer(request.getQuestion(), contextText);

            if (gptAnswer == null || isRefusalAnswer(gptAnswer)) {
                // GPT 호출 실패이거나, GPT가 "근거 부족"으로 답변을 거절한 경우
                // → 환각 방지를 위해 grounded를 false로 보정하고 근거 조항도 비운다
				answer = NO_EVIDENCE_ANSWER;
				grounded = false;
				references = List.of();
			} else {
				answer = gptAnswer;

				// ── ⑤ 근거 조항 응답 목록 조립 ──
				references = top.stream()
						.map(sc -> HrAiReferenceResponse.builder().chunkId(sc.chunk().getChunkId())
								.article(sc.chunk().getArticle()).page(sc.chunk().getPage())
								.snippet(snippet(sc.chunk().getChunkText()))
								.similarity(Math.round(sc.similarity() * 1000) / 1000.0)
								// 유사도를 소수점 셋째자리까지 반올림
								.build())
						.toList();
			}
		}

        // ── ⑥ 대화 이력 저장 (insert-only) ──
        String refChunkIds = references.stream()
                .map(r -> String.valueOf(r.getChunkId()))
                .collect(Collectors.joining(","));

        HrAiChatLog log = HrAiChatLog.builder()
                .empId(empId)
                .comId(comId)
                .question(request.getQuestion())
                .answer(answer)
                .refChunkIds(refChunkIds.isBlank() ? null : refChunkIds)
                .grounded(grounded)
                .build();
        HrAiChatLog savedLog = hrAiChatLogRepository.save(log);

        // ── ⑦ 최종 응답 조립 ──
        return HrAiChatResponse.builder()
                .logId(savedLog.getLogId())
                .answer(answer)
                .grounded(grounded)
                .references(references)
                .build();
    }


    // ==================== 대화 이력 조회 ====================
    // 사용자의 대화 이력을 최신순으로 조회. 프론트에서 "이전 대화 더 보기" 용도.

    public Page<HrAiChatHistoryResponse> myHistory(Long empId, Pageable pageable) {
        return hrAiChatLogRepository
                .findByEmpIdOrderByCreatedAtDesc(empId, pageable)
                .map(HrAiChatHistoryResponse::from);
    }

    // ==================== 유틸리티 메서드 ====================
    // 청크 원문의 앞부분만 잘라서 미리보기 / chunkText 전체를 내려보내면 응답이 불필요하게 커지므로 120자로 제한.
    private String snippet(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        return trimmed.length() <= SNIPPET_LENGTH
                ? trimmed
                : trimmed.substring(0, SNIPPET_LENGTH) + "...";
    }

	// GPT가 근거 부족으로 답변을 거절했는지 판별
	// 시스템 프롬프트에서 거절 시 "제공된 규정에서 근거를 찾을 수 없습니다"를 쓰도록 지시했으므로 이 문구가 포함되어 있으면 거절로 간주
	private boolean isRefusalAnswer(String answer) {
		if (answer == null || answer.isBlank()) return true;
		return answer.contains("근거를 찾을 수 없습니다");
	}

    // 두 벡터 간 코사인 유사도를 계산(0~1, 1에 가까울수록 유사). VectorDB 없이 Java에서 직접 계산하는 방식.
    private double cosineSimilarity(double[] a, double[] b) {
        if (a == null || b == null || a.length != b.length || a.length == 0) {
            return 0.0;
        }
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot   += a[i] * b[i];     // 내적: 같은 위치 원소끼리 곱한 합
            normA += a[i] * a[i];     // A 벡터 크기의 제곱
            normB += b[i] * b[i];     // B 벡터 크기의 제곱
        }
        if (normA == 0 || normB == 0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

	// 청크 + 유사도 점수를 묶어서 정렬/필터링에 사용하는 내부 VO.
	private record ScoredChunk(HrPlcyChunk chunk, double similarity) {
	}

	
}