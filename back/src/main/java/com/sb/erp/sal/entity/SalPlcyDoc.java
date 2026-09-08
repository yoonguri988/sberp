package com.sb.erp.sal.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.chunk.entity.SalPlcyChunk;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 회사별 급여 규정집·수당 기준·연말정산 가이드 문서 — 테이블 sal_plcy_doc
 *
 * "AI 급여 Q&A(RAG)" 기능의 근거 문서(source of truth)다. 회사(comId)마다 급여 규정이 다를 수 있으므로
 * comId를 필수 스코프 컬럼으로 둔다. SalPosAlw/SalMealAlwPlcy와 동일하게 Company를 JPA 연관관계(@ManyToOne)로
 * 잡지 않고 comId 값 컬럼만 둔다 — Company는 MyBatis 전담(JPA Repository 없음)이라 salary 모듈은 지금까지
 * comId를 값으로만 참조해 왔다(README 설계 원칙 재사용).
 *
 * 문서를 새로 업로드(개정)하면 in-place update가 아니라 SalStd/SalPosAlw와 동일한 버저닝 방식을 쓴다:
 * 기존 활성(actv=1) 문서를 종료 처리(actv=0)하고 새 문서를 새 행으로 추가한다. 회사당 actv=1 문서는
 * 항상 1건 이하다(DDL의 ux_sal_plcy_doc_actv 유니크 인덱스로 DB 레벨에서도 보장).
 */
@Entity
@Table(name = "sal_plcy_doc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalPlcyDoc {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "salPlcyDocSeq")
    @SequenceGenerator(name = "salPlcyDocSeq", sequenceName = "sal_plcy_doc_seq", allocationSize = 1)
    @Column(name = "doc_id")
    private Long docId;

    @Column(name = "com_id", nullable = false)
    private Long comId; // 회사마다 규정이 다르므로 필수 스코프 (요구사항: 회사마다 급여규정집/수당기준/연말정산 가이드 다름)

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "doc_version", nullable = false)
    private Integer docVersion; // 개정 차수(1부터 증가). "version"은 Oracle 예약어라 doc_version 사용

    @Column(name = "actv", nullable = false)
    private boolean actv; // 현재 유효(=RAG 검색 대상) 문서 여부

    @Column(name = "src_file_name", length = 200)
    private String srcFileName;

    @Column(name = "src_file_url", length = 500)
    private String srcFileUrl;

    @Lob
    @Column(name = "full_text")
    private String fullText; // PDFBox로 추출한 원문 전체(재색인/디버깅용, API 응답으로는 노출하지 않음)

    @Column(name = "created_at", nullable = false, insertable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, insertable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "doc", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalPlcyChunk> chunks = new ArrayList<>();

    /** 새 버전 문서로 대체될 때 현재 행을 이력(종료 상태)으로 전환한다. */
    public void closeAsHistory() {
        this.actv = false;
    }
}
