package com.sb.erp.eval.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sb.erp.att.dto.response.AttStatDto;
import com.sb.erp.att.repository.AttendanceRepository;
import com.sb.erp.eval.dto.request.ReportRequest;
import com.sb.erp.eval.dto.request.ReportSearchRequest;
import com.sb.erp.eval.dto.response.PeriodResponse;
import com.sb.erp.eval.dto.response.ReportResponse;
import com.sb.erp.eval.repository.EvalPeriodMapper;
import com.sb.erp.eval.repository.EvalReportMapper;
import com.sb.erp.global.integration.OpenAiClient;
import com.sb.erp.global.integration.openAi.ChatMessage;
import com.sb.erp.global.integration.openAi.ReportContent;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvalReportServiceImpl implements EvalReportService {

	private final EvalReportMapper evalReportMapper;
	private final EvalPeriodMapper evalPeriodMapper;
	private final OpenAiClient openAiClient;
	private final AttendanceRepository attendanceRepository;

	// 실제 GPT 사용 시 모델 이름
	private static final String REAL_MODEL_NAME = "gpt-4o-mini";
	// Mock 리포트 모델 표기
	private static final String MOCK_MODEL_NAME = "mock-analyzer-v1";

	// 가중치 (합계 1.00)
	private static final BigDecimal W_PERFORMANCE = new BigDecimal("0.40");
	private static final BigDecimal W_EXPERTISE = new BigDecimal("0.20");
	private static final BigDecimal W_TEAMWORK = new BigDecimal("0.20");
	private static final BigDecimal W_ATTITUDE = new BigDecimal("0.10");
	private static final BigDecimal W_GROWTH = new BigDecimal("0.10");


	// ─── GPT 결과 검증 ────────────────────────────
	// 요약문 비어있지 않음 + 감성 3개 모두 존재 + 합이 대략 100.0인지 확인
	private boolean isValidGptResult(ReportContent r) {
		if (r.summary() == null || r.summary().isBlank()) return false;
		if (r.sentimentPositive() == null || r.sentimentNeutral() == null || r.sentimentNegative() == null)
			return false;

		BigDecimal sum = r.sentimentPositive().add(r.sentimentNeutral()).add(r.sentimentNegative());
		BigDecimal diff = sum.subtract(new BigDecimal("100.0")).abs();
		if (diff.compareTo(new BigDecimal("0.01")) >= 0) {
			// GPT 응답 검증 실패는 Mock fallback으로 이어지는 정상 경로 → warn
			log.warn("[EvalReport] GPT 감성 합계 이상 sum={}", sum);
			return false;
		}
		return true;
	}


	// ─── 조회 ─────────────────────────────────────
	@Override
	public List<ReportResponse> selectByPeriodId(long periodId, Long comId) {
		return evalReportMapper.selectByPeriodId(periodId, comId);
	}

	@Override
	public ReportResponse selectByReportId(long reportId, Long comId) {
		return evalReportMapper.selectByReportId(reportId, comId);
	}

	@Override
	public int countByPeriodId(long periodId) {
		return evalReportMapper.countByPeriodId(periodId);
	}

	@Override
	public ReportResponse selectMyByPeriod(long periodId, Long empId) {
		return evalReportMapper.selectByPeriodAndEmp(periodId, empId);
	}

	@Override
	public List<ReportResponse> selectMyAll(Long empId) {
		return evalReportMapper.selectByEmpId(empId);
	}

	@Override
	public ReportResponse selectLatestByEmpId(long empId, Long comId) {
		return evalReportMapper.selectLatestByEmpId(empId, comId);
	}

	@Override
	public List<ReportResponse> searchByPeriod(ReportSearchRequest search, Long comId) {
		search.setComId(comId);
		return evalReportMapper.searchByPeriod(search);
	}

	@Override
	public int countByPeriodSearch(ReportSearchRequest search, Long comId) {
		search.setComId(comId);
		return evalReportMapper.countByPeriodSearch(search);
	}


	// ─── 생성/재생성 ───────────────────────────────

	@Override
	public int generateReports(long periodId, Long comId) {
		
		// 평가 회차 확인
		PeriodResponse period = evalPeriodMapper.selectByPeriodId(periodId, comId);
		if (period == null) {
			log.error("[EvalReport] 실패(-1): 회차 없음 periodId={}", periodId);
			return -1;
		}
		
		// 회차 상태 확인
		String status = period.getPeriodStatus();
		if (!"REPORTING".equals(status) && !"REPORTED".equals(status)) {
			log.error("[EvalReport] 실패(-2): 허용되지 않은 상태 status={} (REPORTING/REPORTED만 가능) periodId={}",
					status, periodId);
			return -2;
		}
		
		// 사원 평가 내용 있는지 확인
		List<Map<String, Object>> aggregates = evalReportMapper.selectAggregatesByPeriod(periodId);
		if (aggregates == null || aggregates.isEmpty()) {
			log.error("[EvalReport] 실패(-3): 집계 대상 없음 (SUBMITTED 상태 평가 부재) periodId={}", periodId);
			return -3;
		}
		
		// ★ 근태 통계 일괄 조회 (N+1 방지)
		List<Long> empIds = aggregates.stream()
				.map(agg -> toLong(agg.get("empId")))
				.collect(Collectors.toList());

		LocalDate startDate = LocalDate.parse(period.getStartDate()); // "YYYY-MM-DD"
		LocalDate endDate = LocalDate.parse(period.getEndDate());

		// 기간 내 영업일 수 (토/일 제외, 공휴일 미반영)
		long businessDays = startDate.datesUntil(endDate.plusDays(1))
				.filter(d -> d.getDayOfWeek().getValue() <= 5)
				.count();

		Map<Long, AttStatDto> attStatMap = attendanceRepository
				.findAttStatsByEmpIdsAndDateRange(empIds, startDate, endDate)
				.stream()
				.map(AttStatDto::from)
				.collect(Collectors.toMap(AttStatDto::getEmpId, s -> s));
		
		// ★ 디버그
		log.debug("[EvalReport] 영업일 수={} (기간: {} ~ {})", businessDays, startDate, endDate);
		log.info("[EvalReport] 근태 조회 {}명 / 대상 {}명", attStatMap.size(), empIds.size());
		// 사원 수만큼 찍히므로 반드시 debug. 500명이면 리포트 1회당 500줄이 INFO로 쌓인다.
		attStatMap.forEach((id, stat) -> log.debug("empId={} workDays={} late={}",
				id, stat.getWorkDays(), stat.getLateCount()));

		// 사원별 리포트 생성 (기존 존재 시 update)
		for (Map<String, Object> agg : aggregates) {
			ReportRequest report = buildReportFromAggregate(periodId, agg, attStatMap, businessDays);

			ReportResponse existing = evalReportMapper.selectByPeriodAndEmp(periodId, report.getEmpId());
			if (existing == null) {
				evalReportMapper.insert(report);
			} else {
				evalReportMapper.update(report);
			}
		}
		return 1;
	}

	@Override
	public int regenerateReport(long periodId, long empId, Long comId) {
		
		// 재생성할 회차 확인
		PeriodResponse period = evalPeriodMapper.selectByPeriodId(periodId, comId);
		if (period == null) {
			log.error("[EvalReport] 재생성 실패(-1): 회차 없음 periodId={}", periodId);
			return -1;
		}
		
		// 회차 상태 확인, 재생성은 REPORTED만 허용
		String status = period.getPeriodStatus();
		if (!"REPORTED".equals(status)) {
			log.error("[EvalReport] 재생성 실패(-2): 허용되지 않은 상태 status={} (REPORTED만 가능) periodId={}",
					status, periodId);
			return -2;
		}
		
		// ★ 근태 통계 조회 (1명)
	    LocalDate startDate = LocalDate.parse(period.getStartDate());
	    LocalDate endDate = LocalDate.parse(period.getEndDate());
	    long businessDays = startDate.datesUntil(endDate.plusDays(1))
	            .filter(d -> d.getDayOfWeek().getValue() <= 5)
	            .count();

	    Map<Long, AttStatDto> attStatMap = attendanceRepository
	            .findAttStatsByEmpIdsAndDateRange(List.of(empId), startDate, endDate)
	            .stream()
	            .map(AttStatDto::from)
	            .collect(Collectors.toMap(AttStatDto::getEmpId, s -> s));

		// 해당 사원의 집계만 찾기 (전체 집계 조회 후 필터링)
		List<Map<String, Object>> aggregates = evalReportMapper.selectAggregatesByPeriod(periodId);
		for (Map<String, Object> agg : aggregates) {
			long aggEmpId = toLong(agg.get("empId"));
			if (aggEmpId == empId) {
				ReportRequest report = buildReportFromAggregate(periodId, agg, attStatMap, businessDays);
				ReportResponse existing = evalReportMapper.selectByPeriodAndEmp(periodId, empId);
				if (existing == null) {
					evalReportMapper.insert(report);
				} else {
					evalReportMapper.update(report);
				}
				return 1;
			}
		}

		log.error("[EvalReport] 재생성 실패(-3): 해당 사원의 평가가 없음 periodId={} empId={}",
				periodId, empId);
		return -3;
	}


	// ─── 리포트 생성 로직 ─────────────────────────
	private ReportRequest buildReportFromAggregate(long periodId, Map<String, Object> agg,
			Map<Long, AttStatDto> attStatMap, long businessDays) {
		ReportRequest dto = new ReportRequest();
		dto.setPeriodId(periodId);
		dto.setEmpId(toLong(agg.get("empId")));

		// 1) 숫자 계산 부분 (GPT와 무관)
		BigDecimal avgP = toBigDecimal(agg.get("avgPerformance"));
		BigDecimal avgE = toBigDecimal(agg.get("avgExpertise"));
		BigDecimal avgT = toBigDecimal(agg.get("avgTeamwork"));
		BigDecimal avgA = toBigDecimal(agg.get("avgAttitude"));
		BigDecimal avgG = toBigDecimal(agg.get("avgGrowth"));

		dto.setAvgPerformance(avgP);
		dto.setAvgExpertise(avgE);
		dto.setAvgTeamwork(avgT);
		dto.setAvgAttitude(avgA);
		dto.setAvgGrowth(avgG);

		// ★ 2) 근태 통계 반영하기
		AttStatDto attStat = attStatMap.get(dto.getEmpId());
		if (attStat != null) {
			dto.setAttWorkDays(attStat.getWorkDays());
			dto.setAttLateCount(attStat.getLateCount());
			dto.setAttEarlyLeaveCount(attStat.getEarlyLeaveCount());
			dto.setAttAbsentCount(attStat.getAbsentCount());
			dto.setAttAnnualUsed(attStat.getAnnualUsed());
			dto.setAttTotalWorkMin(attStat.getTotalWorkMin());
			dto.setAttOvertimeMin(attStat.getOvertimeMin());

			// 출근율 = 출근일 / 영업일 × 100
			if (businessDays > 0) {
				BigDecimal rate = new BigDecimal(attStat.getWorkDays())
						.divide(new BigDecimal(businessDays), 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
						.setScale(2, RoundingMode.HALF_UP);
				dto.setAttRate(rate);
			}
		}
		// 근태 기록이 없으면 DEFAULT 0 유지 (DTO 초기값)

		BigDecimal overall = avgP.multiply(W_PERFORMANCE)
				.add(avgE.multiply(W_EXPERTISE))
				.add(avgT.multiply(W_TEAMWORK))
				.add(avgA.multiply(W_ATTITUDE))
				.add(avgG.multiply(W_GROWTH))
				.setScale(2, RoundingMode.HALF_UP);
		dto.setOverallScore(overall);
		dto.setGrade(calcGrade(overall));

		// 3) GPT 호출 시도 (실패 시 Mock fallback)
		String empName = (String) agg.get("empName");
		String posName = (String) agg.get("posName");
		String deptName = (String) agg.get("deptName");
		String strengths = (String) agg.get("allStrengthComments");
		String improvements = (String) agg.get("allImprovementComments");
		int evalCount = toInt(agg.get("evalCount"));
		
		// 4) buildUserPrompt에 사용될 근태 내용 설정
		List<ChatMessage> messages = List.of(
		        ChatMessage.system(EvalReportPrompts.SYSTEM_INSTRUCTION),
		        ChatMessage.user(EvalReportPrompts.buildUserPrompt(
		                empName, posName, deptName,
		                strengths, improvements,
		                attStat != null ? attStat.getWorkDays() : 0,
		                attStat != null ? attStat.getLateCount() : 0,
		                attStat != null ? attStat.getEarlyLeaveCount() : 0,
		                attStat != null ? attStat.getAbsentCount() : 0,
		                attStat != null ? attStat.getAnnualUsed().toPlainString() : "0",
		                dto.getAttRate() != null ? dto.getAttRate().toPlainString() : "0",
		                attStat != null ? attStat.getTotalWorkMin() : 0,
		                attStat != null ? attStat.getOvertimeMin() : 0)));

		ReportContent gptResult = openAiClient.generateReport(messages);

		if (gptResult != null && isValidGptResult(gptResult)) {
			// ✅ GPT 성공 경로
			dto.setAiSummary(gptResult.summary());
			dto.setSentimentPositive(gptResult.sentimentPositive());
			dto.setSentimentNeutral(gptResult.sentimentNeutral());
			dto.setSentimentNegative(gptResult.sentimentNegative());
			dto.setModelName(REAL_MODEL_NAME);
			log.debug("[EvalReport] GPT 성공 empId={}", dto.getEmpId());
		} else {
			// ⚠️ GPT 실패 → Mock fallback
			BigDecimal[] sentiment = mockSentiment(overall);
			dto.setSentimentPositive(sentiment[0]);
			dto.setSentimentNeutral(sentiment[1]);
			dto.setSentimentNegative(sentiment[2]);
			dto.setAiSummary(mockSummary(empName, overall, dto.getGrade(), strengths, improvements, evalCount, attStat, dto.getAttRate()));
			dto.setModelName(MOCK_MODEL_NAME);
			// 설계된 fallback 경로 - error로 남기면 알림이 계속 생겨서 진짜 에러가 묻힌다.
			log.warn("[EvalReport] GPT 실패 → Mock fallback empId={}", dto.getEmpId());
		}

		// 5) sentimentLabel은 자바가 판단 (감성 3개 중 최대값 기반)
		dto.setSentimentLabel(
				labelFromSentiment(dto.getSentimentPositive(), dto.getSentimentNeutral(), dto.getSentimentNegative()));

		return dto;
	}

	// 종합 점수 → 등급 매핑
	// S: 4.5+, A: 4.0+, B: 3.5+, C: 3.0+, D: 그 이하
	private String calcGrade(BigDecimal overall) {
		if (overall.compareTo(new BigDecimal("4.5")) >= 0) return "S";
		if (overall.compareTo(new BigDecimal("4.0")) >= 0) return "A";
		if (overall.compareTo(new BigDecimal("3.5")) >= 0) return "B";
		if (overall.compareTo(new BigDecimal("3.0")) >= 0) return "C";
		return "D";
	}

	// 종합 점수 기반 mock 감성 분포 (합계 정확히 100.00)
	private BigDecimal[] mockSentiment(BigDecimal overall) {
		double s = overall.doubleValue();
		double pos, neu;
		if (s >= 4.0) { pos = 70.0; neu = 25.0; }
		else if (s >= 3.5) { pos = 50.0; neu = 35.0; }
		else if (s >= 3.0) { pos = 30.0; neu = 45.0; }
		else if (s >= 2.5) { pos = 15.0; neu = 40.0; }
		else { pos = 5.0; neu = 30.0; }

		BigDecimal p = new BigDecimal(pos).setScale(2, RoundingMode.HALF_UP);
		BigDecimal ne = new BigDecimal(neu).setScale(2, RoundingMode.HALF_UP);
		BigDecimal ng = new BigDecimal("100.00").subtract(p).subtract(ne).setScale(2, RoundingMode.HALF_UP);
		return new BigDecimal[] { p, ne, ng };
	}

	private String labelFromSentiment(BigDecimal p, BigDecimal ne, BigDecimal ng) {
		if (p.compareTo(ne) >= 0 && p.compareTo(ng) >= 0) return "POSITIVE";
		if (ng.compareTo(p) > 0 && ng.compareTo(ne) > 0) return "NEGATIVE";
		return "NEUTRAL";
	}

	// Mock 요약문 (API 연동 실패 시 fallback 템플릿)
	private String mockSummary(String empName, BigDecimal overall, String grade,
			String strengths, String improvements, int evalCount,
	        AttStatDto attStat, BigDecimal attRate) {
		StringBuilder sb = new StringBuilder();
		sb.append("[Mock 요약] ").append(empName == null ? "대상 사원" : empName)
				.append("님은 총 ").append(evalCount)
				.append("건의 평가를 받았으며, ").append("종합 점수 ")
				.append(overall.toPlainString()).append("점(").append(grade)
				.append(" 등급)을 획득했습니다.\n\n");
		
		sb.append("■ 근태 현황\n");
		if (attStat != null) {
		    sb.append("출근일 ").append(attStat.getWorkDays()).append("일")
		      .append(" / 지각 ").append(attStat.getLateCount()).append("회")
		      .append(" / 조퇴 ").append(attStat.getEarlyLeaveCount()).append("회")
		      .append(" / 결근 ").append(attStat.getAbsentCount()).append("회")
		      .append(" / 연차 ").append(attStat.getAnnualUsed()).append("일")
		      .append(" / 출근율 ").append(attRate != null ? attRate.toPlainString() : "0").append("%\n\n");
		} else {
		    sb.append("(근태 데이터 없음)\n\n");
		}
		
		sb.append("■ 주요 강점\n");
		sb.append(strengths != null && !strengths.isBlank()
				? truncate(strengths, 300) + "\n\n"
				: "(수집된 강점 코멘트 없음)\n\n");

		sb.append("■ 개선 제안\n");
		sb.append(improvements != null && !improvements.isBlank()
				? truncate(improvements, 300) + "\n\n"
				: "(수집된 개선 코멘트 없음)\n\n");

		sb.append("※ 본 요약은 OpenAI 연동 전 임시 mock 데이터입니다.");
		return sb.toString();
	}

	// ─── util ────────────────────────────────────
	private String truncate(String s, int max) {
		if (s == null) return "";
		return s.length() <= max ? s : s.substring(0, max) + "...";
	}

	private int toInt(Object v) {
		if (v == null) return 0;
		if (v instanceof Number) return ((Number) v).intValue();
		return Integer.parseInt(v.toString());
	}

	private long toLong(Object v) {
		if (v == null) return 0L;
		if (v instanceof Number) return ((Number) v).longValue();
		return Long.parseLong(v.toString());
	}

	private BigDecimal toBigDecimal(Object v) {
		if (v == null) return BigDecimal.ZERO;
		if (v instanceof BigDecimal) return (BigDecimal) v;
		if (v instanceof Number) return new BigDecimal(v.toString());
		return new BigDecimal(v.toString());
	}
}
