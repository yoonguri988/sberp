package com.sb.erp.eval.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class EvalReportDto {

    // ─── evaluation_ai_report 컬럼 ───
    private int reportId;
    private int periodId;
    private int empId;

    // 5개 항목 평균
    private BigDecimal avgPerformance;
    private BigDecimal avgExpertise;
    private BigDecimal avgTeamwork;
    private BigDecimal avgAttitude;
    private BigDecimal avgGrowth;

    // 종합 지표
    private BigDecimal 	overallScore;
    private String 		grade;          // S/A/B/C/D

    // AI 요약
    private String aiSummary;

    // 감성 분석
    private BigDecimal 	sentimentPositive;
    private BigDecimal 	sentimentNeutral;
    private BigDecimal 	sentimentNegative;
    private String 		sentimentLabel; // POSITIVE/NEUTRAL/NEGATIVE

    // AI 추적성
    private String modelName;
    private String generatedAt;

    private String createdAt;
    private String updatedAt;

    // ─── 조인 결과 (조회용) ───
    private String 	periodTitle;
    private Integer periodYear;
    private String 	periodTerm;
    private String 	empName;
    private String 	empNo;
    private String 	deptName;
    private String 	posName;
}