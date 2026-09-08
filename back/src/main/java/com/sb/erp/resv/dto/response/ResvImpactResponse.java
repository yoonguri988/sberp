package com.sb.erp.resv.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResvImpactResponse {
	private Long revId;
	private Long empId;
	private String empName;
	private Long resId;
	private String resName;
	private String status;
	private LocalDateTime startDt;
	private LocalDateTime endDt;
}