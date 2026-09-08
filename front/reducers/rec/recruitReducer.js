// reducers/rec/recruitReducer.js
// 채용공고(Recruit) 관리자 화면 상태 - GET/POST/PUT/DELETE /api/admin/recruit
// 목록 응답은 salStd류(Page)와 달리 프로젝트 공용 PagingUtil 형태다:
//   { listtotal, onepagelist, pagetotal, bottomlist, pstartno, current, start, end }
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 관리자 목록
  list: [],
  paging: null,
  listLoading: false,
  listError: null,

  // 상세
  detail: null,
  detailLoading: false,
  detailError: null,

  // 등록/수정/삭제 공통
  loading: false,
  error: null,
  success: false,

  // 복제
  cloneLoading: false,
  cloneData: null,
};

const recruitReducer = createSlice({
  name: "recruit",
  initialState,
  reducers: {
    resetRecruitState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.cloneData = null;
    },

    // --- 관리자 목록 조회 ---
    fetchRecruitAdminListRequest: (state) => {
      state.listLoading = true;
      state.listError = null;
    },
    fetchRecruitAdminListSuccess: (state, action) => {
      state.listLoading = false;
      state.list = action.payload.list || [];
      state.paging = action.payload.paging || null;
    },
    fetchRecruitAdminListFailure: (state, action) => {
      state.listLoading = false;
      state.listError = action.payload;
    },

    // --- 관리자 상세 조회 ---
    fetchRecruitDetailRequest: (state) => {
      state.detailLoading = true;
      state.detailError = null;
    },
    fetchRecruitDetailSuccess: (state, action) => {
      state.detailLoading = false;
      state.detail = action.payload;
    },
    fetchRecruitDetailFailure: (state, action) => {
      state.detailLoading = false;
      state.detailError = action.payload;
      state.detail = null;
    },

    // --- 등록 ---
    createRecruitRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    createRecruitSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      // 응답에 등록된 상세(recruit)가 함께 오므로 목록 맨 앞에 즉시 반영
      if (action.payload?.recruit) {
        state.list = [action.payload.recruit, ...state.list];
      }
    },
    createRecruitFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    // --- 수정 ---
    // 백엔드 PUT /api/admin/recruit/{recId} 는 빈 본문을 반환하므로,
    // 목록/상세 갱신은 saga가 성공 직후 상세를 재조회해 채워 넣는다.
    updateRecruitRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateRecruitSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      const updated = action.payload;
      if (updated) {
        state.detail = updated;
        state.list = state.list.map((r) =>
          r.recId === updated.recId ? updated : r,
        );
      }
    },
    updateRecruitFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    // --- 삭제 ---
    deleteRecruitRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    deleteRecruitSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.list = state.list.filter((r) => r.recId !== action.payload);
    },
    deleteRecruitFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },

    // 채용공고 복제
    fetchCloneRecruitRequest: (state, action) => {
      state.cloneLoading = true;
    },
    fetchCloneRecruitSuccess: (state, action) => {
      state.cloneLoading = false;
      state.cloneData = action.payload;
    },
    fetchCloneRecruitFailure: (state, action) => {
      state.cloneLoading = false;
    },
  },
});

export const {
  resetRecruitState,
  fetchRecruitAdminListRequest,
  fetchRecruitAdminListSuccess,
  fetchRecruitAdminListFailure,
  fetchRecruitDetailRequest,
  fetchRecruitDetailSuccess,
  fetchRecruitDetailFailure,
  createRecruitRequest,
  createRecruitSuccess,
  createRecruitFailure,
  updateRecruitRequest,
  updateRecruitSuccess,
  updateRecruitFailure,
  deleteRecruitRequest,
  deleteRecruitSuccess,
  deleteRecruitFailure,
  fetchCloneRecruitRequest,
  fetchCloneRecruitSuccess,
  fetchCloneRecruitFailure,
} = recruitReducer.actions;

export default recruitReducer.reducer;
