package com.sb.erp.res.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResSearchRequest {
	@Schema(hidden = true)
	private Long comId;
	private String keyword;
	@Schema(description = "자원 유형", example = "VEHICLE",
			allowableValues = {"VEHICLE", "ROOM", "EQUIPMENT"})
	private String resType;
	@Schema(description = "자원 상태", example = "AVAILABLE",
			allowableValues = {"MAINTENANCE", "AVAILABLE", "DISABLED"})
	private String resStatus;

	// 페이징
	@Builder.Default
	@Schema(example = "1", defaultValue = "1")
	private int pstartno = 1;
	@Builder.Default
	@Schema(example = "10", defaultValue = "10")
	private int onepagelist = 10;

	// 검색 조건이 비어있는지 확인 여부
	public boolean hasSearchCondition() {
		return (keyword != null && !keyword.isEmpty())
				|| (resType != null && !resType.isEmpty())
				|| (resStatus != null && !resStatus.isEmpty());
		// 검색 필드 추가될 때마다 여기에 || 조건 추가
	}
}