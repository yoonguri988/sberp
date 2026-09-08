package com.sb.erp.dashboard.admin.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.service.ApprDocService;
import com.sb.erp.att.entity.Attendance;
import com.sb.erp.att.entity.LeaveBalance;
import com.sb.erp.att.repository.AttendanceRepository;
import com.sb.erp.att.repository.LeaveBalanceRepository;
import com.sb.erp.dashboard.admin.dto.AdminDashboardSummaryResponse;
import com.sb.erp.dashboard.admin.dto.AdminDashboardSummaryResponse.DailyAttStatDto;
import com.sb.erp.dashboard.admin.dto.AdminDashboardSummaryResponse.TodayAttDto;
import com.sb.erp.dashboard.admin.repository.AdminDashboardMapper;
import com.sb.erp.emp.repository.EmpRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final AttendanceRepository attendanceRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmpRepository empRepository;
    private final ApprDocService apprDocService;
    private final AdminDashboardMapper adminDashboardMapper;

    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("HH:mm");

    public AdminDashboardSummaryResponse getSummary(Long empId, Long comId) {

        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();

        // 0) 사원 프로필 — JOIN 프로젝션으로 필요한 필드만 조회
        // Employee → Company 로딩 시 @Lob comLogo 컬럼이 Oracle VARCHAR2와 충돌하므로
        // findById() 대신 JPQL 프로젝션을 사용하여 Company 엔티티 로딩을 회피
        String empName = "";
        String deptName = "";
        String posName = "";
        
        List<Object[]> profile = empRepository.findEmpProfileById(empId);
        
        if (!profile.isEmpty()) {
            Object[] row = profile.get(0);
            empName  = (String) row[0];
            deptName = (String) row[1];
            posName  = (String) row[2];
        }

        // 1) 내 오늘 근태
        TodayAttDto todayAtt = buildTodayAtt(empId, today);

        // 2) 내 연차 잔여
        BigDecimal leaveTotalDays = BigDecimal.ZERO;
        BigDecimal leaveUsedDays = BigDecimal.ZERO;
        BigDecimal leaveRemainingDays = BigDecimal.ZERO;

        Optional<LeaveBalance> myBalance =
        		leaveBalanceRepository.findByEmployee_EmpIdAndYear(empId, currentYear);
        if (myBalance.isPresent()) {
            LeaveBalance lb = myBalance.get();
            leaveTotalDays = lb.getTotalDays();
            leaveUsedDays = lb.getUsedDays();
            leaveRemainingDays = lb.getRemainingDays();
        }

        // 3) 전사 오늘 출퇴근 통계
        List<Long> activeEmpIds = empRepository.findActiveEmpIdsByComId(comId);
        int totalEmployees = activeEmpIds.size();

        Map<String, Integer> todayStats = countAttStatusByDate(activeEmpIds, today);
        int presentCount = todayStats.getOrDefault("NORMAL", 0);
        int lateCount = todayStats.getOrDefault("LATE", 0);
        int leaveCount = todayStats.getOrDefault("LEAVE", 0);
        int earlyLeaveCount = todayStats.getOrDefault("EARLY_LEAVE", 0);
        int recordedCount = presentCount + lateCount + earlyLeaveCount + leaveCount;
        int absentCount = Math.max(0, totalEmployees - recordedCount);

		// 4) 주간 통계
		List<DailyAttStatDto> weeklyStats = buildWeeklyStats(activeEmpIds, today, totalEmployees);

		// 5) 결재 관련 카운트
		// ApprDocService.selectDocCnt() 는 아래 키를 담은 Map 반환:
		// - MYCNT : 내가 결재해야 할 대기 건수 (남이 기안, 내가 승인 대기)
		// - MYDRAFTINGCNT : 내가 기안했고 아직 진행 중인 문서 수 (내 문서, 상대 처리 대기)
		// - TOTALCNT/APPCNT/REJCNT/INGCNT : 참고 통계
		Map<String, Object> apprCnts = apprDocService.selectDocCnt(empId);
		int pendingApprovalCount = toInt(apprCnts.get("MYCNT")); // 결재 대기
		int myDraftingCount = toInt(apprCnts.get("MYDRAFTINGCNT")); // 내 기안 진행 중
		
		// 6) 프로젝트 — 회사 전체 / 내가 참여중인 프로젝트를 각각 5개씩 조회
        // 마감 임박순, 진행 중(TODO/DOING)만
        final int PROJECT_LIMIT = 5;
        List<Map<String, Object>> companyProjects =
                adminDashboardMapper.selectCompanyOngoingProjects(comId, PROJECT_LIMIT);
        
        List<Map<String, Object>> myProjects =
                adminDashboardMapper.selectMyOngoingProjects(empId, comId, PROJECT_LIMIT);

		return AdminDashboardSummaryResponse.builder()
				.empName(empName)
                .deptName(deptName)
                .posName(posName)
                .todayAtt(todayAtt)
                .leaveTotalDays(leaveTotalDays)
                .leaveUsedDays(leaveUsedDays)
                .leaveRemainingDays(leaveRemainingDays)
                .totalEmployees(totalEmployees)
                .presentCount(presentCount)
                .lateCount(lateCount)
                .absentCount(absentCount)
                .leaveCount(leaveCount)
                .weeklyStats(weeklyStats)
                .pendingApprovalCount(pendingApprovalCount)
                .myDraftingCount(myDraftingCount)
                .companyProjects(companyProjects)
                .myProjects(myProjects)
                .build();
	}
    
    // MyBatis 가 count(...) 결과를 Oracle에서 BigDecimal 또는 Long 으로 반환할 수 있으므로 int로 변환
    private int toInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).intValue();
        return Integer.parseInt(value.toString());
    }
    
    private TodayAttDto buildTodayAtt(Long empId, LocalDate today) {
        return attendanceRepository.findByEmployee_EmpIdAndAttDate(empId, today)
                .map(att -> TodayAttDto.builder()
                        .attId(att.getAttId())
                        .checkIn(att.getCheckIn() != null
                                ? att.getCheckIn().format(TIME_FMT) : null)
                        .checkOut(att.getCheckOut() != null
                                ? att.getCheckOut().format(TIME_FMT) : null)
                        .attStatus(att.getAttStatus())
                        .build())
                .orElse(null);
    }
    
    
    private Map<String, Integer> countAttStatusByDate(
            List<Long> activeEmpIds, LocalDate date) {

        List<Attendance> records = attendanceRepository.findByAttDateAndEmployee_EmpIdIn(date, activeEmpIds);

        Map<String, Integer> result = new HashMap<>();
        for (Attendance a : records) {
            String status = a.getAttStatus();
            if ("ANNUAL".equals(status) || "AM_HALF".equals(status) || "PM_HALF".equals(status)) {
                status = "LEAVE";
            }
            result.merge(status, 1, Integer::sum);
        }
        return result;
    }
    
    // 최근 5일의 근태 현황을 불러오는 과정에서 주말 제외하기
    private List<DailyAttStatDto> buildWeeklyStats(
            List<Long> activeEmpIds, LocalDate today, int totalEmployees) {

        List<DailyAttStatDto> stats = new ArrayList<>();
        LocalDate cursor = today;
        int count = 0;

        while (count < 5) {
            if (cursor.getDayOfWeek() != DayOfWeek.SATURDAY
                    && cursor.getDayOfWeek() != DayOfWeek.SUNDAY) {

                Map<String, Integer> dayStat = countAttStatusByDate(activeEmpIds, cursor);
                int present = dayStat.getOrDefault("NORMAL", 0)
                        + dayStat.getOrDefault("EARLY_LEAVE", 0);
                int late = dayStat.getOrDefault("LATE", 0);
                int leave = dayStat.getOrDefault("LEAVE", 0);
                int absent = Math.max(0, totalEmployees - present - late - leave);

                stats.add(DailyAttStatDto.builder()
                        .date(cursor.toString())
                        .present(present)
                        .late(late)
                        .absent(absent)
                        .leave(leave)
                        .build());
                count++;
            }
            cursor = cursor.minusDays(1);
        }
        // 역순으로 집계한 일자를 다시 정렬함
        Collections.reverse(stats);
        return stats;
    }
}