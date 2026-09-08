// reducers/resv/resvReducer.js
import { createSlice } from "@reduxjs/toolkit";

// =========================================================
//  - GET    /my         : 내 예약 목록 조회 (getMyResvList)
//  - GET    /my/count    : 내 예약 개수 조회 (getMyResvCount)
//  - GET    /{revId}     : 예약 단건 조회 (getResv)
//  - POST   /           : 자원 예약 등록 (insert)
//  - PUT    /{revId}     : 자원 예약 수정 (update)
//  - DELETE /{revId}     : 자원 예약 취소 (cancel)
//  - GET    /available   : 실시간 잔여수량 조회 (getAvailableQty)
//  - PUT    /{revId}/return : 자원 반납 처리 (return) - 본인 예약만 가능
// =========================================================

const initialState = {
  // 내 예약 목록 조회 (my)
  myList: [],          // ResvResponse[]
  myListCount: 0,        // 내 예약 전체 개수 (페이징 계산용)

  // 예약 단건 조회 (detail)
  detail: null,         // ResvResponse

  // 실시간 잔여수량 조회 (available)
  availableQty: null,      // { totalQuantity, reservedQty, availableQty, resStatus }

  // 예약 등록 실패 사유 (notEnoughQuantity, invalidResource)
  addReason: null,

  // 공통 상태
  loading: false,
  error: null,
  success: false,
  message: null,
};

const resvReducer = createSlice({
  name: "resv",
  initialState,
  reducers: {
    // ---------------------------------------------------
    // 1) 내 예약 목록 조회 GET /api/resv/my
    // payload: ResvSearchRequest
    // ---------------------------------------------------
    fetchMyResvListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMyResvListSuccess(state, action) {
      // action.payload: ResvResponse[]
      state.loading = false;
      state.myList = action.payload ?? [];
    },
    fetchMyResvListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 2) 내 예약 개수 조회 GET /api/resv/my/count
    // payload: ResvSearchRequest
    // ---------------------------------------------------
    fetchMyResvCountRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMyResvCountSuccess(state, action) {
      // action.payload: number
      state.loading = false;
      state.myListCount = action.payload ?? 0;
    },
    fetchMyResvCountFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 3) 예약 단건 조회 GET /api/resv/{revId}
    // payload: revId
    // ---------------------------------------------------
    fetchResvDetailRequest(state) {
      state.loading = true;
      state.error = null;
      state.detail = null;
    },
    fetchResvDetailSuccess(state, action) {
      // action.payload: ResvResponse
      state.loading = false;
      state.detail = action.payload;
    },
    fetchResvDetailFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 4) 자원 예약 등록 POST /api/resv
    // payload: ResvRequest
    // ---------------------------------------------------
    addResvRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.addReason = null;
    },
    addResvSuccess(state, action) {
      // action.payload: { success, message }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "예약이 신청되었습니다.";
    },
    addResvFailure(state, action) {
      // action.payload: { message, reason }
      state.loading = false;
      state.success = false;
      state.error = action.payload?.message ?? action.payload;
      state.addReason = action.payload?.reason ?? null;
    },

    // ---------------------------------------------------
    // 5) 자원 예약 수정 PUT /api/resv/{revId}
    // payload: { revId, dto: ResvRequest }
    // ---------------------------------------------------
    updateResvRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateResvSuccess(state, action) {
      // action.payload: { success, message }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "예약 수정 성공";
    },
    updateResvFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 6) 자원 예약 취소 DELETE /api/resv/{revId}
    // payload: revId
    // ---------------------------------------------------
    cancelResvRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    cancelResvSuccess(state, action) {
      // action.payload: { success, message, revId }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "예약이 취소되었습니다.";
      if (action.payload?.revId) {
        state.myList = state.myList.filter((r) => r.revId !== action.payload.revId);
      }
    },
    cancelResvFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 7) 자원 반납 처리 PUT /api/resv/{revId}/return
    // payload: revId
    // ---------------------------------------------------
    returnResvRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    returnResvSuccess(state, action) {
      // action.payload: { success, message, revId, returnDt }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "반납 처리되었습니다.";

      const revId = action.payload?.revId;
      const returnDt = action.payload?.returnDt;
      if (revId != null && returnDt) {
        // 반납 처리되면 상태(NORET 포함)와 무관하게 승인(APP)으로 정리한다.
        const target = state.myList.find((r) => r.revId === revId);
        if (target) {
          target.returnDt = returnDt;
          target.status = "APP";
        }
        if (state.detail && state.detail.revId === revId) {
          state.detail.returnDt = returnDt;
          state.detail.status = "APP";
        }
      }
    },
    returnResvFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 8) 실시간 잔여수량 조회 GET /api/resv/available
    // payload: ResvSearchRequest (resId, startDt, endDt 등)
    // ---------------------------------------------------
    fetchAvailableQtyRequest(state) {
      state.loading = true;
      state.error = null;
      state.availableQty = null;
    },
    fetchAvailableQtySuccess(state, action) {
      // action.payload: { totalQuantity, reservedQty, availableQty, resStatus }
      state.loading = false;
      state.availableQty = action.payload;
    },
    fetchAvailableQtyFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 공통: 상태 초기화
    // ---------------------------------------------------
    resetResvState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      state.addReason = null;
    },
  },
});

export const {
  fetchMyResvListRequest,
  fetchMyResvListSuccess,
  fetchMyResvListFailure,

  fetchMyResvCountRequest,
  fetchMyResvCountSuccess,
  fetchMyResvCountFailure,

  fetchResvDetailRequest,
  fetchResvDetailSuccess,
  fetchResvDetailFailure,

  addResvRequest,
  addResvSuccess,
  addResvFailure,

  updateResvRequest,
  updateResvSuccess,
  updateResvFailure,

  cancelResvRequest,
  cancelResvSuccess,
  cancelResvFailure,

  returnResvRequest,
  returnResvSuccess,
  returnResvFailure,

  fetchAvailableQtyRequest,
  fetchAvailableQtySuccess,
  fetchAvailableQtyFailure,

  resetResvState,
} = resvReducer.actions;

export default resvReducer.reducer;