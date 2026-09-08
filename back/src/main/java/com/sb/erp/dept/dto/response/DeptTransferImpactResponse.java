package com.sb.erp.dept.dto.response;

import java.util.List;

import com.sb.erp.api.dto.response.AiRecomResponse;
import com.sb.erp.appr.dto.response.ApprDocImpactResponse;
import com.sb.erp.appr.dto.response.ApprLineImpactResponse;
import com.sb.erp.emp.dto.response.EmpTransferResponse;
import com.sb.erp.resv.dto.response.ResvImpactResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeptTransferImpactResponse {
	private long deptId;
	private String deptName;
	private String deptCode;

	// 이관 대상 사원
	private List<EmpTransferResponse> employees;
	// 사원 기준 미처리(WAI) 예약
	private List<ResvImpactResponse> reservations;
	// 사원 기준 미완료 결재라인
	private List<ApprLineImpactResponse> apprLines;
	// 사원이 기안한 진행중 결재문서
	private List<ApprDocImpactResponse> apprDocs;
	// 사원이 기안한 진행중 결재문서 제목 요약
	private String snapshotText;
	// 부서 후보들
	private List<DeptResponse> candidates;
	// 부서 추천 AI 내용
	private AiRecomResponse aiRecom;

	public int getEmployeeCount() {
		return employees == null ? 0 : employees.size();
	}

	public int getReservationCount() {
		return reservations == null ? 0 : reservations.size();
	}

	public int getApprLineCount() {
		return apprLines == null ? 0 : apprLines.size();
	}

	public int getApprDocCount() {
		return apprDocs == null ? 0 : apprDocs.size();
	}
}