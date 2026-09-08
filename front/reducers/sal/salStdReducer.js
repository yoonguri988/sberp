// reducers/sal/salStdReducer.js
// 급여기준(SalStd) 관리 - GET/POST/PUT/DELETE /api/salstd, GET /api/salstd/me
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 급여기준 목록 (관리자, 페이지네이션)
  stdList: [],
  paging: null, // { totalElements, totalPages, number, size }

  // 본인 급여기준
  myStd: null,
  myStdLoading: false,
  myStdError: null,

  // 공통
  loading: false,
  error: null,
  success: false,
};

const salStdReducer = createSlice({
  name: "salStd",
  initialState,
  reducers: {
    // --- 상태 초기화 ---
    resetSalStdState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },

    // --- 급여기준 목록 조회 (관리자) ---
    listSalStdRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    listSalStdSuccess: (state, action) => {
      state.loading = false;
      state.stdList = action.payload.content || [];
      state.paging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    listSalStdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 본인 급여기준 조회 ---
    fetchMySalStdRequest: (state) => {
      state.myStdLoading = true;
      state.myStdError = null;
    },
    fetchMySalStdSuccess: (state, action) => {
      state.myStdLoading = false;
      state.myStd = action.payload;
    },
    fetchMySalStdFailure: (state, action) => {
      state.myStdLoading = false;
      state.myStdError = action.payload;
    },

    // --- 급여기준 등록 ---
    createSalStdRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    createSalStdSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    createSalStdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 급여기준 수정 ---
    updateSalStdRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateSalStdSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updateSalStdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 급여기준 삭제 ---
    deleteSalStdRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    deleteSalStdSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.stdList = state.stdList.filter((s) => s.stdId !== action.payload);
    },
    deleteSalStdFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  resetSalStdState,
  listSalStdRequest,
  listSalStdSuccess,
  listSalStdFailure,
  fetchMySalStdRequest,
  fetchMySalStdSuccess,
  fetchMySalStdFailure,
  createSalStdRequest,
  createSalStdSuccess,
  createSalStdFailure,
  updateSalStdRequest,
  updateSalStdSuccess,
  updateSalStdFailure,
  deleteSalStdRequest,
  deleteSalStdSuccess,
  deleteSalStdFailure,
} = salStdReducer.actions;

export default salStdReducer.reducer;
