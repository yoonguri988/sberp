package com.sb.erp.appr.dto.request;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprLogSearchCondition {
	
	// 특정 문서로 필터
	private Long docId;
	
	// 원결재자 또는 실제처리자 기준 필터
	private Long empId;
	private LocalDate startDate;
	private LocalDate endDate;
}
