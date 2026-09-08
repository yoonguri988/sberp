package com.sb.erp.emp.chatbot.entity;

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

/*
HR 규정 문서 청크 + 임베딩 — 테이블 hr_plcy_chunk

하나의 HrPlcyDoc에서 여러 개의 내용이 생김 (1:N 관계).
예를 들어 문서 내용이 "제3조(근무시간)", "제4조(연차)" 같은 조항 단위로 쪼개지면,
각 부분마다 OpenAI 임베딩 API를 호출해서 벡터값을 chunkEmbedding(JSON 문자열)에 저장한다.
사원이 질문하면 이 벡터들과 질문 벡터의 코사인 유사도를 비교해서 가장 관련 있는 조각을 찾아낸다.
article("제6조(연차)")과 page(원본 몇 페이지)는 답변할 때 "근거 조항"으로 사원에게 보여주는 데 쓰인다.

*/

@Entity
@Table(name = "hr_plcy_chunk")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrPlcyChunk { // 문서를 쪼개서 근거 조항으로 만든다

	// PK
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hrPlcyChunkSeq")
    @SequenceGenerator(
        name = "hrPlcyChunkSeq",
        sequenceName = "hr_plcy_chunk_seq",
        allocationSize = 1   // Oracle 시퀀스 INCREMENT BY 1과 반드시 일치
    )
    @Column(name = "chunk_id", nullable = false)
    private Long chunkId;

    // hr_plcy_doc FK
    // 부모 문서 연관 — LAZY 로드 (청크 목록 조회 시 문서 전체를 즉시 로드하지 않음)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doc_id", nullable = false)
    private HrPlcyDoc doc;

    // 문서 내 청크 순번 (0부터, PDFBox 추출 순서)
    @Column(name = "chunk_order", nullable = false)
    private Long chunkOrder;

    // 조항 헤더 (예: "제6조(연차)"). 조항 형식이 아닌 문서(마크다운 등)에서는 null
    @Column(name = "article", length = 50)
    private String article;

    // 원본 PDF 기준 페이지 번호(1부터). 페이지 정보를 알 수 없는 소스는 null
    @Column(name = "page")
    private Integer page;

    // 청크 원문 텍스트
    @Lob
    @Column(name = "chunk_text", nullable = false)
    private String chunkText;

    // 임베딩 벡터를 JSON 배열 문자열로 저장 (예: "[0.0123,-0.0456,...]")
    @Lob
    @Column(name = "chunk_embedding", nullable = false)
    private String chunkEmbedding;
}

