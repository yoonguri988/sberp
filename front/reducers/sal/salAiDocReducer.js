// reducers/sal/salAiDocReducer.js
// AI 급여 Q&A 근거 문서(급여 규정집/수당기준/연말정산 가이드) 관리 - GET/POST /api/salai/docs
// ROLE_ADMIN 전용. salStdReducer와 동일한 목록조회+등록 패턴.
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 문서 목록(개정 이력 포함, 최신 버전이 먼저)
  docList: [],
  listLoading: false,
  listError: null,

  // 업로드(=개정 등록)
  uploadLoading: false,
  uploadSuccess: false,
  uploadError: null,
};

const salAiDocReducer = createSlice({
  name: "salAiDoc",
  initialState,
  reducers: {
    resetSalAiDocState: (state) => {
      state.uploadLoading = false;
      state.uploadSuccess = false;
      state.uploadError = null;
    },

    // --- 문서 목록 조회 ---
    listSalAiDocRequest: (state) => {
      state.listLoading = true;
      state.listError = null;
    },
    listSalAiDocSuccess: (state, action) => {
      state.listLoading = false;
      state.docList = action.payload || [];
    },
    listSalAiDocFailure: (state, action) => {
      state.listLoading = false;
      state.listError = action.payload;
    },

    // --- 문서 업로드(개정) ---
    uploadSalAiDocRequest: (state) => {
      state.uploadLoading = true;
      state.uploadSuccess = false;
      state.uploadError = null;
    },
    uploadSalAiDocSuccess: (state) => {
      state.uploadLoading = false;
      state.uploadSuccess = true;
    },
    uploadSalAiDocFailure: (state, action) => {
      state.uploadLoading = false;
      state.uploadError = action.payload;
    },
  },
});

export const {
  resetSalAiDocState,
  listSalAiDocRequest,
  listSalAiDocSuccess,
  listSalAiDocFailure,
  uploadSalAiDocRequest,
  uploadSalAiDocSuccess,
  uploadSalAiDocFailure,
} = salAiDocReducer.actions;

export default salAiDocReducer.reducer;
