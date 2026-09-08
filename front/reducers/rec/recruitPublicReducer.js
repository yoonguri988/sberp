// reducers/rec/recruitPublicReducer.js
// 채용 공개 사이트(/careers/**)의 공고 목록/상세 상태 - GET /api/public/recruit[, /{recId}]
// 백엔드 SecurityConfig상 이 엔드포인트들도 인증(지원자 소셜 로그인)이 필요하므로
// api/apctAxios.js(지원자 전용 axios)를 사용한다.
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  paging: null,
  listLoading: false,
  listError: null,

  detail: null,
  detailLoading: false,
  detailError: null,
};

const recruitPublicReducer = createSlice({
  name: "recruitPublic",
  initialState,
  reducers: {
    resetRecruitPublicState: (state) => {
      state.listError = null;
      state.detailError = null;
    },

    fetchPublicRecruitListRequest: (state) => {
      state.listLoading = true;
      state.listError = null;
    },
    fetchPublicRecruitListSuccess: (state, action) => {
      state.listLoading = false;
      state.list = action.payload.list || [];
      state.paging = action.payload.paging || null;
    },
    fetchPublicRecruitListFailure: (state, action) => {
      state.listLoading = false;
      state.listError = action.payload;
    },

    fetchPublicRecruitDetailRequest: (state) => {
      state.detailLoading = true;
      state.detailError = null;
      state.detail = null;
    },
    fetchPublicRecruitDetailSuccess: (state, action) => {
      state.detailLoading = false;
      state.detail = action.payload;
    },
    fetchPublicRecruitDetailFailure: (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload;
    },
  },
});

export const {
  resetRecruitPublicState,
  fetchPublicRecruitListRequest,
  fetchPublicRecruitListSuccess,
  fetchPublicRecruitListFailure,
  fetchPublicRecruitDetailRequest,
  fetchPublicRecruitDetailSuccess,
  fetchPublicRecruitDetailFailure,
} = recruitPublicReducer.actions;

export default recruitPublicReducer.reducer;
