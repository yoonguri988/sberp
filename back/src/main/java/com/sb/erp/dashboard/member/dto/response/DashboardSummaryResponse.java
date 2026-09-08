package com.sb.erp.dashboard.member.dto.response;

import java.util.List;
import java.util.Map;

import com.sb.erp.appr.dto.response.ApprDocSummaryResponse;
import com.sb.erp.att.dto.response.AttendanceResponse;
import com.sb.erp.att.dto.response.LeaveBalanceResponse;
import com.sb.erp.notice.dto.response.NoticeResponse;
import com.sb.erp.resv.dto.response.ResvResponse;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardSummaryResponse {
	// 결재
	private int todoDocCnt;
	private List<ApprDocSummaryResponse> todoDocs;
	
	// 연차
	private LeaveBalanceResponse leaveBalance; // 올해분, 없으면 null
	
	// 근태
	private AttendanceResponse todayAttendance;
	
	// 인사평가
	private boolean evalOpen;
	private Map<String, Object> evalProgress;
	
	// 공지
	private List<NoticeResponse> recentNotices;
	
	// 프로젝트
	private List<DashboardProjResponse> myProjects;
	
	// 자원예약
	private List<ResvResponse> myReservations;
}
