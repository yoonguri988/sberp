package com.sb.erp.rsm.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.apct.entity.Applicant;
import com.sb.erp.chunk.entity.ResumeChunk;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
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
@Table(name = "RESUME")
public class Resume { // 이력서
	
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_resume")
    @SequenceGenerator(name = "seq_resume", sequenceName = "SEQ_RESUME", allocationSize = 1)
    @Column(name = "RSM_ID", nullable = false)
    private Long rsmId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "APCT_ID", nullable = false, unique = true)
    private Applicant applicant;
    
    @Column(name = "RSM_FILE_NAME", length = 200)
    private String rsmFileName;
    
    @Column(name = "RSM_FILE_URL", length = 500)
    private String rsmFileUrl;
    
    @Lob
    @Column(name = "RSM_EXTRACTED_TEXT")
    private String rsmExtractedText;
    
    @Lob
    @Column(name = "RSM_AI_SUMMARY")
    private String rsmAiSummary;
    
    @Column(name = "RSM_FIT_SCORE")
    private Long rsmFitScore;
    
    @Column(name = "RSM_STATUS", nullable = false, length = 20)
    private String rsmStatus;
    
    @Column(name = "RSM_UPLOADED_AT", updatable = false)
    private LocalDateTime rsmUploadedAt;
    
    @Column(name = "RSM_ANALYZED_AT")
    private LocalDateTime rsmAnalyzedAt;
    
    // 이력서 삭제/재분석 시 청크도 같이 정리돼야 함 → cascade + orphanRemoval
    @OneToMany(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ResumeChunk> chunks = new ArrayList<>();

}
