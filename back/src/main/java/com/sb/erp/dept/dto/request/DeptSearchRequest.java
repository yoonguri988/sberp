package com.sb.erp.dept.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeptSearchRequest {
	private long comId;
	private long deptId;
	private String deptCode;
}