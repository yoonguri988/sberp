// reducers/rsm/resumeReducer.js
// 관리자용 이력서 조회/RAG 검색 - GET /api/resume/applicants/{apctId}?recId=, GET /api/resume/search
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 지원자 상세 화면에 붙는 이력서 정보
  adminResume: null,
  adminResumeLoading: false,
  adminResumeError: null,

  // RAG(의미기반) 검색 결과
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchDone: false, // 검색을 한 번이라도 실행했는지(빈 배열과 "아직 검색 안 함" 구분용)
};

const resumeReducer = createSlice({
  name: "resume",
  initialState,
  reducers: {
    resetResumeState: (state) => {
      state.adminResumeError = null;
    },
    resetResumeSearch: (state) => {
      state.searchResults = [];
      state.searchError = null;
      state.searchDone = false;
    },

    // --- 지원자 이력서 상세(관리자) ---
    fetchAdminResumeRequest: (state) => {
      state.adminResumeLoading = true;
      state.adminResumeError = null;
    },
    fetchAdminResumeSuccess: (state, action) => {
      state.adminResumeLoading = false;
      state.adminResume = action.payload;
    },
    fetchAdminResumeFailure: (state, action) => {
      state.adminResumeLoading = false;
      state.adminResume = null;
      // 이력서 미제출(404)은 에러로 취급하지 않고 "없음" 상태로만 처리
      state.adminResumeError = action.payload?.silent ? null : action.payload?.message;
    },

    // --- 이력서 RAG 검색 ---
    searchResumeRequest: (state) => {
      state.searchLoading = true;
      state.searchError = null;
    },
    searchResumeSuccess: (state, action) => {
      state.searchLoading = false;
      state.searchResults = action.payload || [];
      state.searchDone = true;
    },
    searchResumeFailure: (state, action) => {
      state.searchLoading = false;
      state.searchError = action.payload;
      state.searchDone = true;
    },
  },
});

export const {
  resetResumeState,
  resetResumeSearch,
  fetchAdminResumeRequest,
  fetchAdminResumeSuccess,
  fetchAdminResumeFailure,
  searchResumeRequest,
  searchResumeSuccess,
  searchResumeFailure,
} = resumeReducer.actions;

export default resumeReducer.reducer;
