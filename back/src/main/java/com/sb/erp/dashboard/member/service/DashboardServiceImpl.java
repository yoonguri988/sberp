package com.sb.erp.dashboard.member.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprDocSearchCondition;
import com.sb.erp.appr.dto.response.ApprDocSummaryResponse;
import com.sb.erp.appr.service.ApprDocService;
import com.sb.erp.att.dto.response.AttendanceResponse;
import com.sb.erp.att.dto.response.LeaveBalanceResponse;
import com.sb.erp.att.service.AttendanceService;
import com.sb.erp.att.service.LeaveBalanceService;
import com.sb.erp.dashboard.member.dto.response.DashboardProjResponse;
import com.sb.erp.dashboard.member.dto.response.DashboardSummaryResponse;
import com.sb.erp.eval.dto.request.PeriodSearchRequest;
import com.sb.erp.eval.dto.response.EvalResponse;
import com.sb.erp.eval.dto.response.PeriodResponse;
import com.sb.erp.eval.service.EvalPeriodService;
import com.sb.erp.eval.service.EvalService;
import com.sb.erp.notice.dto.request.NoticeSearchRequest;
import com.sb.erp.notice.dto.response.NoticeResponse;
import com.sb.erp.notice.service.NoticeService;
import com.sb.erp.proj.repository.ProjectMapper;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.service.ReservationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService{
	
	private final ApprDocService docService;
	private final LeaveBalanceService levService;
	private final AttendanceService attService;
	private final EvalPeriodService evalPerService;
	private final EvalService evalService;
	private final NoticeService noService;
	private final ProjectMapper projMapper;
	private final ReservationService resService;
	
	
	@Override
	public DashboardSummaryResponse getSummary(Long empId, Long comId) {
		
		// 결재 대기
		ApprDocSearchCondition apprCond = new ApprDocSearchCondition();
		apprCond.setEmpId(empId);
		apprCond.setPstartno(0);
		apprCond.setOnepagelist(5);
		int todoDocCnt = docService.selectMyTodoDocsCnt(apprCond);
		List<ApprDocSummaryResponse> todoDocs = docService.selectMyTodoDocs(apprCond);
		
		// 잔여 연차 (올해분)
		int currentYear = LocalDate.now().getYear();
		LeaveBalanceResponse leaveBalance = levService.getMyBalances(empId).stream()
				.filter(b -> b.getYear() == currentYear)
				.findFirst()
				.orElse(null);
		
		// 오늘 근태
		AttendanceResponse todayAttendance = attService.getAttendanceByEmpId(empId).stream()
				.filter(a -> LocalDate.now().equals(a.getAttDate()))
				.findFirst()
				.orElse(null);
		
		// 진행중 인사평가
		PeriodSearchRequest evalSearch = new PeriodSearchRequest();
		evalSearch.setPeriodStatus("OPEN");
		List<PeriodResponse> openPeriods = evalPerService.search(evalSearch, comId);
		
		boolean evalOpen = !openPeriods.isEmpty();
		Map<String, Object> evalProgress = null;
		if (evalOpen) {
			PeriodResponse period = openPeriods.get(0);
			List<EvalResponse> targets = evalService.selectTargetsByEvaluator(period.getPeriodId(), empId);
			int submittedCount = evalService.countSubmittedByEvaluator(period.getPeriodId(), empId);
			evalProgress = Map.of(
					"periodId", period.getPeriodId(),
					"periodName", period.getEvalYear() + " " + period.getEvalTerm(),
					"submittedCount", submittedCount,
					"totalCount", targets.size()
			);
		}
		
		// 최근 공지
		NoticeSearchRequest noticeSearch = new NoticeSearchRequest();
		noticeSearch.setComId(comId);
		List<NoticeResponse> recentNotices = noService.getNoticeListWithUrgent(noticeSearch)
				.stream().limit(5).toList();
		
		// 내 프로젝트
		List<DashboardProjResponse> myProjects = projMapper.selectMyProjects(empId);
		
		// 내 자원예약 (최근 30일중 5건)
		ResvSearchRequest resvSearch = new ResvSearchRequest();
		resvSearch.setComId(comId);
		resvSearch.setEmpId(empId);
		resvSearch.setStartDt(LocalDateTime.now().minusDays(30));
		resvSearch.setEndDt(LocalDateTime.now());
		List<ResvResponse> myReservations = resService.getResvList(resvSearch)
				.stream().limit(5).toList();
		
		return DashboardSummaryResponse.builder()
				.todoDocCnt(todoDocCnt)
				.todoDocs(todoDocs)
				.leaveBalance(leaveBalance)
				.todayAttendance(todayAttendance)
				.evalOpen(evalOpen)
				.evalProgress(evalProgress)
				.recentNotices(recentNotices)
				.myProjects(myProjects)
				.myReservations(myReservations)
				.build();
	}
	
	
}
