package com.sb.erp.eval.dto;

import lombok.Data;

@Data
public class EvalPeriodDto {
	
	// ─── evaluation_period 컬럼 ───
    private int periodId;
    private int comId;
    private int evalYear;          // 신규
    private String evalTerm;       // 신규 (H1/H2/ANNUAL)
    private String title;
    private String startDate;      // YYYY-MM-DD 문자열
    private String endDate;
    private String periodStatus;   // READY/OPEN/CLOSED/REPORTED
    private String createdAt;
    private String updatedAt;

    // ─── 조회용 부가 정보 ───
    private int evalCount;         // 이 회차의 평가 건수
    private int targetEmpCount;    // 이 회차의 피평가자 수
    private int reportCount;       // 이 회차의 AI 리포트 수
}
