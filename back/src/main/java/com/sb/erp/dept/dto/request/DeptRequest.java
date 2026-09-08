package com.sb.erp.dept.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeptRequest {
	@Schema(hidden = true)
	private long deptId;   // 검색 조건 - 특정 부서 id
	private long comId;    // 소속 회사

	private long parentId; // 상위 부서 id (0 또는 미지정 시 최상위)

	@NotBlank(message = "부서명은 필수입니다")
	private String deptName;

	@NotBlank(message = "부서코드는 필수입니다")
	private String deptCode;
	
	private long sortOrder;
	private long empId;  // 부서장(담당자) - 선택
	private long depth;
}