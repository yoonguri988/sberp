package com.sb.erp.dept.dto.request;

import java.util.List;

import com.sb.erp.emp.dto.response.EmployeeTransferItemFormReponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DeptTransferExecuteFormRequest {
	private long deptId;
	private long comId;

	private String returnUrl;

	@NotEmpty(message = "이관할 사원을 1명 이상 선택해야 합니다")
	@Valid
	private List<EmployeeTransferItemFormReponse> items;

	/** 화면 로드 시점에 조회했던 AI 추천 사유 — 그대로 dept_transfer_log.ai_reason 에 감사 기록 */
	private String aiReason;

	/** 화면 로드 시점의 결재문서 제목 요약 — dept_transfer_log.handover_snapshot 에 감사 기록 */
	private String snapshotText;
}