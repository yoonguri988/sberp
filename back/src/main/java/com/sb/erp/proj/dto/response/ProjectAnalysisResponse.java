package com.sb.erp.proj.dto.response;

import java.time.LocalDate;

import lombok.Getter;

@Getter
public class ProjectAnalysisResponse { // 프로젝트 ai 분석용 - 순수 조회 결과
	private Long proId;
	private String projectName;
	
	//계산용
	private LocalDate endDate; 
	
	//태스크 통계
	private Integer totalTask;
	private Integer todoCount;
	private Integer doingCount;
	private Integer doneCount;
	private Integer delayCount;
	
	//계산 결과
	private Integer progressRate;
	private long remainDays;
	
	public void setRemainDays(long remainDays) {
		this.remainDays = remainDays;
	}
}
