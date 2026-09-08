// sagas/resv/adminResvSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 적용) - 경로는 실제 프로젝트에 맞게 수정

import {
  fetchAdminResvListRequest,
  fetchAdminResvListSuccess,
  fetchAdminResvListFailure,

  fetchAdminResvCountRequest,
  fetchAdminResvCountSuccess,
  fetchAdminResvCountFailure,

  fetchAdminResvStatsRequest,
  fetchAdminResvStatsSuccess,
  fetchAdminResvStatsFailure,

  approveResvRequest,
  approveResvSuccess,
  approveResvFailure,

  rejectResvRequest,
  rejectResvSuccess,
  rejectResvFailure,
} from "../../reducers/resv/adminResvReducer";

const ADMIN_RESV_API_BASE = "/api/resv/admin";

// =========================================================
// 1) 예약 관리 목록 조회 GET /api/resv/admin
// =========================================================
export const fetchAdminResvListApi = (search) => api.get(ADMIN_RESV_API_BASE, { params: search });

export function* fetchAdminResvList(action) {
  try {
    const res = yield call(fetchAdminResvListApi, action.payload);

    yield put(fetchAdminResvListSuccess(res.data));
  } catch (err) {
    yield put(fetchAdminResvListFailure(err.response?.data?.message || "예약 목록 조회에 실패하였습니다."));
  }
}

// =========================================================
// 2) 예약 관리 전체 개수 조회 GET /api/resv/admin/count
// =========================================================
export const fetchAdminResvCountApi = (search) =>
  api.get(`${ADMIN_RESV_API_BASE}/count`, { params: search });

export function* fetchAdminResvCount(action) {
  try {
    const res = yield call(fetchAdminResvCountApi, action.payload);

    yield put(fetchAdminResvCountSuccess(res.data));
  } catch (err) {
    yield put(fetchAdminResvCountFailure(err.response?.data?.message || "예약 개수 조회에 실패하였습니다."));
  }
}

// =========================================================
// 3) 예약 통계 조회 GET /api/resv/admin/stats
// =========================================================
export const fetchAdminResvStatsApi = (search) =>
  api.get(`${ADMIN_RESV_API_BASE}/stats`, { params: search });

export function* fetchAdminResvStats(action) {
  try {
    const res = yield call(fetchAdminResvStatsApi, action.payload);

    yield put(fetchAdminResvStatsSuccess(res.data));
  } catch (err) {
    yield put(fetchAdminResvStatsFailure(err.response?.data?.message || "예약 통계 조회에 실패하였습니다."));
  }
}

// =========================================================
// 4) 예약 승인 PUT /api/resv/admin/{revId}/approve
// =========================================================
export const approveResvApi = (revId) => api.put(`${ADMIN_RESV_API_BASE}/${revId}/approve`);

export function* approveResv(action) {
  try {
    const revId = action.payload;
    const res = yield call(approveResvApi, revId);

    // 응답에 revId 가 없으므로, 목록 in-place 업데이트를 위해 항상 revId 를 함께 전달한다.
    yield put(approveResvSuccess({ ...res.data, revId }));
  } catch (err) {
    yield put(approveResvFailure(err.response?.data?.message || "예약 승인에 실패하였습니다."));
  }
}

// =========================================================
// 5) 예약 반려 PUT /api/resv/admin/{revId}/reject
// action.payload: { revId, rejectReason }
// =========================================================
export const rejectResvApi = (revId, rejectReason) =>
  api.put(`${ADMIN_RESV_API_BASE}/${revId}/reject`, { rejectReason });

export function* rejectResv(action) {
  try {
    const { revId, rejectReason } = action.payload;
    const res = yield call(rejectResvApi, revId, rejectReason);

    yield put(rejectResvSuccess({ ...res.data, revId, rejectReason }));
  } catch (err) {
    yield put(rejectResvFailure(err.response?.data?.message || "예약 반려에 실패하였습니다."));
  }
}

// =========================================================
// Watcher
// =========================================================
function* watchFetchAdminResvList() { yield takeLatest(fetchAdminResvListRequest.type, fetchAdminResvList); }
function* watchFetchAdminResvCount() { yield takeLatest(fetchAdminResvCountRequest.type, fetchAdminResvCount); }
function* watchFetchAdminResvStats() { yield takeLatest(fetchAdminResvStatsRequest.type, fetchAdminResvStats); }
function* watchApproveResv() { yield takeLatest(approveResvRequest.type, approveResv); }
function* watchRejectResv() { yield takeLatest(rejectResvRequest.type, rejectResv); }

export default function* adminResvSaga() {
  yield all([
    call(watchFetchAdminResvList),
    call(watchFetchAdminResvCount),
    call(watchFetchAdminResvStats),
    call(watchApproveResv),
    call(watchRejectResv),
  ]);
}