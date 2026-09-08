package com.sb.erp.eval.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.sb.erp.eval.dto.request.PeriodRequest;
import com.sb.erp.eval.dto.request.PeriodSearchRequest;
import com.sb.erp.eval.dto.response.PeriodResponse;
import com.sb.erp.eval.repository.EvalMapper;
import com.sb.erp.eval.repository.EvalPeriodMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvalPeriodServiceImpl implements EvalPeriodService {

	private final EvalPeriodMapper evalPeriodMapper;
	private final EvalReportBatchService evalReportBatchService;
	private final EvalMapper evalMapper;

	// ─── 회차 조회 ────────────────────────────────────
	@Override
	public List<PeriodResponse> search(PeriodSearchRequest search, Long comId) {
		search.setComId(comId);
		return evalPeriodMapper.search(search);
	}

	@Override
	public PeriodResponse selectByPeriodId(long periodId, Long comId) {
		return evalPeriodMapper.selectByPeriodId(periodId, comId);
	}

	@Override
	public Map<String, Integer> countByStatusAll(Long comId) {
		return evalPeriodMapper.countByStatusAll(comId);
	}

	// ─── 회차 등록/수정 ────────────────────────────────
	@Override
	public int insert(PeriodRequest dto, Long comId) {
		dto.setComId(comId);
		return evalPeriodMapper.insert(dto);
	}

	@Override
	public int update(PeriodRequest dto, Long comId) {
		dto.setComId(comId);
		return evalPeriodMapper.update(dto);
	}

	// ─── 회차 상태 업데이트 ─────────────────────────────

	@Override
	public int openPeriod(long periodId, Long comId) {
		PeriodResponse period = selectByPeriodId(periodId, comId);
		if (period == null) {
			log.error("[EvalPeriod] 개시 실패(-1): 회차 없음 periodId={}", periodId);
			return -1;
		}

		if (!"READY".equals(period.getPeriodStatus())) {
			log.error("[EvalPeriod] 개시 실패(-2): 허용되지 않은 상태 status={} (READY만 가능) periodId={}",
					period.getPeriodStatus(), periodId);
			return -2;
		}

		return evalPeriodMapper.updateStatus(periodId, "OPEN", comId);
	}

	@Override
	public int closePeriod(long periodId, Long comId) {
		PeriodResponse period = selectByPeriodId(periodId, comId);
		if (period == null) {
			log.error("[EvalPeriod] 마감 실패(-1): 회차 없음 periodId={}", periodId);
			return -1;
		}

		if (!"OPEN".equals(period.getPeriodStatus())) {
			log.error("[EvalPeriod] 마감 실패(-2): 허용되지 않은 상태 status={} (OPEN만 가능) periodId={}",
					period.getPeriodStatus(), periodId);
			return -2;
		}

		int unsubmitted = evalMapper.countUnsubmittedByPeriod(periodId);
		if (unsubmitted > 0) {
			log.error("[EvalPeriod] 마감 실패(-3): 미제출 평가 {}건 존재 periodId={}",
					unsubmitted, periodId);
			return -3;
		}

		return evalPeriodMapper.updateStatus(periodId, "CLOSED", comId);
	}

	@Override
	@Transactional
	public int reportPeriod(long periodId, Long comId) {
		PeriodResponse period = selectByPeriodId(periodId, comId);
		if (period == null) {
			log.error("[EvalPeriod] 리포트 개시 실패(-1): 회차 없음 periodId={}", periodId);
			return -1;
		}

		String status = period.getPeriodStatus();
		// 진입 허용 상태:
		// - CLOSED: 최초 발행 (평가 마감 직후)
		// - REPORTING_FAILED: 실패 후 재시도
		// - REPORTED: 완료 리포트 전체 재생성 (프롬프트 튜닝, 데이터 수정 후 등)
		// REPORTING은 배치 진행 중이므로 중복 진입 금지.
		if (!"CLOSED".equals(status)
				&& !"REPORTING_FAILED".equals(status)
				&& !"REPORTED".equals(status)) {
			log.error("[EvalPeriod] 리포트 개시 실패(-2): 허용되지 않은 상태 status={} periodId={}",
					status, periodId);
			return -2;
		}

		// 상태를 즉시 REPORTING으로 전환 (이 트랜잭션이 커밋되면 확정)
		int result = evalPeriodMapper.updateStatus(periodId, "REPORTING", comId);
		if (result != 1) {
			return result;
		}

		// ⭐ 배치는 트랜잭션 커밋 후 실행되어야 함
		// - 커밋 전에 배치가 시작되면: 롤백 시 상태 불일치 + 배치가 존재하지 않는 REPORTING 회차 처리
		// - afterCommit 훅으로 커밋 확정 후에만 배치 개시
		// - Authentication은 async 스레드에서 못 쓰니 comId를 파라미터로 캡처
		final Long finalComId = comId;
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				// 배치 제출 자체가 실패하면(스레드풀 거부 등) 회차가 REPORTING에서 멈춤
				// REPORTING_FAILED 상태를 둔 이유가 이 데드락이므로 여기서도 동일하게 처리하기
				try {
					evalReportBatchService.runInBackground(periodId, finalComId);
				} catch (Exception e) {
					log.error("[EvalPeriod] 배치 개시 실패 periodId={}", periodId, e);
					evalPeriodMapper.updateStatus(periodId, "REPORTING_FAILED", finalComId);
				}
			}
		});

		return 1;
	}

	// ─── 중복 확인 ────────────────────────────────────
	@Override
	public boolean isDuplicate(int evalYear, String evalTerm, Long comId) {
		return evalPeriodMapper.isDuplicate(evalYear, evalTerm, comId);
	}

	// ─── 하위 데이터 카운트 ──────────────────────────────
	@Override
	public int countEvalsByPeriodId(long periodId) {
		return evalPeriodMapper.countEvalsByPeriodId(periodId);
	}

	@Override
	public int countReportsByPeriodId(long periodId) {
		return evalPeriodMapper.countReportsByPeriodId(periodId);
	}

	@Override
	public int countDistinctTargetsByPeriodId(long periodId) {
		return evalMapper.countDistinctTargetsByPeriodId(periodId);
	}
}
