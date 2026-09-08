// reducers/pos/posReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 직급 목록
  posList: [],

  // 상세
  currentPos: null,

  // 코드 중복검사
  codeCheck: null, // true=중복, false=사용가능, null=미검사

  // 공통
  loading: false,
  error: null,
  success: false,
};

const posReducer = createSlice({
  name: "pos",
  initialState,
  reducers: {
    // --- 상태 초기화 ---
    resetPosState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
    clearCodeCheck: (state) => {
      state.codeCheck = null;
    },

    // --- 직급 목록 조회 ---
    listPosRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    listPosSuccess: (state, action) => {
      state.loading = false;
      state.posList = action.payload;
    },
    listPosFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 직급 상세 조회 ---
    detailPosRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    detailPosSuccess: (state, action) => {
      state.loading = false;
      state.currentPos = action.payload;
    },
    detailPosFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 직급 등록 ---
    createPosRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    createPosSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    createPosFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 직급 수정 ---
    updatePosRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updatePosSuccess: (state, action) => {
      state.loading = false;
      state.currentPos = action.payload;
      state.success = true;
    },
    updatePosFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 직급 삭제 ---
    deletePosRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    deletePosSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.posList = state.posList.filter(
        (pos) => pos.posId !== action.payload
      );
    },
    deletePosFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- 코드 중복검사 ---
    checkCodeRequest: () => {},
    checkCodeSuccess: (state, action) => {
      state.codeCheck = action.payload; // true=중복, false=사용가능
    },
  },
});

export const {
  resetPosState,
  clearCodeCheck,
  listPosRequest,
  listPosSuccess,
  listPosFailure,
  detailPosRequest,
  detailPosSuccess,
  detailPosFailure,
  createPosRequest,
  createPosSuccess,
  createPosFailure,
  updatePosRequest,
  updatePosSuccess,
  updatePosFailure,
  deletePosRequest,
  deletePosSuccess,
  deletePosFailure,
  checkCodeRequest,
  checkCodeSuccess,
} = posReducer.actions;

export default posReducer.reducer;
