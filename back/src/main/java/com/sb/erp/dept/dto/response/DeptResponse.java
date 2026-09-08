package com.sb.erp.dept.dto.response;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.dept.entity.Department;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeptResponse {

	private static final DateTimeFormatter DATETIME_FORMATTER =
			DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private long deptId;
	private long comId;
	private long parentId; // 최상위 부서는 0
	private String deptName;
	private String deptCode;
	private long depth;
	private long sortOrder;
	private String deptStatus; // ACTIVE, PENDING_DELETE, DELETED
	private boolean deleted;
	private String createdAt;
	private String updatedAt;

	// 조회(JOIN) 결과 전용
	private String parentName;
	private String leaderName;
	private long empCount;

	// 상세 조회시에만 채워짐
	private long leaderId;    // 부서장 미지정 시 0
	private String leaderPosName;
	private String leaderEmpNo;

	private List<DeptResponse> children;

	public List<DeptResponse> getChildren() {
		if (this.children == null) this.children = new ArrayList<>();
		return this.children;
	}

	public DeptResponse(Department department) {
		this.deptId = department.getDeptId();
		this.comId = department.getCompany().getComId();
		// 최상위 부서(parent 없음), 부서장 미지정(employee 없음)은 정상 케이스이므로 0으로 처리 (NPE 방지)
		this.parentId = department.getParent() != null ? department.getParent().getDeptId() : 0L;
		this.leaderId = department.getEmployee() != null ? department.getEmployee().getEmpId() : 0L;
		this.deptName = department.getDeptName();
		this.deptCode = department.getDeptCode();
		this.depth = department.getDepth();
		this.sortOrder = department.getSortOrder();
		this.deptStatus = department.getDeptStatus();
		this.deleted = department.isDeleted();
		this.createdAt = department.getCreatedAt() != null ? department.getCreatedAt().format(DATETIME_FORMATTER) : null;
		this.updatedAt = department.getUpdatedAt() != null ? department.getUpdatedAt().format(DATETIME_FORMATTER) : null;
	}
}