package com.sb.erp.apct.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.apct.entity.Applicant;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class MyApplicationResponse {
	private Long apctId;
	private String recTitle;    // 지원한 공고 제목
	private String apctStatus;
	private String apctName;
	private String apctDate;
    private String apctEmail;
    private String apctPhone;
    private String resumeFileName;

	public MyApplicationResponse(Applicant applicant, String recTitle) {
		this.apctId = applicant.getApctId();
		this.recTitle = recTitle;
		this.apctStatus = applicant.getApctStatus();
		this.apctName = applicant.getApctName();
		this.apctDate = applicant.getApctDate() != null ? applicant.getApctDate().toString() : null;
        this.apctEmail = applicant.getApctEmail();
        this.apctPhone = applicant.getApctPhone();
	}
	
	// native query(Object[]) 매핑용 - 추가
	public MyApplicationResponse(Long apctId, String recTitle, String apctStatus, String apctName, LocalDateTime apctDate,
			 String apctEmail, String apctPhone, String resumeFileName) {
		this.apctId = apctId;
		this.recTitle = recTitle;
		this.apctStatus = apctStatus;
		this.apctName = apctName;
		this.apctDate = apctDate != null ? apctDate.toString() : null;
        this.apctEmail = apctEmail;
        this.apctPhone = apctPhone; 
        this.resumeFileName= resumeFileName;
	}
}