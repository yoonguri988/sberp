package com.sb.erp.eval.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.sb.erp.eval.repository.EvalPeriodMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * AI 리포트 배치 오케스트레이터.
 * - @Async로 백그라운드에서 리포트 생성 실행
 * - 완료/실패 시 회차 상태 업데이트 (REPORTED / REPORTING_FAILED)
 * - 예외를 절대 밖으로 던지지 않음 (백그라운드 스레드)
 *
 * EvalReportService(리포트 만드는 방법)와 분리한 이유:
 * - 트랜잭션 경계 명확화 — 배치 자체는 트랜잭션 밖에서 실행
 * - 관심사 분리 — 오케스트레이션 vs 도메인 로직
 * - 순환 참조 자연 해소 — 이 서비스는 EvalPeriodService를 참조하지 않음
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EvalReportBatchService {

	private final EvalReportService evalReportService;
	private final EvalPeriodMapper evalPeriodMapper;

	/*
	 * 백그라운드에서 리포트 생성 실행.
	 * - 호출자는 트랜잭션 커밋 후 이 메서드를 호출해야 함 (REPORTING 상태가 확정된 후)
	 * - 이 메서드는 즉시 반환하고 별도 스레드에서 실행됨.
	 * @param periodId 대상 회차
	 * @param comId    회사 ID (Authentication은 @Async 스레드에서 못 쓰므로 파라미터로 전달)
	 */
	@Async("reportExecutor")
	public void runInBackground(long periodId, long comId) {
		log.info("[ReportBatch] 시작 periodId={}", periodId);

		try {
			int result = evalReportService.generateReports(periodId, comId);

			if (result == 1) {
				evalPeriodMapper.updateStatus(periodId, "REPORTED", comId);
				log.info("[ReportBatch] 완료 periodId={}", periodId);
			} else {
				evalPeriodMapper.updateStatus(periodId, "REPORTING_FAILED", comId);
				log.error("[ReportBatch] 실패 코드 {} ({}) periodId={}",
						result, describeGenerateResult(result), periodId);
			}

		} catch (Exception e) {
			// 예상 못한 예외 (네트워크, DB, OpenAI API 등) → REPORTING_FAILED
			log.error("[ReportBatch] 예외 발생 periodId={}", periodId, e);
			try {
				evalPeriodMapper.updateStatus(periodId, "REPORTING_FAILED", comId);
			} catch (Exception statusEx) {
				// 상태 업데이트마저 실패 → DB 이상. 로그만 남기고 종료
				// 회차는 REPORTING 상태에 방치됨. 수동 개입 필요
				log.error("[ReportBatch] 상태 업데이트도 실패", statusEx);
			}
		}
	}

	// generateReports 실패 코드 → 사람이 읽는 이유 문자열 매핑
	private String describeGenerateResult(int code) {
		switch (code) {
			case -1: return "회차 없음";
			case -2: return "허용되지 않은 상태";
			case -3: return "집계 대상 없음 (SUBMITTED 평가 부재)";
			default: return "알 수 없음";
		}
	}
}
