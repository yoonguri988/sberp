package com.sb.erp.emp.chatbot.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
회사별 HR 규정 문서 — 테이블 hr_plcy_doc

관리자가 PDF를 올리면 1행이 생김.
예를 들어 "2026년 사내 가이드.pdf"를 올리면 title, srcFileName, docVersion 같은 메타 정보 저장,
PDFBox로 추출한 원문 전체가 fullText에 들어감.
나중에 규정이 개정되면 기존 행은 actv=0으로 종료하고(비활성화)
새 행을 docVersion+1로 추가하는(활성화) 버저닝 방식. 
회사당 활성 문서는 항상 1건 이하로 유지한다.
*/

@Entity
@Table(name = "hr_plcy_doc")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrPlcyDoc { // "어떤 문서를 올렸는지" 확인

	// PK
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hrPlcyDocSeq")
    @SequenceGenerator(
        name = "hrPlcyDocSeq",
        sequenceName = "hr_plcy_doc_seq",
        allocationSize = 1   // Oracle 시퀀스 INCREMENT BY 1과 반드시 일치
    )
    @Column(name = "doc_id")
    private Long docId;

    
    // 회사마다 HR 규정이 다르므로 comId로 구분하기
    @Column(name = "com_id", nullable = false)
    private Long comId;
    
    // 문서의 제목 (예: '2026년 근무 가이드')
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    // 개정 차수(1부터 증가)
    @Column(name = "doc_version", nullable = false)
    private Integer docVersion;

    // 현재 유효(= RAG 검색 대상) 문서 여부
    @Column(name = "actv", nullable = false)
    private boolean actv;

    // 원본 파일명
    @Column(name = "src_file_name", length = 200)
    private String srcFileName;

    // 저장된 파일의 URL
    @Column(name = "src_file_url", length = 500)
    private String srcFileUrl;

    // PDFBox로 추출한 원문 전체 (재색인/디버깅용, API 응답으로 노출하지 않음)
    @Lob
    @Column(name = "full_text")
    private String fullText;

    
    // 생성, 수정 시각
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 문서 삭제 시 하위 청크도 함께 삭제 (orphanRemoval)
    // cascade = CascadeType.ALL은 부모(Doc)에 대한 JPA 동작이 자식(Chunk)에도 자동 전파
    // orphanRemoval = true : 부모의 chunks 리스트에서 빠진 자식은 DB에서도 자동 DELETE
    @OneToMany(mappedBy = "doc", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HrPlcyChunk> chunks = new ArrayList<>();

    /* 새 버전 문서로 대체될 때 현재 행을 이력(종료 상태)으로 전환. 
       기존 급여 파트의 SalPlcyDoc.closeAsHistory()와 동일한 패턴.
     */
    public void closeAsHistory() {
        this.actv = false;
    }
}