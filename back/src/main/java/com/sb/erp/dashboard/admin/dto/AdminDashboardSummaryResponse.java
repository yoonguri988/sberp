package com.sb.erp.dashboard.admin.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Getter;

@Getter @Builder
public class AdminDashboardSummaryResponse {

    // A 영역 — 사원 프로필 (JWT에 없는 deptName 등 보충)
    private String empName;
    private String deptName;
    private String posName;

    // A 영역 — 오늘 내 근태
    private TodayAttDto todayAtt;

    // A 영역 — 내 연차 잔여
    private BigDecimal leaveTotalDays;
    private BigDecimal leaveUsedDays;
    private BigDecimal leaveRemainingDays;

    // B 영역 — 전사 출퇴근 통계
    private int totalEmployees;	// 총 사원수
    private int presentCount;	// 정상 출근
    private int lateCount;		// 지각
    private int absentCount;	// 결근
    private int leaveCount;		// 휴가

    // C 영역 — 주간 근태 추이
    private List<DailyAttStatDto> weeklyStats;

    // D 영역 — 결재 관련 카운트
    private int pendingApprovalCount;   // 내가 결재해야 할 대기 건수
    private int myDraftingCount;         // 내가 기안한 진행 중 문서 수
    
    // F 영역 — 프로젝트
    // 각 항목은 Map (proId, proName, proStatus, endDate, empName) 형태
    // 회사 전체 진행 중 프로젝트 (마감 임박순)
    private List<Map<String, Object>> companyProjects;
    // 내가 참여한 진행 중 프로젝트
    private List<Map<String, Object>> myProjects;

    @Getter @Builder
    public static class TodayAttDto {
        private Long attId;
        private String checkIn;
        private String checkOut;
        private String attStatus;
    }

    @Getter @Builder
    public static class DailyAttStatDto {
        private String date;
        private int present;
        private int late;
        private int absent;
        private int leave;
    }
}