package com.sb.erp.dept.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class DeptTransferLogSearchRequest {
	private Long originDeptId; // 원부서 (null = 전체)
	private Long targetDeptId; // 대상부서 (null = 전체)

	// "Y" | "N" | null(전체)
	private String aiRecommended; // ai 제안여부
	private String dateFrom;      // 처리시작일자
	private String dateTo;        // 처리종료일자

	// 페이지네이션
	private int pstartno = 1;
	private int onepagelist = 10;
}