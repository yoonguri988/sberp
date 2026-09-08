// reducers/res/resourceReducer.js
import { createSlice } from "@reduxjs/toolkit";

// =========================================================
//  - GET    /                 : 자원 목록 조회 (getResources)
//  - GET    /count            : 자원 전체 개수 조회 (getResourceCount)
//  - GET    /{resId}          : 자원 단건 조회 (getResource)
//  - POST   /                 : 자원 등록 (insertResource)
//  - PUT    /{resId}          : 자원 수정 (updateResource)
//  - DELETE /{resId}          : 자원 삭제 (deleteResource, 비밀번호 확인)
//  - GET    /check-rescode    : 자원코드 중복 체크
//  - GET    /reservable       : 예약 가능 자원 목록 조회
// =========================================================

const initialState = {
  // 목록 조회 (list)
  list: [],           // ResResponse[]
  listCount: 0,        // 전체 개수 (페이징 계산용)

  // 단건 조회 (detail)
  detail: null,        // ResResponse

  // 예약 가능 자원 목록 (reservable)
  reservableList: [],    // ResResponse[]

  // 자원코드 중복 체크 (check-rescode)
  resCodeCheck: {
    checked: false,
    duplicate: false,
  },

  // 등록/삭제 실패 사유 (duplicateResCode, passwordMismatch, hasReservations 등)
  addReason: null,
  deleteReason: null,

  // 공통 상태
  loading: false,
  error: null,
  success: false,
  message: null,
};

const resourceReducer = createSlice({
  name: "resource",
  initialState,
  reducers: {
    // ---------------------------------------------------
    // 1) 자원 목록 조회 GET /api/res
    // payload: ResSearchRequest
    // ---------------------------------------------------
    fetchResourceListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchResourceListSuccess(state, action) {
      // action.payload: ResResponse[]
      state.loading = false;
      state.list = action.payload ?? [];
    },
    fetchResourceListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 2) 자원 전체 개수 조회 GET /api/res/count
    // payload: ResSearchRequest
    // ---------------------------------------------------
    fetchResourceCountRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchResourceCountSuccess(state, action) {
      // action.payload: number
      state.loading = false;
      state.listCount = action.payload ?? 0;
    },
    fetchResourceCountFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 3) 자원 단건 조회 GET /api/res/{resId}
    // payload: resId
    // ---------------------------------------------------
    fetchResourceDetailRequest(state) {
      state.loading = true;
      state.error = null;
      state.detail = null;
    },
    fetchResourceDetailSuccess(state, action) {
      // action.payload: ResResponse
      state.loading = false;
      state.detail = action.payload;
    },
    fetchResourceDetailFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 4) 자원 등록 POST /api/res
    // payload: ResRequest
    // ---------------------------------------------------
    addResourceRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.addReason = null;
    },
    addResourceSuccess(state, action) {
      // action.payload: { success, message, resource }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "자원 등록 성공";
    },
    addResourceFailure(state, action) {
      // action.payload: { message, reason }
      state.loading = false;
      state.success = false;
      state.error = action.payload?.message ?? action.payload;
      state.addReason = action.payload?.reason ?? null;
    },

    // ---------------------------------------------------
    // 5) 자원 수정 PUT /api/res/{resId}
    // payload: { resId, dto: ResRequest }
    // ---------------------------------------------------
    updateResourceRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateResourceSuccess(state, action) {
      // action.payload: { success, message }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "자원 수정 성공";
    },
    updateResourceFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 6) 자원 삭제 DELETE /api/res/{resId}
    // payload: { resId, password }
    // ---------------------------------------------------
    deleteResourceRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.deleteReason = null;
    },
    deleteResourceSuccess(state, action) {
      // action.payload: { success, message, resId }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "자원 삭제 성공";
      if (action.payload?.resId) {
        state.list = state.list.filter((r) => r.resId !== action.payload.resId);
      }
    },
    deleteResourceFailure(state, action) {
      // action.payload: { message, reason }
      state.loading = false;
      state.success = false;
      state.error = action.payload?.message ?? action.payload;
      state.deleteReason = action.payload?.reason ?? null;
    },

    // ---------------------------------------------------
    // 7) 자원코드 중복 체크 GET /api/res/check-rescode
    // payload: resCode
    // ---------------------------------------------------
    checkResCodeRequest(state) {
      state.loading = true;
      state.error = null;
      state.resCodeCheck = { checked: false, duplicate: false };
    },
    checkResCodeSuccess(state, action) {
      // action.payload: { duplicate: boolean }
      state.loading = false;
      state.resCodeCheck = { checked: true, duplicate: !!action.payload.duplicate };
    },
    checkResCodeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 8) 예약 가능 자원 목록 조회 GET /api/res/reservable
    // payload: ResSearchRequest
    // ---------------------------------------------------
    fetchReservableResourcesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReservableResourcesSuccess(state, action) {
      // action.payload: ResResponse[]
      state.loading = false;
      state.reservableList = action.payload ?? [];
    },
    fetchReservableResourcesFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 공통: 상태 초기화
    // ---------------------------------------------------
    resetResourceState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      state.addReason = null;
      state.deleteReason = null;
    },
  },
});

export const {
  fetchResourceListRequest,
  fetchResourceListSuccess,
  fetchResourceListFailure,

  fetchResourceCountRequest,
  fetchResourceCountSuccess,
  fetchResourceCountFailure,

  fetchResourceDetailRequest,
  fetchResourceDetailSuccess,
  fetchResourceDetailFailure,

  addResourceRequest,
  addResourceSuccess,
  addResourceFailure,

  updateResourceRequest,
  updateResourceSuccess,
  updateResourceFailure,

  deleteResourceRequest,
  deleteResourceSuccess,
  deleteResourceFailure,

  checkResCodeRequest,
  checkResCodeSuccess,
  checkResCodeFailure,

  fetchReservableResourcesRequest,
  fetchReservableResourcesSuccess,
  fetchReservableResourcesFailure,

  resetResourceState,
} = resourceReducer.actions;

export default resourceReducer.reducer;