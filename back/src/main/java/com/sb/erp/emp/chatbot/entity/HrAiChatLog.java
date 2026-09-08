package com.sb.erp.emp.chatbot.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 HR AI 챗봇 대화 이력 — 테이블 hr_ai_chat_log

사원이 질문할 때마다 1행이 쌓이는 insert-only 로그
question, answer, 답변에 사용된 refChunkIds("12,15,16" 같은 콤마 구분), 
그리고 grounded(근거를 찾았는지 여부)를 기록한다. 
grounded=false면 유사도 임계값을 넘는 청크가 없어서
GPT를 아예 호출하지 않고 고정 안내문을 반환한 케이스다.
나중에 "어떤 질문이 자주 반복되는지", "근거를 못 찾은 질문이 뭔지" 분석하는 데 활용할 수 있다.
*/

@Entity
@Table(name = "hr_ai_chat_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrAiChatLog { // 누가 무엇을 물어봤고, 뭐라고 답했는지에 대한 이력

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hrAiChatLogSeq")
    @SequenceGenerator(
        name = "hrAiChatLogSeq",
        sequenceName = "hr_ai_chat_log_seq",
        allocationSize = 1   // Oracle 시퀀스 INCREMENT BY 1과 반드시 일치
    )
    @Column(name = "log_id")
    private Long logId;

    // 질문한 사원이 누군지
    @Column(name = "emp_id", nullable = false)
    private Long empId;

    // 사원이 소속 회사 (검색 스코프 기록용, 나중에 회사별 질문 통계에도 활용)
    @Column(name = "com_id", nullable = false)
    private Long comId;

    // 질문
    @Lob
    @Column(name = "question", nullable = false)
    private String question;

    // 답변
    @Lob
    @Column(name = "answer", nullable = false)
    private String answer;

    // 답변에 사용된 HrPlcyChunk.chunkId 목록을 콤마로 이어붙인 문자열 (예: "12,15,16")
    // 조회 전용, FK 아님 — 근거 추적을 위한 참조
    @Column(name = "ref_chunk_ids", length = 500)
    private String refChunkIds;

    // false, 근거 조항을 찾지 못해 GPT를 호출하지 않고 고정 안내문을 반환한 경우
    @Column(name = "grounded", nullable = false)
    private boolean grounded;

    // 생성 시각
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
