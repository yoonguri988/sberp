// sagas/dept/deptTransferSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 적용) - 경로는 실제 프로젝트에 맞게 수정

import {
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
} from "../../reducers/dept/deptTransferReducer";

const DEPT_TRANSFER_API_BASE = "/api/dept/transfer";

// =========================================================
// 1) 부서 이관 영향도 조회 GET /api/dept/transfer/impact?deptId=
// =========================================================
export const fetchImpactApi = (deptId) =>
  api.get(`${DEPT_TRANSFER_API_BASE}/impact`, { params: { deptId } });

export function* fetchImpact(action) {
  try {
    const deptId = action.payload;
    const res = yield call(fetchImpactApi, deptId);

    yield put(fetchImpactSuccess(res.data));
  } catch (err) {
    yield put(fetchImpactFailure(err.response?.data?.message || "이관 영향도 조회에 실패하였습니다."));
  }
}

// =========================================================
// 2) 이관 취소 POST /api/dept/transfer/{deptId}/cancel
// =========================================================
export const cancelTransferApi = (deptId) =>
  api.post(`${DEPT_TRANSFER_API_BASE}/${deptId}/cancel`);

export function* cancelTransfer(action) {
  try {
    const deptId = action.payload;
    const res = yield call(cancelTransferApi, deptId);

    // 응답에 deptId 가 없으므로, 대기 목록에서 제거할 수 있도록 항상 deptId 를 함께 전달한다.
    yield put(cancelTransferSuccess({ ...res.data, deptId }));
  } catch (err) {
    yield put(cancelTransferFailure(err.response?.data?.message || "이관 취소에 실패하였습니다."));
  }
}

// =========================================================
// 3) 이관 최종 실행 POST /api/dept/transfer/execute
// action.payload: DeptTransferExecuteFormRequest
// =========================================================
export const executeTransferApi = (form) =>
  api.post(`${DEPT_TRANSFER_API_BASE}/execute`, form);

export function* executeTransfer(action) {
  try {
    const form = action.payload;
    const res = yield call(executeTransferApi, form);

    yield put(executeTransferSuccess(res.data));
  } catch (err) {
    // DeptTransferException 발생 시 서버가 message 와 함께 reason(errorCode) 도 내려준다.
    yield put(
      executeTransferFailure({
        message: err.response?.data?.message || "이관 처리 중 오류가 발생했습니다.",
        reason: err.response?.data?.reason ?? null,
      })
    );
  }
}

// =========================================================
// 4) 이관 대기 부서 목록 조회 GET /api/dept/transfer/pending?keyword=
// =========================================================
export const fetchPendingListApi = (keyword) =>
  api.get(`${DEPT_TRANSFER_API_BASE}/pending`, { params: keyword ? { keyword } : {} });

export function* fetchPendingList(action) {
  try {
    const keyword = action.payload;
    const res = yield call(fetchPendingListApi, keyword);

    yield put(fetchPendingListSuccess(res.data));
  } catch (err) {
    yield put(fetchPendingListFailure(err.response?.data?.message || "이관 대기 목록 조회에 실패하였습니다."));
  }
}

// =========================================================
// 5) 부서 이관 이력 조회 GET /api/dept/transfer/log
// action.payload: DeptTransferLogSearchRequest
// =========================================================
export const fetchTransferLogApi = (search) =>
  api.get(`${DEPT_TRANSFER_API_BASE}/log`, { params: search });

export function* fetchTransferLog(action) {
  try {
    const search = action.payload;
    const res = yield call(fetchTransferLogApi, search);

    yield put(fetchTransferLogSuccess(res.data));
  } catch (err) {
    yield put(fetchTransferLogFailure(err.response?.data?.message || "이관 이력 조회에 실패하였습니다."));
  }
}

// =========================================================
// Watcher
// =========================================================
function* watchFetchImpact() { yield takeLatest(fetchImpactRequest.type, fetchImpact); }
function* watchCancelTransfer() { yield takeLatest(cancelTransferRequest.type, cancelTransfer); }
function* watchExecuteTransfer() { yield takeLatest(executeTransferRequest.type, executeTransfer); }
function* watchFetchPendingList() { yield takeLatest(fetchPendingListRequest.type, fetchPendingList); }
function* watchFetchTransferLog() { yield takeLatest(fetchTransferLogRequest.type, fetchTransferLog); }

export default function* deptTransferSaga() {
  yield all([
    call(watchFetchImpact),
    call(watchCancelTransfer),
    call(watchExecuteTransfer),
    call(watchFetchPendingList),
    call(watchFetchTransferLog),
  ]);
}