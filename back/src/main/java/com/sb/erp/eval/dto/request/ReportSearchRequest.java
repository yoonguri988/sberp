package com.sb.erp.eval.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * AI 리포트 목록 검색 조건.
 * - periodId: 필수 (특정 회차의 리포트만)
 * - deptId: 부서 필터 (선택)
 * - keyword: 사원명 / 사번 검색 (선택)
 * - 페이징: page + pstartno + onepagelist
 */
@Getter @Setter @NoArgsConstructor
public class ReportSearchRequest {

	// ─── 검색 조건 ───
	private Long periodId;
	private Long deptId;
	private String keyword;

	// ─── 회사 격리 (컨트롤러에서 세팅) ───
	private Long comId;

	// ─── 페이징 ───
	private Integer page;         // 사용자가 요청한 페이지 (1-based)
	private Integer pstartno;     // OFFSET 값 (컨트롤러에서 PagingUtil로 세팅)
	private Integer onepagelist;  // LIMIT 값 (컨트롤러에서 PagingUtil로 세팅)
}
