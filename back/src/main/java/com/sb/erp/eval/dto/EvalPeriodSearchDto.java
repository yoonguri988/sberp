package com.sb.erp.eval.dto;

import lombok.Data;

@Data
public class EvalPeriodSearchDto {
	
	// ─── 검색 조건 ───────────
	private String 	periodStatus;  // 상태 필터
	private Integer evalYear;     // 연도 필터
	private String 	evalTerm;      // 반기 필터
	private int comId;

	// 페이징 (필요하면 주석 해제)
//	private Integer page;
//	private Integer pstartno;
//	private Integer onepagelist;
	
}
