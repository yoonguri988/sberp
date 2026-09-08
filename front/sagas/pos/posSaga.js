// sagas/pos/posSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  listPosRequest, listPosSuccess, listPosFailure,
  detailPosRequest, detailPosSuccess, detailPosFailure,
  createPosRequest, createPosSuccess, createPosFailure,
  updatePosRequest, updatePosSuccess, updatePosFailure,
  deletePosRequest, deletePosSuccess, deletePosFailure,
  checkCodeRequest, checkCodeSuccess,
} from "../../reducers/pos/posReducer";

const POS_API_BASE = "/api/pos";

//////////////////////////////////////////////////////////////////////////////
// listPos  - GET /api/pos 직급 목록 조회
//////////////////////////////////////////////////////////////////////////////
export const listPosApi = () => api.get(POS_API_BASE);

export function* listPos() {
  try {
    const result = yield call(listPosApi);
    yield put(listPosSuccess(result.data));
  } catch (err) {
    yield put(listPosFailure(err.response?.data?.message || err.message));
  }
}

//////////////////////////////////////////////////////////////////////////////
// detailPos  - GET /api/pos/{posId} 직급 상세 조회
//////////////////////////////////////////////////////////////////////////////
export const detailPosApi = (posId) => api.get(`${POS_API_BASE}/${posId}`);

export function* detailPos(action) {
  try {
    const result = yield call(detailPosApi, action.payload);
    yield put(detailPosSuccess(result.data));
  } catch (err) {
    yield put(detailPosFailure(err.response?.data?.message || err.message));
  }
}

//////////////////////////////////////////////////////////////////////////////
// createPos  - POST /api/pos 직급 등록
//////////////////////////////////////////////////////////////////////////////
export const createPosApi = (data) => api.post(POS_API_BASE, data);

export function* createPos(action) {
  try {
    const result = yield call(createPosApi, action.payload);
    yield put(createPosSuccess(result.data));
  } catch (err) {
    yield put(createPosFailure(err.response?.data?.message || err.message));
  }
}

//////////////////////////////////////////////////////////////////////////////
// updatePos  - PUT /api/pos/{posId} 직급 수정
//////////////////////////////////////////////////////////////////////////////
export const updatePosApi = ({ posId, ...data }) =>
  api.put(`${POS_API_BASE}/${posId}`, data);

export function* updatePos(action) {
  try {
    const result = yield call(updatePosApi, action.payload);
    yield put(updatePosSuccess(result.data));
  } catch (err) {
    yield put(updatePosFailure(err.response?.data?.message || err.message));
  }
}

//////////////////////////////////////////////////////////////////////////////
// deletePos  - DELETE /api/pos/{posId} 직급 삭제
//////////////////////////////////////////////////////////////////////////////
export const deletePosApi = (posId) => api.delete(`${POS_API_BASE}/${posId}`);

export function* deletePos(action) {
  try {
    yield call(deletePosApi, action.payload);
    yield put(deletePosSuccess(action.payload));
  } catch (err) {
    yield put(deletePosFailure(err.response?.data?.message || err.message));
  }
}

//////////////////////////////////////////////////////////////////////////////
// checkCode  - GET /api/pos/check-code 코드 중복검사
//   params: { posCode, excludePosId? }
//////////////////////////////////////////////////////////////////////////////
export const checkCodeApi = ({ posCode, excludePosId }) =>
  api.get(`${POS_API_BASE}/check-code`, {
    params: { posCode, ...(excludePosId ? { excludePosId } : {}) },
  });

export function* checkCode(action) {
  try {
    const result = yield call(checkCodeApi, action.payload);
    yield put(checkCodeSuccess(result.data.duplicate));
  } catch (err) {
    console.error("코드 중복검사 실패:", err);
  }
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function* watchListPos() {
  yield takeLatest(listPosRequest.type, listPos);
}
function* watchDetailPos() {
  yield takeLatest(detailPosRequest.type, detailPos);
}
function* watchCreatePos() {
  yield takeLatest(createPosRequest.type, createPos);
}
function* watchUpdatePos() {
  yield takeLatest(updatePosRequest.type, updatePos);
}
function* watchDeletePos() {
  yield takeLatest(deletePosRequest.type, deletePos);
}
function* watchCheckCode() {
  yield takeLatest(checkCodeRequest.type, checkCode);
}

export default function* posSaga() {
  yield all([
    call(watchListPos),
    call(watchDetailPos),
    call(watchCreatePos),
    call(watchUpdatePos),
    call(watchDeletePos),
    call(watchCheckCode),
  ]);
}
