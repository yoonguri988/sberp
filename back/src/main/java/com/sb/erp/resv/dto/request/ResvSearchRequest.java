package com.sb.erp.resv.dto.request;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResvSearchRequest {
	@Schema(hidden = true)
	private Long comId;
	@Schema(hidden = true)
	private Long empId;
	
	private Long resId;
	private Long excludeRevId;

	private String keyword;
	private String status;
	@Schema(description = "자원 유형", example = "VEHICLE",
			allowableValues = {"VEHICLE", "ROOM", "EQUIPMENT"})
	private String resType;
	
	private LocalDateTime startDt;
	private LocalDateTime endDt;

	// 페이징
	@Schema(example = "1", defaultValue = "1")
	@Builder.Default
	private int pstartno = 1;
	
	@Schema(example = "10", defaultValue = "10")
	@Builder.Default
	private int onepagelist = 10;

	// 검색 조건이 비어있는지 확인 여부
	public boolean hasSearchCondition() {
		return (keyword != null && !keyword.isEmpty())
				|| (status != null && !status.isEmpty())
				|| (startDt != null)
				|| (endDt != null)
				|| (resType != null && !resType.isEmpty());
		// 검색 필드 추가될 때마다 여기에 || 조건 추가
	}
}