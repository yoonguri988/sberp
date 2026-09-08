package com.sb.erp.chunk.entity;

import com.sb.erp.sal.entity.SalPlcyDoc;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 급여 규정 문서 청크 + 임베딩 — 테이블 sal_plcy_chunk
 *
 * ResumeChunk(이력서 청크)와 동일한 설계 원칙을 따른다: 벡터는 VectorDB가 아니라 이 테이블에 JSON 문자열로
 * 저장하고, 검색(유사도 계산)은 Java(SalAiChatService)에서 코사인 유사도로 직접 계산한다.
 *
 * ResumeChunk와 다른 점: 급여 Q&A 답변은 "근거 조항(조항/페이지)"을 함께 보여줘야 하므로 article/page를
 * 추가로 저장한다 — 원문 자체가 사내 사규 조항이라 이력서 내용과 달리 사용자에게 그대로 노출해도 되는
 * 정보이기 때문에(SalAiReferenceResponse로 snippet까지 내려준다), ResumeChunk의 "DTO 없음(비노출)" 원칙은
 * 이 엔티티에는 적용하지 않는다.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "sal_plcy_chunk")
public class SalPlcyChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salPlcyChunkSeq")
    @SequenceGenerator(name = "salPlcyChunkSeq", sequenceName = "sal_plcy_chunk_seq", allocationSize = 1)
    @Column(name = "chunk_id", nullable = false)
    private Long chunkId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_id", nullable = false)
    private SalPlcyDoc doc;

    @Column(name = "chunk_order", nullable = false)
    private Long chunkOrder;

    // 예: "제6조(식대)". 조항 형식으로 안 쪼개진 경우(마크다운 등) null일 수 있다.
    @Column(name = "article", length = 50)
    private String article;

    // 원본 PDF 기준 페이지 번호(1부터). 페이지 정보를 알 수 없는 소스는 null.
    @Column(name = "page")
    private Integer page;

    @Lob
    @Column(name = "chunk_text", nullable = false)
    private String chunkText;

    @Lob
    @Column(name = "chunk_embedding", nullable = false)
    private String chunkEmbedding; // JSON 배열 문자열(예: "[0.0123,-0.0456,...]")
}
