package com.sb.erp.eval.dto.request;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Setter @Getter
public class ReportRequest {
	
	// ─── PK/FK ───
	private Long reportId;
	private Long periodId;
	private Long empId;
	
	// ─── 인사평가 점수 ───
	private BigDecimal avgPerformance;
	private BigDecimal avgExpertise;
	private BigDecimal avgTeamwork;
	private BigDecimal avgAttitude;
	private BigDecimal avgGrowth;
	private BigDecimal overallScore;
	
	// ─── 등급/평가 라벨 ───
	private String grade;
	private String aiSummary;
	private BigDecimal sentimentPositive;
	private BigDecimal sentimentNeutral;
	private BigDecimal sentimentNegative;
	private String sentimentLabel;
	private String modelName;
	
	// ─── 근태 통계 ───
	private Integer attWorkDays;
	private Integer attLateCount;
	private Integer attEarlyLeaveCount;
	private Integer attAbsentCount;
	private BigDecimal attAnnualUsed;
	private Integer attTotalWorkMin;
	private Integer attOvertimeMin;
	private BigDecimal attRate;
}
