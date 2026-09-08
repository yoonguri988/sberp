// reducers/dashboard/adminDashboardReducer.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {

  // A 영역: 사원 프로필
  empName: "",
  deptName: "",
  posName: "",

  // A 영역: 오늘 내 근태
  todayAtt: null,
  leaveTotalDays: 0,
  leaveUsedDays: 0,
  leaveRemainingDays: 0,

  // B 영역: 전사 출퇴근 통계
  totalEmployees: 0,
  presentCount: 0,
  lateCount: 0,
  absentCount: 0,
  leaveCount: 0,

  // C 영역: 주간 근태 추이
  weeklyStats: [],

  // D 영역: 결재 대기 건수
  pendingApprovalCount: 0,
  myDraftingCount: 0,

  // E 영역: 최근 공지사항 (별도 API 호출)
  recentNotices: [],
  noticesLoading: false,

  // F 영역: 프로젝트
  companyProjects: [],
  myProjects: [],

  // 공통
  loading: false,
  error: null,
};

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {

    // 상태 리셋(새 상태)
    resetAdminDashboard: () => initialState,

    // 대시보드 정보 불러오기
    adminDashboardRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    adminDashboardSuccess: (state, action) => {
      state.loading = false;
      const p = action.payload;

      state.empName            = p.empName || "";
      state.deptName           = p.deptName || "";
      state.posName            = p.posName || "";
      state.todayAtt           = p.todayAtt;
      state.leaveTotalDays     = p.leaveTotalDays;
      state.leaveUsedDays      = p.leaveUsedDays;
      state.leaveRemainingDays = p.leaveRemainingDays;

      state.totalEmployees = p.totalEmployees;
      state.presentCount   = p.presentCount;
      state.lateCount      = p.lateCount;
      state.absentCount    = p.absentCount;
      state.leaveCount     = p.leaveCount;

      state.weeklyStats = p.weeklyStats || [];

      state.pendingApprovalCount = p.pendingApprovalCount;
      state.myDraftingCount      = p.myDraftingCount;

      state.companyProjects = p.companyProjects || [];
      state.myProjects      = p.myProjects || [];
    },

    adminDashboardFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // 금일 본인의 근태 현황(출퇴근) 업데이트
    updateAdminTodayAtt: (state, action) => {
      state.todayAtt = action.payload;
    },

    // ── 최근 공지사항 조회 ──
    // /api/notice 를 별도로 호출하여 대시보드 위젯에만 표시
    // (notice 도메인 state와 완전히 분리하여 다른 페이지 영향 없음)
    adminRecentNoticesRequest: (state) => {
      state.noticesLoading = true;
    },
    adminRecentNoticesSuccess: (state, action) => {
      state.noticesLoading = false;
      // action.payload = NoticeResponse[] (배열)
      state.recentNotices = action.payload || [];
    },
    adminRecentNoticesFailure: (state) => {
      state.noticesLoading = false;
      state.recentNotices = [];
    },
  },
});

export const {
  resetAdminDashboard,
  adminDashboardRequest, adminDashboardSuccess, adminDashboardFailure,
  updateAdminTodayAtt,
  adminRecentNoticesRequest, adminRecentNoticesSuccess, adminRecentNoticesFailure,
} = adminDashboardSlice.actions;

export default adminDashboardSlice.reducer;