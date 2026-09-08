package com.sb.erp.rsm.dto.response;

import com.sb.erp.rsm.entity.Resume;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ResumeResponse {
	
    private Long rsmId;
    private Long apctId;
    private String apctName;
    private String rsmFileName;
    private String rsmFileUrl;
    private String rsmAiSummary;
    private Long rsmFitScore;
    private String rsmStatus;
    private String rsmUploadedAt;
    private String rsmAnalyzedAt;
    
	public ResumeResponse(Resume resume) {
		this.rsmId = resume.getRsmId();
		this.apctId = resume.getApplicant().getApctId();
		this.apctName = resume.getApplicant().getApctName();
		this.rsmFileName = resume.getRsmFileName();
		this.rsmFileUrl = resume.getRsmFileUrl();
		this.rsmAiSummary = resume.getRsmAiSummary();
		this.rsmFitScore = resume.getRsmFitScore();
		this.rsmStatus = resume.getRsmStatus();
		this.rsmUploadedAt = resume.getRsmUploadedAt() != null ? resume.getRsmUploadedAt().toString() : null;
		this.rsmAnalyzedAt = resume.getRsmAnalyzedAt() != null ? resume.getRsmAnalyzedAt().toString() : null;
	}
    
    
}
