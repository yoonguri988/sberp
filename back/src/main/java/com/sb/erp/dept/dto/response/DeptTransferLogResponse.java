package com.sb.erp.dept.dto.response;

import java.time.format.DateTimeFormatter;

import com.sb.erp.dept.entity.DeptTransferLog;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class DeptTransferLogResponse {

	private static final DateTimeFormatter DATETIME_FORMATTER =
			DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private long logId;
	private long comId;
	// 원부서
	private long originDeptId;
	private String originDeptName;
	// 새부서
	private long targetDeptId;
	private String targetDeptName;
	// 이관된 사원정보
	private long empId;
	private String empNo;
	private String empName;
	// ai 관련 정보
	private String aiRecommended;
	private String aiReason;
	private String handoverSnapshot;
	// 이관 시킨 사원 정보 및 일자
	private long createdBy;
	private String createdByName;
	private String createdAt;

	public DeptTransferLogResponse(DeptTransferLog log) {
		this.logId = log.getLogId();
		this.comId = log.getCompany().getComId();
		this.originDeptId = log.getOriginDept().getDeptId();
		this.targetDeptId = log.getTargetDept().getDeptId();
		this.empId = log.getEmployee().getEmpId();
		this.aiRecommended = log.getAiRecommended();
		this.aiReason = log.getAiReason();
		this.handoverSnapshot = log.getHandoverSnapshot();
		this.createdBy = log.getCreatedBy().getEmpId();
		this.createdAt = log.getCreatedAt() != null ? log.getCreatedAt().format(DATETIME_FORMATTER) : null;
	}
}