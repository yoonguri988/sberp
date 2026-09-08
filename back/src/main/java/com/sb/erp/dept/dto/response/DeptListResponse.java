package com.sb.erp.dept.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 부서 조직도 화면 전용 조합 응답 DTO.
 * 필수 아님 - 프론트에서 통계(StatsDeptResponse)와 조직도(items)를 따로 호출해도 무방하면
 * 이 DTO 없이 List<DeptResponse>만 반환하도록 바꿔도 됨.
 */
@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeptListResponse {
	private long comId;
	private StatsDeptResponse stats;
	private List<DeptResponse> items;
}