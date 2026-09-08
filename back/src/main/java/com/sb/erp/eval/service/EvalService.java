package com.sb.erp.eval.service;

import java.util.List;

import com.sb.erp.eval.dto.request.EvalRequest;
import com.sb.erp.eval.dto.response.EvalResponse;

public interface EvalService {

	// ─── 조회 ────────────────────────────────

	// 대시보드 카드용: 회차별 특정 평가자가 평가할 대상 목록
	List<EvalResponse> selectTargetsByEvaluator(long periodId, Long evaluatorId);

	// 평가 단건 조회 (수정 폼용)
	EvalResponse selectByEvalId(long evalId, Long comId);

	// 회차 내 전체 평가 (관리자용)
	List<EvalResponse> selectByPeriodId(long periodId);

	// 사원 상세에서 임베드용: 특정 사원이 받은 평가 이력
	List<EvalResponse> selectEvalHistoryByEmpId(long empId);


	// ─── 통계 ────────────────────────────────

	// 회차 내 특정 평가자의 제출 건수 (진행률용)
	int countSubmittedByEvaluator(long periodId, Long evaluatorId);


	// ─── 등록 / 수정 ──────────────────────────

	// 임시 저장 (점수 일부 null 가능)
	// 반환값: 1=성공, -1=회차/대상 없음, -2=회차가 OPEN이 아님, -3=평가자 아님
	int saveDraft(EvalRequest dto, Long evaluatorId, Long comId);

	// 최종 제출 (모든 점수 필수)
	// 반환값: 1=성공, -1=회차/대상 없음, -2=회차가 OPEN 아님, -3=평가자 아님, -4=점수/코멘트 누락
	int submit(EvalRequest dto, Long evaluatorId, Long comId);
}
