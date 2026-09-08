package com.sb.erp.appr.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprLineFavoriteRequest {
	
	@NotNull(message = "부서를 선택해주세요.")
	private Long deptId;
	
	@NotNull(message = "양식을 선택해주세요.")
	private Long forId;
	
	@NotNull(message = "결재선을 지정해주세요.")
	private List<Long> empIds;
}
