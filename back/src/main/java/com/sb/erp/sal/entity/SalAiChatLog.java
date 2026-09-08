package com.sb.erp.sal.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AI 급여 Q&A 대화 이력 — 테이블 sal_ai_chat_log
 *
 * 질문/답변/참조 청크ID/grounded 여부를 남긴다. SalHist(급여 변경 이력)와 마찬가지로 사람이 직접
 * 등록/수정/삭제하지 않는 insert-only 로그다. 매달 반복되는 질문 통계, 오답 개선(피드백) 근거로 활용 예정.
 */
@Entity
@Table(name = "sal_ai_chat_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAiChatLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salAiChatLogSeq")
    @SequenceGenerator(name = "salAiChatLogSeq", sequenceName = "sal_ai_chat_log_seq", allocationSize = 1)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "emp_id", nullable = false)
    private Long empId;

    @Column(name = "com_id", nullable = false)
    private Long comId;

    @Lob
    @Column(name = "question", nullable = false)
    private String question;

    @Lob
    @Column(name = "answer", nullable = false)
    private String answer;

    // 답변에 사용된 SalPlcyChunk.chunkId 목록을 콤마로 이어붙인 문자열(예: "12,15,16"). 조회 전용, FK 아님.
    @Column(name = "ref_chunk_ids", length = 500)
    private String refChunkIds;

    // false면 유사도 임계값을 넘는 근거 조항을 찾지 못해 GPT를 호출하지 않고 고정 안내문을 반환한 경우다.
    @Column(name = "grounded", nullable = false)
    private boolean grounded;

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;
}
