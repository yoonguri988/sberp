// reducers/resv/adminResvReducer.js
import { createSlice } from "@reduxjs/toolkit";

// =========================================================
//  - GET /            : 예약 관리 목록 조회 (list)
//  - GET /count        : 예약 관리 전체 개수 조회 (count)
//  - GET /stats         : 예약 통계 조회 (stats)
//  - PUT /{revId}/approve : 예약 승인 (approve)
//  - PUT /{revId}/reject  : 예약 반려 (reject)
// =========================================================

const STATUS_APPROVED = "APP";
const STATUS_REJECTED = "REJ";

const initialState = {
  // 예약 관리 목록 조회 (list)
  list: [],           // ResvResponse[]
  listCount: 0,        // 전체 개수 (페이징 계산용)

  // 예약 통계 조회 (stats)
  stats: null,         // StatsResvResponse { total, approved, waiting, rejected }

  // 공통 상태
  loading: false,
  error: null,
  success: false,
  message: null,
};

const adminResvReducer = createSlice({
  name: "adminResv",
  initialState,
  reducers: {
    // ---------------------------------------------------
    // 1) 예약 관리 목록 조회 GET /api/resv/admin
    // payload: ResvSearchRequest
    // ---------------------------------------------------
    fetchAdminResvListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAdminResvListSuccess(state, action) {
      // action.payload: ResvResponse[]
      state.loading = false;
      state.list = action.payload ?? [];
    },
    fetchAdminResvListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 2) 예약 관리 전체 개수 조회 GET /api/resv/admin/count
    // payload: ResvSearchRequest
    // ---------------------------------------------------
    fetchAdminResvCountRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAdminResvCountSuccess(state, action) {
      // action.payload: number
      state.loading = false;
      state.listCount = action.payload ?? 0;
    },
    fetchAdminResvCountFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 3) 예약 통계 조회 GET /api/resv/admin/stats
    // payload: ResvSearchRequest
    // ---------------------------------------------------
    fetchAdminResvStatsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAdminResvStatsSuccess(state, action) {
      // action.payload: StatsResvResponse
      state.loading = false;
      state.stats = action.payload;
    },
    fetchAdminResvStatsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 4) 예약 승인 PUT /api/resv/admin/{revId}/approve
    // payload: revId
    // ---------------------------------------------------
    approveResvRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    approveResvSuccess(state, action) {
      // action.payload: { success, message, revId }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "예약이 승인되었습니다.";
      // 목록에서 다시 조회하지 않아도 상태가 바로 반영되도록 in-place 업데이트
      const target = state.list.find((r) => r.revId === action.payload?.revId);
      if (target) {
        target.status = STATUS_APPROVED;
      }
    },
    approveResvFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 5) 예약 반려 PUT /api/resv/admin/{revId}/reject
    // payload: { revId, rejectReason }
    // ---------------------------------------------------
    rejectResvRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    rejectResvSuccess(state, action) {
      // action.payload: { success, message, revId, rejectReason }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "예약이 반려되었습니다.";
      const target = state.list.find((r) => r.revId === action.payload?.revId);
      if (target) {
        target.status = STATUS_REJECTED;
        if (action.payload?.rejectReason !== undefined) {
          target.rejectReason = action.payload.rejectReason;
        }
      }
    },
    rejectResvFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 공통: 상태 초기화
    // ---------------------------------------------------
    resetAdminResvState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
});

export const {
  fetchAdminResvListRequest,
  fetchAdminResvListSuccess,
  fetchAdminResvListFailure,

  fetchAdminResvCountRequest,
  fetchAdminResvCountSuccess,
  fetchAdminResvCountFailure,

  fetchAdminResvStatsRequest,
  fetchAdminResvStatsSuccess,
  fetchAdminResvStatsFailure,

  approveResvRequest,
  approveResvSuccess,
  approveResvFailure,

  rejectResvRequest,
  rejectResvSuccess,
  rejectResvFailure,

  resetAdminResvState,
} = adminResvReducer.actions;

export default adminResvReducer.reducer;