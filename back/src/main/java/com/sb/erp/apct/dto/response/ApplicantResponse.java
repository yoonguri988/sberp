package com.sb.erp.apct.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.apct.entity.Applicant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicantResponse {

	private Long apctId;
	private Long comId;
	private Long recId;
	private String apctName;
	private String apctEmail;
	private String apctPhone;
	private String apctStatus;
	private String apctDate;
    private String createdAt;
    private String updatedAt;
    
    // 조회(JOIN) 결과 전용 - DB에 없는 컬럼
    private String recTitle;      // 지원한 공고 제목 (목록 화면에서 필요할 수 있음)
    private Integer resumeCnt;    // 첨부된 이력서 수
    private Long rsmFitScore; 
    
	public ApplicantResponse(Applicant applicant) {
		this.apctId = applicant.getApctId();
		this.comId = applicant.getCompany().getComId();
		this.recId = applicant.getRecruit().getRecId();
		this.apctName = applicant.getApctName();
		this.apctEmail = applicant.getApctEmail();
		this.apctPhone = applicant.getApctPhone();
		this.apctStatus = applicant.getApctStatus();
		this.apctDate = applicant.getApctDate() != null ? applicant.getApctDate().toString() : null;
		this.createdAt = applicant.getCreatedAt() != null ? applicant.getCreatedAt().toString() : null;
		this.updatedAt = applicant.getUpdatedAt() != null ? applicant.getUpdatedAt().toString() : null;

	}

	public ApplicantResponse(Applicant applicant,String recTitle, Integer resumeCnt,Long rsmFitScore) {
		this(applicant);
		this.recTitle = recTitle;
		this.resumeCnt = resumeCnt;
		this.rsmFitScore = rsmFitScore;
	}
	
	// 관리자용 - fit_score 순위 조회(JPQL) 매핑용
	public ApplicantResponse(Long apctId, Long comId, Long recId, String apctName,
	                          String apctEmail, String apctPhone, String apctStatus,
	                          LocalDateTime apctDate, LocalDateTime createdAt, LocalDateTime updatedAt,
	                          String recTitle, Long rsmFitScore) {
	    this.apctId = apctId;
	    this.comId = comId;
	    this.recId = recId;
	    this.apctName = apctName;
	    this.apctEmail = apctEmail;
	    this.apctPhone = apctPhone;
	    this.apctStatus = apctStatus;
	    this.apctDate = apctDate != null ? apctDate.toString() : null;
	    this.createdAt = createdAt != null ? createdAt.toString() : null;
	    this.updatedAt = updatedAt != null ? updatedAt.toString() : null;
	    this.recTitle = recTitle;
	    this.rsmFitScore = rsmFitScore;
	}
    
    
}
