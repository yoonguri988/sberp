package com.sb.erp.dept.dto.request;

import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class DeptTransferLogRequest {
	private long logId;
	private long comId;

	// 원부서
	@NotNull
	private long originDeptId;
	private String originDeptName;

	// 새부서
	@NotNull
	private long targetDeptId;
	private String targetDeptName;

	// 이관된 사원정보
	private long empId;

	// ai 관련 정보
	private String handoverSnapshot;

	// 이관 시킨 사원 정보 및 일자
	private long createdBy;

	private String aiRecommended;
	private String aiReason;
}