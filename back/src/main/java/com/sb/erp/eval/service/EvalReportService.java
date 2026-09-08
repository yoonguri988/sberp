package com.sb.erp.eval.service;

import java.util.List;

import com.sb.erp.eval.dto.request.ReportSearchRequest;
import com.sb.erp.eval.dto.response.ReportResponse;

public interface EvalReportService {

	// ─── 조회 (관리자용) ───
	List<ReportResponse> selectByPeriodId(long periodId, Long comId);
	ReportResponse selectByReportId(long reportId, Long comId);
	int countByPeriodId(long periodId);

	// ─── 조회 (본인용) ───
	// 로그인 사용자(empId)의 특정 회차 리포트
	ReportResponse selectMyByPeriod(long periodId, Long empId);
	// 로그인 사용자(empId)의 전체 리포트 이력
	List<ReportResponse> selectMyAll(Long empId);

	// 특정 사원의 최근 리포트 1건 (emp/detail 임베드용)
	// - 관리자/본인 공용. 컨트롤러에서 이미 접근 권한을 검증한 뒤 호출한다는 전제.
	// - 리포트가 아직 없으면 null 리턴.
	ReportResponse selectLatestByEmpId(long empId, Long comId);

	// ─── 검색 + 페이징 ───
	List<ReportResponse> searchByPeriod(ReportSearchRequest search, Long comId);
	int countByPeriodSearch(ReportSearchRequest search, Long comId);

	// ─── 생성 ───
	// 회차 전체 리포트 일괄 생성/재생성
	// 반환 규약: 1=성공, -1=회차없음, -2=상태오류(REPORTING/REPORTED만 허용), -3=평가없음
	// ※ @Async 배치(EvalReportBatchService)에서도 호출되므로 comId를 파라미터로 받음
	int generateReports(long periodId, Long comId);

	// 특정 사원 리포트 개별 재생성
	// 반환 규약: 1=성공, -1=회차없음, -2=상태오류, -3=평가없음
	int regenerateReport(long periodId, long empId, Long comId);
}
