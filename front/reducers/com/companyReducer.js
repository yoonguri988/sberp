// reducers/com/companyReducer.js
import { createSlice } from "@reduxjs/toolkit";

// =========================================================
//  - POST   /api/com              : 회사 등록 (add)
//  - GET    /api/com/{comId}      : 회사 상세 조회 (detail)
//  - GET    /api/com              : 회사 목록 조회 (list, paging)
//  - PUT    /api/com/{comId}      : 회사 수정 (update)
//  - DELETE /api/com/{comId}      : 회사 삭제 (delete, 비밀번호 확인)
//                                    연관 데이터가 없으면 완전 삭제, 있으면 비활성화(soft delete)
//  - PUT    /api/com/{comId}/restore : 비활성화된 회사 재활성화 (restore)
//  - GET    /api/com/check-bizno  : 사업자번호 중복확인
//  - GET    /api/com/suggest      : 회사명 자동완성
//  - GET    /api/com/stats        : 회사 통계 조회
//  - GET    /api/com/my           : 내 회사 정보 조회
// =========================================================

const initialState = {
  // 목록 조회 (list)
  list: [], // ComResponse[]
  listTotal: 0,
  paging: null, // PagingUtil

  // 상세 조회 (detail / my)
  detail: null, // ComDetailResponse { com, deptStats, deptList }
  myCompany: null, // ComDetailResponse

  // 통계 (stats)
  stats: null, // StatsComResponse

  // 자동완성 (suggest)
  suggestList: [], // ComResponse[]

  // 사업자번호 중복확인 (check-bizno)
  bizNoCheck: {
    checked: false,
    duplicate: false,
  },

  // 공통 상태
  loading: false,
  error: null,
  success: false,
  message: null,
};

const companyReducer = createSlice({
  name: "company",
  initialState,
  reducers: {
    // ---------------------------------------------------
    // 1) 회사 등록 POST /api/com (multipart/form-data)
    // payload: { dto: ComRequest, logoFile: File | null }
    // ---------------------------------------------------
    addCompanyRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    addCompanySuccess(state, action) {
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "회사 등록에 성공하였습니다.";
    },
    addCompanyFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 2) 회사 목록 조회 GET /api/com
    // payload: CompanySearchRequest (keyword, industryGrpCode, pstartno, onepagelist ...)
    // ---------------------------------------------------
    fetchCompanyListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyListSuccess(state, action) {
      // action.payload: ListResponse<ComResponse> { paging, items }
      state.loading = false;
      state.list = action.payload.items ?? [];
      state.paging = action.payload.paging ?? null;
      state.listTotal = action.payload.paging?.listtotal ?? state.list.length;
    },
    fetchCompanyListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 3) 회사 상세 조회 GET /api/com/{comId}
    // payload: comId
    // ---------------------------------------------------
    fetchCompanyDetailRequest(state) {
      state.loading = true;
      state.error = null;
      state.detail = null;
    },
    fetchCompanyDetailSuccess(state, action) {
      // action.payload: ComDetailResponse { com, deptStats, deptList }
      state.loading = false;
      state.detail = action.payload;
    },
    fetchCompanyDetailFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 4) 회사 수정 PUT /api/com/{comId} (multipart/form-data)
    // payload: { comId, dto: ComRequest, logoFile: File | null }
    // ---------------------------------------------------
    updateCompanyRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateCompanySuccess(state, action) {
      state.loading = false;
      state.success = true;
      state.message =
        action.payload?.message ?? "회사 정보 수정에 성공하였습니다.";
    },
    updateCompanyFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 5) 회사 삭제 DELETE /api/com/{comId}
    // payload: { comId, password }  (DeleteCompanyRequest)
    // ---------------------------------------------------
    deleteCompanyRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    deleteCompanySuccess(state, action) {
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "회사가 삭제되었습니다.";
      // 완전 삭제된 경우에만 목록에서 제거하고, 비활성화(softDeleted)된 경우엔
      // 회사가 그대로 남아있으므로 목록의 상태값만 INACTIVE로 갱신한다.
      if (action.payload?.comId) {
        if (action.payload?.softDeleted) {
          state.list = state.list.map((c) =>
            c.comId === action.payload.comId
              ? { ...c, comStatus: "INACTIVE" }
              : c,
          );
        } else {
          state.list = state.list.filter(
            (c) => c.comId !== action.payload.comId,
          );
        }
      }
    },
    deleteCompanyFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 5-1) 회사 재활성화 PUT /api/com/{comId}/restore
    // payload: comId
    // ---------------------------------------------------
    restoreCompanyRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    restoreCompanySuccess(state, action) {
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "회사를 다시 활성화했습니다.";
      if (action.payload?.comId) {
        state.list = state.list.map((c) =>
          c.comId === action.payload.comId
            ? { ...c, comStatus: "ACTIVE" }
            : c,
        );
      }
    },
    restoreCompanyFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 6) 사업자번호 중복확인 GET /api/com/check-bizno
    // payload: bizNo
    // ---------------------------------------------------
    checkBizNoRequest(state) {
      state.loading = true;
      state.error = null;
      state.bizNoCheck = { checked: false, duplicate: false };
    },
    checkBizNoSuccess(state, action) {
      // action.payload: { duplicate: boolean }
      state.loading = false;
      state.bizNoCheck = {
        checked: true,
        duplicate: !!action.payload.duplicate,
      };
    },
    checkBizNoFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 7) 회사명 자동완성 GET /api/com/suggest
    // payload: keyword
    // ---------------------------------------------------
    suggestCompanyRequest(state) {
      state.error = null;
    },
    suggestCompanySuccess(state, action) {
      // action.payload: ComResponse[]
      state.suggestList = action.payload ?? [];
    },
    suggestCompanyFailure(state, action) {
      state.error = action.payload;
    },
    clearSuggestList(state) {
      state.suggestList = [];
    },

    // ---------------------------------------------------
    // 8) 회사 통계 조회 GET /api/com/stats
    // ---------------------------------------------------
    fetchCompanyStatsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCompanyStatsSuccess(state, action) {
      // action.payload: StatsComResponse
      state.loading = false;
      state.stats = action.payload;
    },
    fetchCompanyStatsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 9) 내 회사 정보 조회 GET /api/com/my
    // ---------------------------------------------------
    fetchMyCompanyRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMyCompanySuccess(state, action) {
      // action.payload: ComDetailResponse
      state.loading = false;
      state.myCompany = action.payload;
    },
    fetchMyCompanyFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 공통: 상태 초기화 (모달 닫기, 폼 리셋 등에 사용)
    // ---------------------------------------------------
    resetCompanyState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
});

export const {
  addCompanyRequest,
  addCompanySuccess,
  addCompanyFailure,

  fetchCompanyListRequest,
  fetchCompanyListSuccess,
  fetchCompanyListFailure,

  fetchCompanyDetailRequest,
  fetchCompanyDetailSuccess,
  fetchCompanyDetailFailure,

  updateCompanyRequest,
  updateCompanySuccess,
  updateCompanyFailure,

  deleteCompanyRequest,
  deleteCompanySuccess,
  deleteCompanyFailure,

  restoreCompanyRequest,
  restoreCompanySuccess,
  restoreCompanyFailure,

  checkBizNoRequest,
  checkBizNoSuccess,
  checkBizNoFailure,

  suggestCompanyRequest,
  suggestCompanySuccess,
  suggestCompanyFailure,
  clearSuggestList,

  fetchCompanyStatsRequest,
  fetchCompanyStatsSuccess,
  fetchCompanyStatsFailure,

  fetchMyCompanyRequest,
  fetchMyCompanySuccess,
  fetchMyCompanyFailure,

  resetCompanyState,
} = companyReducer.actions;

export default companyReducer.reducer;
