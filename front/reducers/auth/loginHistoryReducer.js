// reducers/auth/loginHistoryReducer.js
// 로그인 이력 관리 - 시스템 관리자 확인 페이지
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  totalElements: 0,
  totalPages: 0,
  stats: null, // { total, successCount, failCount }
  loading: false,
  error: null,
};

const loginHistoryReducer = createSlice({
  name: "loginHistory",
  initialState,
  reducers: {
    fetchLoginHistoryListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchLoginHistoryListSuccess(state, action) {
      state.loading = false;
      state.list = action.payload?.list ?? [];
      state.totalElements = action.payload?.totalElements ?? 0;
      state.totalPages = action.payload?.totalPages ?? 0;
    },
    fetchLoginHistoryListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    fetchLoginHistoryStatsRequest(state) {
      state.error = null;
    },
    fetchLoginHistoryStatsSuccess(state, action) {
      state.stats = action.payload;
    },
    fetchLoginHistoryStatsFailure(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  fetchLoginHistoryListRequest,
  fetchLoginHistoryListSuccess,
  fetchLoginHistoryListFailure,
  fetchLoginHistoryStatsRequest,
  fetchLoginHistoryStatsSuccess,
  fetchLoginHistoryStatsFailure,
} = loginHistoryReducer.actions;

export default loginHistoryReducer.reducer;
