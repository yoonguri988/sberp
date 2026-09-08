package com.sb.erp.chunk.entity;

import com.sb.erp.rsm.entity.Resume;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "RESUME_CHUNK", uniqueConstraints = 
{ @UniqueConstraint( name = "UK_RESUME_CHUNK_ORDER", columnNames = {"RSM_ID", "CHUNK_ORDER"} ) })
public class ResumeChunk { // 이력서 청크+임베딩
	/* dto 없는 이유(임베딩,청크 노출x인 이유):벡터 값만 있으면 원본 텍스트를 역으로 유추하거나(임베딩 인버전 공격), 
	 * 최소한 그 문서가 어떤 내용인지 유사도 비교로 추정할 수 있어서 보안상으로도 노출 안 시키는 게 원칙입니다. 
	 * 지금 케이스면 지원자 이력서 내용이 간접적으로 새는 셈이라 더더욱 막아야 해요.*/
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_resume_chunk")
    @SequenceGenerator(name = "seq_resume_chunk", sequenceName = "SEQ_RESUME_CHUNK", allocationSize = 1)
    @Column(name = "CHUNK_ID", nullable = false)
    private Long chunkId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RSM_ID", nullable = false)
    private Resume resume;
    
    @Column(name = "CHUNK_ORDER", nullable = false)
    private Long chunkOrder;
    
    @Lob
    @Column(name = "CHUNK_TEXT", nullable = false)
    private String chunkText;
    
    @Lob
    @Column(name = "CHUNK_EMBEDDING", nullable = false)
    private String chunkEmbedding;

}
