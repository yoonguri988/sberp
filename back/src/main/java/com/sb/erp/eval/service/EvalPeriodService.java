package com.sb.erp.eval.service;

import java.util.List;
import java.util.Map;

import com.sb.erp.eval.dto.request.PeriodRequest;
import com.sb.erp.eval.dto.request.PeriodSearchRequest;
import com.sb.erp.eval.dto.response.PeriodResponse;

public interface EvalPeriodService {

	// ─── 회차 조회 ────────────────────────────────────
	List<PeriodResponse> search(PeriodSearchRequest search, Long comId);

	PeriodResponse selectByPeriodId(long periodId, Long comId);

	Map<String, Integer> countByStatusAll(Long comId);


	// ─── 회차 등록/수정 ────────────────────────────────
	int insert(PeriodRequest dto, Long comId);

	int update(PeriodRequest dto, Long comId);

	// 상태 전환
	int openPeriod(long periodId, Long comId);
	int closePeriod(long periodId, Long comId);
	int reportPeriod(long periodId, Long comId);


	// ─── 중복 확인 ────────────────────────────────────
	boolean isDuplicate(int evalYear, String evalTerm, Long comId);


	// ─── 하위 데이터 카운트 ──────────────────────────────
	int countEvalsByPeriodId(long periodId);
	int countReportsByPeriodId(long periodId);

	// 리포트 진행률용: 회차별 평가 대상 사원 수
	int countDistinctTargetsByPeriodId(long periodId);
}
