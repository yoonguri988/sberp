// reducers/apct/applicantReducer.js
// 지원자 관리자 화면 상태 - GET /api/admin/applicant, /{apctId}, /dashboard, /rank, PUT /{apctId}/status
// 목록/순위는 Spring Data Page 형태로 온다: { content, totalElements, totalPages, number, size }
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 목록
  list: [],
  paging: null,
  listLoading: false,
  listError: null,

  // 상세
  detail: null,
  detailLoading: false,
  detailError: null,

  // 대시보드(상태별 집계)
  dashboard: [],
  dashboardLoading: false,
  dashboardError: null,

  // fit_score 순위
  rankList: [],
  rankPaging: null,
  rankLoading: false,
  rankError: null,

  // 칸반보드 (공고별 전체 지원자, 페이징 없음)
  kanbanList: [],
  kanbanLoading: false,
  kanbanError: null,

  // 상태 변경
  statusLoading: false,
  statusError: null,
  statusSuccess: false,
};

const applicantReducer = createSlice({
  name: "applicant",
  initialState,
  reducers: {
    resetApplicantState: (state) => {
      state.statusLoading = false;
      state.statusError = null;
      state.statusSuccess = false;
    },

    // --- 목록 조회 ---
    fetchApplicantAdminListRequest: (state) => {
      state.listLoading = true;
      state.listError = null;
    },
    fetchApplicantAdminListSuccess: (state, action) => {
      state.listLoading = false;
      state.list = action.payload.content || [];
      state.paging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    fetchApplicantAdminListFailure: (state, action) => {
      state.listLoading = false;
      state.listError = action.payload;
    },

    // --- 상세 조회 ---
    fetchApplicantDetailRequest: (state) => {
      state.detailLoading = true;
      state.detailError = null;
    },
    fetchApplicantDetailSuccess: (state, action) => {
      state.detailLoading = false;
      state.detail = action.payload;
    },
    fetchApplicantDetailFailure: (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload;
      state.detail = null;
    },

    // --- 대시보드(상태별 집계) ---
    fetchApplicantDashboardRequest: (state) => {
      state.dashboardLoading = true;
      state.dashboardError = null;
    },
    fetchApplicantDashboardSuccess: (state, action) => {
      state.dashboardLoading = false;
      state.dashboard = action.payload || [];
    },
    fetchApplicantDashboardFailure: (state, action) => {
      state.dashboardLoading = false;
      state.dashboardError = action.payload;
    },

    // --- fit_score 순위 ---
    fetchApplicantRankRequest: (state) => {
      state.rankLoading = true;
      state.rankError = null;
    },
    fetchApplicantRankSuccess: (state, action) => {
      state.rankLoading = false;
      state.rankList = action.payload.content || [];
      state.rankPaging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    fetchApplicantRankFailure: (state, action) => {
      state.rankLoading = false;
      state.rankError = action.payload;
    },

    // --- 칸반보드 ---
    fetchApplicantKanbanRequest: (state) => {
      state.kanbanLoading = true;
      state.kanbanError = null;
    },
    fetchApplicantKanbanSuccess: (state, action) => {
      state.kanbanLoading = false;
      state.kanbanList = action.payload || [];
    },
    fetchApplicantKanbanFailure: (state, action) => {
      state.kanbanLoading = false;
      state.kanbanError = action.payload;
    },

    // --- 상태 변경 ---
    updateApplicantStatusRequest: (state) => {
      state.statusLoading = true;
      state.statusError = null;
      state.statusSuccess = false;
    },
    updateApplicantStatusSuccess: (state, action) => {
      state.statusLoading = false;
      state.statusSuccess = true;
      const { apctId, status } = action.payload;
      state.list = state.list.map((a) =>
        a.apctId === apctId ? { ...a, apctStatus: status } : a,
      );
      state.kanbanList = state.kanbanList.map((a) =>
        a.apctId === apctId ? { ...a, apctStatus: status } : a,
      );
      if (state.detail && state.detail.apctId === apctId) {
        state.detail = { ...state.detail, apctStatus: status };
      }
    },
    updateApplicantStatusFailure: (state, action) => {
      state.statusLoading = false;
      state.statusError = action.payload;
      state.statusSuccess = false;
    },
  },
});

export const {
  resetApplicantState,
  fetchApplicantAdminListRequest,
  fetchApplicantAdminListSuccess,
  fetchApplicantAdminListFailure,
  fetchApplicantDetailRequest,
  fetchApplicantDetailSuccess,
  fetchApplicantDetailFailure,
  fetchApplicantDashboardRequest,
  fetchApplicantDashboardSuccess,
  fetchApplicantDashboardFailure,
  fetchApplicantRankRequest,
  fetchApplicantRankSuccess,
  fetchApplicantRankFailure,
  fetchApplicantKanbanRequest,
  fetchApplicantKanbanSuccess,
  fetchApplicantKanbanFailure,
  updateApplicantStatusRequest,
  updateApplicantStatusSuccess,
  updateApplicantStatusFailure,
} = applicantReducer.actions;

export default applicantReducer.reducer;