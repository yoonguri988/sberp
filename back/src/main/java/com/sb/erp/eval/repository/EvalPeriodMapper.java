package com.sb.erp.eval.repository;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.eval.dto.request.PeriodRequest;
import com.sb.erp.eval.dto.request.PeriodSearchRequest;
import com.sb.erp.eval.dto.response.PeriodResponse;

@Mapper
public interface EvalPeriodMapper {


	// ─── 회차 조회 ────────────────────────────────────
	// 회차 목록 조회
	List<PeriodResponse> search(PeriodSearchRequest search);

	// 회차 단건 조회
	PeriodResponse selectByPeriodId(@Param("periodId") long periodId, @Param("comId") long comId);

	// 상태별 개수
	Map<String, Integer> countByStatusAll(long comId);


	// ─── 회차 등록/수정 ────────────────────────────────
	// 회차 등록
	int insert(PeriodRequest dto);

	// 회차 정보 수정
	int update(PeriodRequest dto);

	// 상태 전환
	int updateStatus(@Param("periodId") long periodId,
			@Param("periodStatus") String periodStatus,
			@Param("comId") long comId);


	// ─── 중복 확인 ────────────────────────────────────
	boolean isDuplicate(@Param("evalYear") int evalYear,
			@Param("evalTerm") String evalTerm, @Param("comId") long comId);


	// ─── 하위 데이터 카운트 ────────────────────────────────────
	int countEvalsByPeriodId(long periodId);
	int countReportsByPeriodId(long periodId);

}
