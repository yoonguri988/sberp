// reducers/sal/salPayReducer.js
// 급여지급(SalPay) 관리 - /api/salpay 전체 CRUD + 상태변경 + 항목조정 + 본인조회 + 항목코드
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 급여지급 목록 (관리자, 페이지네이션)
  payList: [],
  paging: null, // { totalElements, totalPages, number, size }

  // 상세(등록/재산정/조정/상태변경 결과 - 드로어에 표시)
  current: null,

  // 본인 급여명세서
  myPayments: [],
  myPaging: null,
  myLoading: false,
  myError: null,

  // 수당/공제 항목 코드 카탈로그
  itemCodes: [],
  itemCodesLoading: false,

  // 공통
  loading: false,
  error: null,
  success: false,
};

const salPayReducer = createSlice({
  name: "salPay",
  initialState,
  reducers: {
    // --- 상태 초기화 ---
    resetSalPayState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
    clearCurrentSalPay: (state) => {
      state.current = null;
    },

    // --- 급여지급 목록 조회 (관리자) ---
    listSalPayRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    listSalPaySuccess: (state, action) => {
      state.loading = false;
      state.payList = action.payload.content || [];
      state.paging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    listSalPayFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 본인 급여명세서 조회 ---
    fetchMyPaymentsRequest: (state) => {
      state.myLoading = true;
      state.myError = null;
    },
    fetchMyPaymentsSuccess: (state, action) => {
      state.myLoading = false;
      state.myPayments = action.payload.content || [];
      state.myPaging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    fetchMyPaymentsFailure: (state, action) => {
      state.myLoading = false;
      state.myError = action.payload;
    },

    // --- 수당/공제 항목 코드 조회 ---
    fetchItemCodesRequest: (state) => {
      state.itemCodesLoading = true;
    },
    fetchItemCodesSuccess: (state, action) => {
      state.itemCodesLoading = false;
      state.itemCodes = action.payload;
    },
    fetchItemCodesFailure: (state) => {
      state.itemCodesLoading = false;
    },

    // --- 급여 등록(산정) ---
    createSalPayRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    createSalPaySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.current = action.payload;
    },
    createSalPayFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 급여 재산정 ---
    recalcSalPayRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    recalcSalPaySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.current = action.payload;
    },
    recalcSalPayFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 급여 산정 결과 개별 항목 수동 조정 ---
    adjustSalPayItemRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    adjustSalPayItemSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.current = action.payload;
    },
    adjustSalPayItemFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 급여 지급 상태 변경 ---
    changeSalPayStatusRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    changeSalPayStatusSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.current = action.payload;
    },
    changeSalPayStatusFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 급여 삭제(취소) ---
    deleteSalPayRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    deleteSalPaySuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.payList = state.payList.filter((p) => p.payId !== action.payload);
    },
    deleteSalPayFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  resetSalPayState,
  clearCurrentSalPay,
  listSalPayRequest,
  listSalPaySuccess,
  listSalPayFailure,
  fetchMyPaymentsRequest,
  fetchMyPaymentsSuccess,
  fetchMyPaymentsFailure,
  fetchItemCodesRequest,
  fetchItemCodesSuccess,
  fetchItemCodesFailure,
  createSalPayRequest,
  createSalPaySuccess,
  createSalPayFailure,
  recalcSalPayRequest,
  recalcSalPaySuccess,
  recalcSalPayFailure,
  adjustSalPayItemRequest,
  adjustSalPayItemSuccess,
  adjustSalPayItemFailure,
  changeSalPayStatusRequest,
  changeSalPayStatusSuccess,
  changeSalPayStatusFailure,
  deleteSalPayRequest,
  deleteSalPaySuccess,
  deleteSalPayFailure,
} = salPayReducer.actions;

export default salPayReducer.reducer;
