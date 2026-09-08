package com.sb.erp.eval.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ReportResponse {
	
	// ─── PK/FK ───
	private Long reportId;
	private Long periodId;
	
	// ─── 인사평가 회차 ───
	private String periodTitle;
	private Integer periodYear;
	private String periodTerm;
	
	// ─── 직원/부서 내용 ───
	private Long empId;
	private String empName;
	private String empNo;
	private String deptName;
	private String posName;
	
	// ─── 인사평가 점수 및 내용 ───
	private BigDecimal avgPerformance;
	private BigDecimal avgExpertise;
	private BigDecimal avgTeamwork;
	private BigDecimal avgAttitude;
	private BigDecimal avgGrowth;
	private BigDecimal overallScore;
	private String grade;
	private String aiSummary;
	private BigDecimal sentimentPositive;
	private BigDecimal sentimentNeutral;
	private BigDecimal sentimentNegative;
	private String sentimentLabel;
	private String modelName;
	private String generatedAt;
	
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
