package com.sb.erp.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiRecomResponse {
	private long targetDeptId; // AI 추천 실패 시 null 가능
	// 서비스에서 candidates 목록과 매칭해 채워줌 (화면 표시용)
	private String targetDeptName;
	private String reason;
}