// reducers/emp/hrAiDocReducer.js
// HR 규정 문서(근태·연차·복리후생 규정집 PDF) 관리 — GET/POST /api/hrai/docs
// ROLE_ADMIN 전용. salAiDocReducer(급여 규정 문서)와 동일한 목록조회+등록 패턴.
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 문서 목록 (개정 이력 포함, 최신 버전이 먼저)
  docList: [],
  listLoading: false,
  listError: null,

  // 업로드 (= 개정 등록)
  uploadLoading: false,
  uploadSuccess: false, // true가 되면 페이지에서 성공 메시지 + 목록 재조회
  uploadError: null,
};

const hrAiDocReducer = createSlice({
  name: "hrAiDoc", // state.hrAiDoc 으로 접근
  initialState,
  reducers: {
    // 업로드 성공/실패 플래그 초기화 — 모달 닫은 뒤, 또는 재시도 전에 호출
    resetHrAiDocState: (state) => {
      state.uploadLoading = false;
      state.uploadSuccess = false;
      state.uploadError = null;
    },

    // ─── 문서 목록 조회 ───
    listHrAiDocRequest: (state) => {
      state.listLoading = true;
      state.listError = null;
    },
    listHrAiDocSuccess: (state, action) => {
      state.listLoading = false;
      // 백엔드 List<HrPlcyDocResponse> → 배열 그대로 저장
      state.docList = action.payload || [];
    },
    listHrAiDocFailure: (state, action) => {
      state.listLoading = false;
      state.listError = action.payload;
    },

    // ─── 문서 업로드(개정) ───
    uploadHrAiDocRequest: (state) => {
      state.uploadLoading = true;
      state.uploadSuccess = false;
      state.uploadError = null;
    },
    uploadHrAiDocSuccess: (state) => {
      state.uploadLoading = false;
      state.uploadSuccess = true;
    },
    uploadHrAiDocFailure: (state, action) => {
      state.uploadLoading = false;
      state.uploadError = action.payload;
    },
  },
});

export const {
  resetHrAiDocState,
  listHrAiDocRequest,
  listHrAiDocSuccess,
  listHrAiDocFailure,
  uploadHrAiDocRequest,
  uploadHrAiDocSuccess,
  uploadHrAiDocFailure,
} = hrAiDocReducer.actions;

export default hrAiDocReducer.reducer;
