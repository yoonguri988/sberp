package com.sb.erp.dept.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 부서 상세 화면 전용 조합 응답 DTO.
 * 필수 아님 - ancestorChain(계층 경로)이 상세 화면에서 항상 같이 필요해서 조합.
 * 단순 부서 정보만 필요하면 DeptResponse만 반환하도록 바꿔도 됨.
 */
@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeptDetailResponse {
	private DeptResponse dept;
	private List<String> ancestorChain; // 예: ["회사명", "본부", "팀"]
}