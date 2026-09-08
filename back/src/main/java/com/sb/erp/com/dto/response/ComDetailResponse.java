package com.sb.erp.com.dto.response;

import java.util.List;

import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.StatsDeptResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComDetailResponse {
	private ComResponse com;
	private StatsDeptResponse deptStats;
	private List<DeptResponse> deptList;
}
 