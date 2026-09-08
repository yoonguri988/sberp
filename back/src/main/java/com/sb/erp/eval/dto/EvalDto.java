package com.sb.erp.eval.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class EvalDto {

    // ─── performance_evaluation 컬럼 ───
    private int evalId;
    private int periodId;
    private int targetEmpId;
    private int evaluatorId;
    private String evalType;       // LEADER 기본

    
    // 점수 5개 - DRAFT 시 null 가능
    private Integer scorePerformance;
    private Integer scoreExpertise;
    private Integer scoreTeamwork;
    private Integer scoreAttitude;
    private Integer scoreGrowth;

    
    // 가중 총점 (5개 항목 가중치 계산 결과)
    private BigDecimal weightedScore;

    
    // 서술형 코멘트 (강점/개선점 분리)
    private String strengthComment;
    private String improvementComment;

    private String evalStatus;     // DRAFT/SUBMITTED
    private String createdAt;
    private String updatedAt;

    
    // ─── 조인 결과 (조회용) ───
    private String 	periodTitle;
    private Integer periodYear;
    private String 	periodTerm;
    private String 	targetEmpName;
    private String 	targetEmpNo;
    private String 	targetDeptName;
    private String 	targetPosName;
    private String 	evaluatorName;  // 익명 처리는 뷰에서
    private String 	evaluatorPosName;
}