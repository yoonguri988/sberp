package com.sb.erp.dept.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatsDeptResponse {
	private long deptTotal;
	private long dept0Total; // depth 0 (최상위) 부서 수
	private long dept1Total; // depth 1 부서 수
	private long dept2Total; // depth 2 부서 수
	private long empTotal;
}