package com.sb.erp.eval.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.eval.dto.request.EvalRequest;
import com.sb.erp.eval.dto.response.EvalResponse;

@Mapper
public interface EvalMapper {

	// ─── 평가 조회 ────────────────────────────────
	// 특정 회차에서 평가자가 평가할 대상 목록
	// (부서원 목록 + 이미 작성한 평가 상태 조인)
	// 대시보드 카드 UI용
	List<EvalResponse> selectTargetsByEvaluator(@Param("periodId") long periodId, @Param("evaluatorId") long evaluatorId);

	// 평가 단건 조회 (수정 폼용)
	EvalResponse selectByEvalId(@Param("evalId") long evalId, @Param("comId") Long comId);

	// 회차 내 특정 대상+평가자+유형 조합 조회 (중복 체크 및 기존 데이터 조회)
	EvalResponse selectByPeriodTargetEvaluator(@Param("periodId") long periodId, @Param("targetEmpId") long targetEmpId,
			@Param("evaluatorId") long evaluatorId, @Param("evalType") String evalType);

	// 특정 사원이 받은 평가 이력 (emp/detail 임베드용)
	List<EvalResponse> selectByTargetEmpId(long targetEmpId);

	// 회차별 전체 평가 목록 (관리자용)
	List<EvalResponse> selectByPeriodId(long periodId);


	// ─── 통계 ───────────────────────────────────

	// 회차 내 평가자별 진행률 (제출 완료 수)
	int countSubmittedByEvaluator(@Param("periodId") long periodId, @Param("evaluatorId") long evaluatorId);

	// 회차의 평가 대상 사원 수 — 리포트 진행률 산정
	int countDistinctTargetsByPeriodId(@Param("periodId") long periodId);

	// 회차의 미제출 평가 건수 — 회차 마감 검증용
	int countUnsubmittedByPeriod(@Param("periodId") long periodId);


	// ─── 평가 등록/수정 ──────────────────────────

	int insert(EvalRequest dto);

	int update(EvalRequest dto);
}
