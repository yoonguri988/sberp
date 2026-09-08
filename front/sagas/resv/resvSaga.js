// sagas/resv/resvSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 적용) - 경로는 실제 프로젝트에 맞게 수정

import {
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
} from "../../reducers/resv/resvReducer";
 
const RESV_API_BASE = "/api/resv";
 
// =========================================================
// 1) 내 예약 목록 조회 GET /api/resv/my
// =========================================================
export const fetchMyResvListApi = (search) => api.get(`${RESV_API_BASE}/my`, { params: search });
 
export function* fetchMyResvList(action) {
  try {
    const res = yield call(fetchMyResvListApi, action.payload);
 
    yield put(fetchMyResvListSuccess(res.data));
  } catch (err) {
    yield put(fetchMyResvListFailure(err.response?.data?.message || "내 예약 목록 조회에 실패하였습니다."));
  }
}
 
// =========================================================
// 2) 내 예약 개수 조회 GET /api/resv/my/count
// =========================================================
export const fetchMyResvCountApi = (search) =>
  api.get(`${RESV_API_BASE}/my/count`, { params: search });
 
export function* fetchMyResvCount(action) {
  try {
    const res = yield call(fetchMyResvCountApi, action.payload);
 
    yield put(fetchMyResvCountSuccess(res.data));
  } catch (err) {
    yield put(fetchMyResvCountFailure(err.response?.data?.message || "내 예약 개수 조회에 실패하였습니다."));
  }
}
 
// =========================================================
// 3) 예약 단건 조회 GET /api/resv/{revId}
// =========================================================
export const fetchResvDetailApi = (revId) => api.get(`${RESV_API_BASE}/${revId}`);
 
export function* fetchResvDetail(action) {
  try {
    const revId = action.payload;
    const res = yield call(fetchResvDetailApi, revId);
 
    yield put(fetchResvDetailSuccess(res.data));
  } catch (err) {
    yield put(fetchResvDetailFailure(err.response?.data?.message || "예약 상세 조회에 실패하였습니다."));
  }
}
 
// =========================================================
// 4) 자원 예약 등록 POST /api/resv
// =========================================================
export const addResvApi = (dto) => api.post(RESV_API_BASE, dto);
 
export function* addResv(action) {
  try {
    const dto = action.payload;
    const res = yield call(addResvApi, dto);
 
    yield put(addResvSuccess(res.data));
  } catch (err) {
    // 수량 부족(notEnoughQuantity), 잘못된 자원(invalidResource) 등 - message 와 함께 reason 도 내려준다.
    yield put(
      addResvFailure({
        message: err.response?.data?.message || "예약 신청에 실패하였습니다.",
        reason: err.response?.data?.reason ?? null,
      })
    );
  }
}
 
// =========================================================
// 5) 자원 예약 수정 PUT /api/resv/{revId}
// action.payload: { revId, dto: ResvRequest }
// =========================================================
export const updateResvApi = (revId, dto) => api.put(`${RESV_API_BASE}/${revId}`, dto);
 
export function* updateResv(action) {
  try {
    const { revId, dto } = action.payload;
    const res = yield call(updateResvApi, revId, dto);
 
    yield put(updateResvSuccess(res.data));
  } catch (err) {
    yield put(updateResvFailure(err.response?.data?.message || "예약 수정에 실패하였습니다."));
  }
}
 
// =========================================================
// 6) 자원 예약 취소 DELETE /api/resv/{revId}
// =========================================================
export const cancelResvApi = (revId) => api.delete(`${RESV_API_BASE}/${revId}`);
 
export function* cancelResv(action) {
  try {
    const revId = action.payload;
    const res = yield call(cancelResvApi, revId);
 
    // 응답에 revId 가 없으므로, 목록에서 제거할 수 있도록 항상 revId 를 함께 전달한다.
    yield put(cancelResvSuccess({ ...res.data, revId }));
  } catch (err) {
    yield put(cancelResvFailure(err.response?.data?.message || "예약 취소에 실패하였습니다."));
  }
}
 
// =========================================================
// 7) 자원 반납 처리 PUT /api/resv/{revId}/return
// =========================================================
export const returnResvApi = (revId) => api.put(`${RESV_API_BASE}/${revId}/return`);

export function* returnResv(action) {
  try {
    const revId = action.payload;
    const res = yield call(returnResvApi, revId);

    // 응답에 revId 가 없으므로, 목록/상세를 갱신할 수 있도록 항상 revId 를 함께 전달한다.
    yield put(returnResvSuccess({ ...res.data, revId }));
  } catch (err) {
    yield put(returnResvFailure(err.response?.data?.message || "반납 처리에 실패하였습니다."));
  }
}

// =========================================================
// 8) 실시간 잔여수량 조회 GET /api/resv/available
// =========================================================
export const fetchAvailableQtyApi = (search) =>
  api.get(`${RESV_API_BASE}/available`, { params: search });
 
export function* fetchAvailableQty(action) {
  try {
    const res = yield call(fetchAvailableQtyApi, action.payload);
 
    yield put(fetchAvailableQtySuccess(res.data));
  } catch (err) {
    yield put(fetchAvailableQtyFailure(err.response?.data?.message || "잔여수량 조회에 실패하였습니다."));
  }
}
 
// =========================================================
// Watcher
// =========================================================
function* watchFetchMyResvList() { yield takeLatest(fetchMyResvListRequest.type, fetchMyResvList); }
function* watchFetchMyResvCount() { yield takeLatest(fetchMyResvCountRequest.type, fetchMyResvCount); }
function* watchFetchResvDetail() { yield takeLatest(fetchResvDetailRequest.type, fetchResvDetail); }
function* watchAddResv() { yield takeLatest(addResvRequest.type, addResv); }
function* watchUpdateResv() { yield takeLatest(updateResvRequest.type, updateResv); }
function* watchCancelResv() { yield takeLatest(cancelResvRequest.type, cancelResv); }
function* watchReturnResv() { yield takeLatest(returnResvRequest.type, returnResv); }
function* watchFetchAvailableQty() { yield takeLatest(fetchAvailableQtyRequest.type, fetchAvailableQty); }

export default function* resvSaga() {
  yield all([
    call(watchFetchMyResvList),
    call(watchFetchMyResvCount),
    call(watchFetchResvDetail),
    call(watchAddResv),
    call(watchUpdateResv),
    call(watchCancelResv),
    call(watchReturnResv),
    call(watchFetchAvailableQty),
  ]);
}