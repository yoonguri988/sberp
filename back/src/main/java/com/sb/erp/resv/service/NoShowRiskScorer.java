package com.sb.erp.resv.service;

import java.time.Duration;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.sb.erp.api.dto.response.ResvAlertResponse;
import com.sb.erp.resv.repository.ReservationMapper;

import lombok.extern.slf4j.Slf4j;

/**
 * 노쇼/미반납 "이력 기반 위험도" 스코어러.
 *
 * ⚠️ 확률 예측 모델이 아니다. 아래 3개 변수를 0~1로 정규화해 가중합한 규칙 기반 스코어다.
 *   1) empHistoryFactor : 해당 사원의 과거 노쇼/미반납 알림 이력 횟수 (많을수록 1에 근접)
 *   2) elapsedFactor    : 예약 시작(회의실) 또는 종료(장비/차량) 이후 경과 시간 (오래될수록 1에 근접)
 *   3) resTypeFactor    : 자원 유형(회의실/장비/차량)의 과거 노쇼율 (개인 이력이 없는 신규 사원 보정용 사전확률 역할)
 *
 * 학습 데이터가 없어 실제 ML 모델을 만들 수 없고, 오탐(false positive)으로 자원을 불필요하게
 * 회수/알림하면 안 되기 때문에 "알림을 보낼지 말지"는 여전히 ApiScheduled의 룰 기반 트리거
 * (ReservationMapper#selectNoShowTargets, 예약시간 경과 + 미체크인/미반납 확정)가 결정한다.
 * 이 스코어는 "이미 트리거된 건 중 상대적으로 얼마나 위험한가"만 정량화해서
 *   - GPT에게 넘길 안내 문구의 어조(긴급도)를 조절하고
 *   - 관리자 화면에 우선순위 뱃지로 노출하는 데 쓴다.
 */
@Slf4j
@Component
public class NoShowRiskScorer {

	@Autowired
	private ReservationMapper resDao;

	// 사원 본인의 반복 이력 > 경과 시간(=확정성) > 자원 유형 평균 위험도(개인 이력 없을 때 보정) 순으로 가중치를 뒀다.
	private static final double W_EMP_HISTORY = 0.4;
	private static final double W_ELAPSED = 0.3;
	private static final double W_RES_TYPE = 0.3;

	// 과거 3회 이상 노쇼/미반납 알림 이력이면 해당 항목을 만점(1.0) 처리
	private static final int EMP_HISTORY_CAP = 3;
	// 경과 120분(2시간) 이상이면 해당 항목을 만점(1.0) 처리
	private static final long ELAPSED_CAP_MINUTES = 120L;

	public static final double HIGH_THRESHOLD = 0.66;
	public static final double MEDIUM_THRESHOLD = 0.33;

	public record RiskScoreResult(
			double score,
			String level,
			int empHistoryCount,
			double resTypeRate,
			long elapsedMinutes
	) {}

	public RiskScoreResult score(ResvAlertResponse dto) {
		int empHistoryCount = resDao.selectEmpNoShowHistoryCount(dto.getEmpId(), dto.getRevId());
		Double rawRate = resDao.selectResTypeNoShowRate(dto.getResType());
		double resTypeRate = rawRate == null ? 0.0 : rawRate;
		long elapsedMinutes = calcElapsedMinutes(dto);

		double score = computeScore(empHistoryCount, resTypeRate, elapsedMinutes);
		String level = toLevel(score);

		log.debug(
				"노쇼 위험도 스코어 - revId:{} empHistoryCount:{} resTypeRate:{} elapsedMin:{} => score:{} ({})",
				dto.getRevId(), empHistoryCount, resTypeRate, elapsedMinutes, score, level);

		return new RiskScoreResult(score, level, empHistoryCount, resTypeRate, elapsedMinutes);
	}

	/**
	 * 순수 계산 로직만 분리 - DB/스프링 컨텍스트 없이 단위 테스트하기 위함(NoShowRiskScorerTest 참고).
	 */
	public static double computeScore(int empHistoryCount, double resTypeRate, long elapsedMinutes) {
		double empFactor = Math.min(1.0, empHistoryCount / (double) EMP_HISTORY_CAP);
		double elapsedFactor = Math.min(1.0, elapsedMinutes / (double) ELAPSED_CAP_MINUTES);
		double resTypeFactor = clamp01(resTypeRate);

		return clamp01(
				W_EMP_HISTORY * empFactor
						+ W_ELAPSED * elapsedFactor
						+ W_RES_TYPE * resTypeFactor);
	}

	public static String toLevel(double score) {
		if (score >= HIGH_THRESHOLD) return "HIGH";
		if (score >= MEDIUM_THRESHOLD) return "MEDIUM";
		return "LOW";
	}

	private long calcElapsedMinutes(ResvAlertResponse dto) {
		// 회의실은 "시작 시간이 지났는데 이용 흔적 없음"이 트리거 조건이라 start_dt 기준,
		// 장비/차량은 "반납 예정 시간이 지났는데 미반납"이 트리거 조건이라 end_dt 기준으로 경과를 잰다.
		LocalDateTime reference = "ROOM".equals(dto.getResType()) ? dto.getStartDt() : dto.getEndDt();
		if (reference == null) {
			return 0L;
		}
		long minutes = Duration.between(reference, LocalDateTime.now()).toMinutes();
		return Math.max(0L, minutes);
	}

	private static double clamp01(double v) {
		if (Double.isNaN(v)) {
			return 0.0;
		}
		return Math.max(0.0, Math.min(1.0, v));
	}
}
