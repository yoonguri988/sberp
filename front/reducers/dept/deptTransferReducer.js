// reducers/dept/deptTransferReducer.js
import { createSlice } from "@reduxjs/toolkit";

// =========================================================
//  - GET  /impact          : 부서 이관 영향도 조회 (getImpact)
//  - POST /{deptId}/cancel  : 이관 취소 (cancel)
//  - POST /execute          : 이관 최종 실행 (execute)
//  - GET  /pending          : 이관 대기 부서 목록 조회 (pendingList)
//  - GET  /log              : 부서 이관 이력 조회 (transferLog)
// =========================================================

const initialState = {
  // 이관 영향도 조회 (impact)
  impact: null,        // DeptTransferImpactResponse

  // 이관 대기 부서 목록 (pending)
  pendingList: [],       // PendingDeptResponse[]

  // 이관 이력 조회 (log)
  logs: [],            // DeptTransferLogResponse[]
  logTotal: 0,
  deptOptions: [],       // 필터 셀렉트박스용 DeptResponse[]

  // 이관 최종 실행 실패 사유 (DeptTransferException.errorCode)
  executeReason: null,

  // 공통 상태
  loading: false,
  error: null,
  success: false,
  message: null,
};

const deptTransferReducer = createSlice({
  name: "deptTransfer",
  initialState,
  reducers: {
    // ---------------------------------------------------
    // 1) 부서 이관 영향도 조회 GET /api/dept/transfer/impact?deptId=
    // payload: deptId
    // ---------------------------------------------------
    fetchImpactRequest(state) {
      state.loading = true;
      state.error = null;
      state.impact = null;
    },
    fetchImpactSuccess(state, action) {
      // action.payload: DeptTransferImpactResponse
      state.loading = false;
      state.impact = action.payload;
    },
    fetchImpactFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 2) 이관 취소 POST /api/dept/transfer/{deptId}/cancel
    // payload: deptId
    // ---------------------------------------------------
    cancelTransferRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    cancelTransferSuccess(state, action) {
      // action.payload: { success, message, deptId }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "부서 삭제를 취소했습니다.";
      // 이관 대기 목록에서 즉시 제거 (다시 ACTIVE 로 돌아갔으므로)
      if (action.payload?.deptId) {
        state.pendingList = state.pendingList.filter((d) => d.deptId !== action.payload.deptId);
      }
    },
    cancelTransferFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 3) 이관 최종 실행 POST /api/dept/transfer/execute
    // payload: DeptTransferExecuteFormRequest
    // ---------------------------------------------------
    executeTransferRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.executeReason = null;
    },
    executeTransferSuccess(state, action) {
      // action.payload: { success, message }
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "사원 이관이 완료되었습니다.";
    },
    executeTransferFailure(state, action) {
      // action.payload: { message, reason }  (reason: DeptTransferException.errorCode)
      state.loading = false;
      state.success = false;
      state.error = action.payload?.message ?? action.payload;
      state.executeReason = action.payload?.reason ?? null;
    },

    // ---------------------------------------------------
    // 4) 이관 대기 부서 목록 조회 GET /api/dept/transfer/pending?keyword=
    // payload: keyword
    // ---------------------------------------------------
    fetchPendingListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchPendingListSuccess(state, action) {
      // action.payload: PendingDeptResponse[]
      state.loading = false;
      state.pendingList = action.payload ?? [];
    },
    fetchPendingListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 5) 부서 이관 이력 조회 GET /api/dept/transfer/log
    // payload: DeptTransferLogSearchRequest
    // ---------------------------------------------------
    fetchTransferLogRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTransferLogSuccess(state, action) {
      // action.payload: { total, logs, deptOptions }
      state.loading = false;
      state.logs = action.payload.logs ?? [];
      state.logTotal = action.payload.total ?? 0;
      state.deptOptions = action.payload.deptOptions ?? [];
    },
    fetchTransferLogFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 공통: 상태 초기화
    // ---------------------------------------------------
    resetDeptTransferState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      state.executeReason = null;
    },
  },
});

export const {
  fetchImpactRequest,
  fetchImpactSuccess,
  fetchImpactFailure,

  cancelTransferRequest,
  cancelTransferSuccess,
  cancelTransferFailure,

  executeTransferRequest,
  executeTransferSuccess,
  executeTransferFailure,

  fetchPendingListRequest,
  fetchPendingListSuccess,
  fetchPendingListFailure,

  fetchTransferLogRequest,
  fetchTransferLogSuccess,
  fetchTransferLogFailure,

  resetDeptTransferState,
} = deptTransferReducer.actions;

export default deptTransferReducer.reducer;