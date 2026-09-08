package com.sb.erp.dashboard.member.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardProjResponse {
	private Long proId;
	private String proName;
	private String proStatus;
	private LocalDate endDate;
	private Integer progressRate;
}
