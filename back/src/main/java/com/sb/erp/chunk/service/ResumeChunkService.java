package com.sb.erp.chunk.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.chunk.entity.ResumeChunk;
import com.sb.erp.chunk.repository.ResumeChunkRepository;
import com.sb.erp.global.integration.ResumeEmbeddingClient;
import com.sb.erp.rsm.dto.response.ResumeSearchResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResumeChunkService {

    private final ResumeChunkRepository resumeChunkRepository;
    private final ResumeEmbeddingClient embeddingClient;

    /**
     * 검색어와 유사한 이력서 청크를 검색한다.
     *
     * 검색어를 OpenAI Embedding API를 통해 벡터로 변환한 뒤,
     * 저장된 각 이력서 청크의 임베딩 벡터와 코사인 유사도를 계산한다.
     *
     * 유사도가 높은 청크부터 정렬하여 반환한다.
     *
     * @param query 검색어
     * @param comId 회사 ID
     * @param topK 반환할 청크 개수
     * @return 유사도가 높은 이력서 청크 목록
     */
    @Transactional(readOnly = true)
    public List<ResumeSearchResponse> search( Long recId,String query, int topK) {

        if (query == null || query.isBlank()) {
            throw new IllegalArgumentException("검색어를 입력해주세요.");
        }

        if (topK <= 0) {
            throw new IllegalArgumentException("검색 결과 개수는 1개 이상이어야 합니다.");
        }

        // 1. 검색어를 임베딩 벡터로 변환
        double[] queryVector = embeddingClient.embed(query);

        // 2. 해당 회사의 이력서 청크 전체 조회
        List<ResumeChunk> chunks = resumeChunkRepository.findByResume_Applicant_Recruit_RecId(recId);

        // 3. 각 청크와 검색어의 유사도 계산
        List<ChunkScore> scoredChunks = new ArrayList<>();

        for (ResumeChunk chunk : chunks) {

            if (chunk.getChunkEmbedding() == null
                    || chunk.getChunkEmbedding().isBlank()) {
                continue;
            }

            try {
                double[] chunkVector =
                        embeddingClient.fromJson(chunk.getChunkEmbedding());

                double score = cosineSimilarity(queryVector, chunkVector);

                scoredChunks.add(new ChunkScore(chunk, score));

            } catch (Exception e) {
                // 잘못된 임베딩 데이터 하나 때문에 전체 검색이 실패하지 않도록 건너뜀
                continue;
            }
        }

        // 4. 유사도가 높은 순으로 정렬
        scoredChunks.sort(
                Comparator.comparingDouble(ChunkScore::score).reversed()
        );

     // 5. 이력서(rsmId)별로 가장 높은 유사도의 청크 하나만 선택
        List<ChunkScore> bestChunksPerResume = scoredChunks.stream()
                .collect(Collectors.toMap(
                        item -> item.chunk().getResume().getRsmId(),
                        item -> item,
                        (item1, item2) ->
                                item1.score() >= item2.score() ? item1 : item2
                ))
                .values()
                .stream()
                .sorted(Comparator.comparingDouble(ChunkScore::score).reversed())
                .limit(topK)
                .toList();

        // 6. 응답 변환
        return bestChunksPerResume.stream()
                .map(item -> {
                    ResumeChunk chunk = item.chunk();

                    return ResumeSearchResponse.builder()
                            .apctId(chunk.getResume().getApplicant().getApctId())
                            .rsmId(chunk.getResume().getRsmId())
                            .apctName(chunk.getResume().getApplicant().getApctName())
                            .chunkText(chunk.getChunkText())
                            .similarity(item.score())
                            .build();
                })
                .toList();
    }

    /**
     * 두 벡터 사이의 코사인 유사도를 계산한다.
     *
     * 값의 범위는 -1 ~ 1이며,
     * 1에 가까울수록 두 텍스트의 의미가 유사하다.
     */
    private double cosineSimilarity(double[] a, double[] b) {

        if (a.length != b.length) {
            throw new IllegalArgumentException("임베딩 벡터의 차원이 다릅니다.");
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * 검색 결과에 청크와 유사도 점수를 함께 보관하기 위한 내부 record.
     */
    private record ChunkScore(
            ResumeChunk chunk,
            double score
    ) {
    }
}