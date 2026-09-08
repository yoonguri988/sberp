package com.sb.erp.dept.dto.response;

import java.time.format.DateTimeFormatter;

import com.sb.erp.dept.entity.Department;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PendingDeptResponse {

	private static final DateTimeFormatter DATETIME_FORMATTER =
			DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private long deptId;
	private String deptName;
	private String deptCode;
	private long empCount;
	private String updatedAt; // dept_status가 PENDING_DELETE로 바뀐 시점 (department.updated_at 재사용)

	// 삭제대기 부서 목록 조회용 (Department + empCount)
	public PendingDeptResponse(Department department, long empCount) {
		this.deptId = department.getDeptId();
		this.deptName = department.getDeptName();
		this.deptCode = department.getDeptCode();
		this.empCount = empCount;
		this.updatedAt = department.getUpdatedAt() != null ? department.getUpdatedAt().format(DATETIME_FORMATTER) : null;
	}
}