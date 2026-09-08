package com.sb.erp.eval.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter @Getter
public class EvalRequest {
	private long evalId;
	private long periodId;
	private long targetEmpId;
	private long evaluatorId;

	// 자기평가 / 1차 / 2차 등 평가 구분. 이게 없으면 어떤 평가인지 알 수 없음
	@NotBlank(message = "평가 유형은 필수입니다.")
	private String evalType;

	// 점수 5개는 Integer지만 임시저장(제출 전) 상태에서 null 허용해야 함 → 검증 skip
	private Integer scorePerformance;
	private Integer scoreExpertise;
	private Integer scoreTeamwork;
	private Integer scoreAttitude;
	private Integer scoreGrowth;

	private java.math.BigDecimal weightedScore;
	private String strengthComment;
	private String improvementComment;
	private String evalStatus;
}
