package com.sb.erp.week.dto.response;

import java.time.LocalDate;

import lombok.Getter;

@Getter
public class WeeklyReportResponse {// 팀장용보고서 (프로젝트단위 집계) / 순수 조회/계산
	private Long proId;
	private String projectName;
	
	//진행 현황
	private Integer totalTask;
	private Integer completedThisWeek;
	private Integer delayTaskCount;
	private Integer progressRate;
	private Integer doneTaskCount;
	private Integer notDoneTaskCount;
	
	//통계
	private Double avgTaskDays;
	private Integer avgDelayDays;
	
	//계산용
	private LocalDate endDate; 
	
	//ai에게 넘길 정보
	private Long remainDays;
	
	//역할별 보고서
	private String reportRole;
	
	public void setRemainDays(long remainDays) {
		this.remainDays = remainDays;
	}
}
