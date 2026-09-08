package com.sb.erp.appr.dto.request;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprLineRequestSearchCondition {
	
	// REQ / APP / REJ
	private String reqStatus;
	// 요청자 기준 필터
	private Long reqEmpId;
	private LocalDate startDate;
	private LocalDate endDate;
}
