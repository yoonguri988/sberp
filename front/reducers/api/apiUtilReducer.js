// reducers/api/apiUtilReducer.js
import { createSlice } from "@reduxjs/toolkit";

// =========================================================
//  - POST /bizno/verify : 사업자등록번호 진위확인 (verify)
//  - POST /ocr           : 명함/사업자등록증 OCR (processOcr)
// =========================================================

const initialState = {
  // 사업자등록번호 진위확인 결과 (국세청 API 원본 응답)
  bizNoVerifyResult: null,

  // OCR 추출 결과 (OcrResponse)
  ocrResult: null,

  // 공통 상태
  loading: false,
  error: null,
  success: false,
  message: null,
};

const apiUtilReducer = createSlice({
  name: "apiUtil",
  initialState,
  reducers: {
    // ---------------------------------------------------
    // 1) 사업자등록번호 진위확인 POST /api/util/bizno/verify
    // payload: BizNoVerifyRequest { bizNo, startDt, ceoName }
    // ---------------------------------------------------
    verifyBizNoRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.bizNoVerifyResult = null;
    },
    verifyBizNoSuccess(state, action) {
      // action.payload: 국세청 API 원본 응답 (성공/실패 여부는 그 안의 필드로 판단)
      state.loading = false;
      state.success = true;
      state.bizNoVerifyResult = action.payload;
    },
    verifyBizNoFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 2) 명함/사업자등록증 OCR POST /api/util/ocr (multipart/form-data)
    // payload: file (File)
    // ---------------------------------------------------
    processOcrRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.ocrResult = null;
    },
    processOcrSuccess(state, action) {
      // action.payload: { status: "success", data: OcrResponse }
      state.loading = false;
      state.success = true;
      state.ocrResult = action.payload?.data ?? null;
    },
    processOcrFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 공통: 상태 초기화
    // ---------------------------------------------------
    resetApiUtilState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
});

export const {
  verifyBizNoRequest,
  verifyBizNoSuccess,
  verifyBizNoFailure,

  processOcrRequest,
  processOcrSuccess,
  processOcrFailure,

  resetApiUtilState,
} = apiUtilReducer.actions;

export default apiUtilReducer.reducer;