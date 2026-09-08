// sagas/res/resourceSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 적용) - 경로는 실제 프로젝트에 맞게 수정

import {
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
} from "../../reducers/res/resourceReducer";

const RES_API_BASE = "/api/res";

// =========================================================
// 1) 자원 목록 조회 GET /api/res
// =========================================================
export const fetchResourceListApi = (search) =>
  api.get(RES_API_BASE, { params: search });

export function* fetchResourceList(action) {
  try {
    const res = yield call(fetchResourceListApi, action.payload);

    yield put(fetchResourceListSuccess(res.data));
  } catch (err) {
    yield put(
      fetchResourceListFailure(
        err.response?.data?.message || "자원 목록 조회에 실패하였습니다.",
      ),
    );
  }
}

// =========================================================
// 2) 자원 전체 개수 조회 GET /api/res/count
// =========================================================
export const fetchResourceCountApi = (search) =>
  api.get(`${RES_API_BASE}/count`, { params: search });

export function* fetchResourceCount(action) {
  try {
    const res = yield call(fetchResourceCountApi, action.payload);

    yield put(fetchResourceCountSuccess(res.data));
  } catch (err) {
    yield put(
      fetchResourceCountFailure(
        err.response?.data?.message || "자원 개수 조회에 실패하였습니다.",
      ),
    );
  }
}

// =========================================================
// 3) 자원 단건 조회 GET /api/res/{resId}
// =========================================================
export const fetchResourceDetailApi = (resId) =>
  api.get(`${RES_API_BASE}/${resId}`);

export function* fetchResourceDetail(action) {
  try {
    const resId = action.payload;
    const res = yield call(fetchResourceDetailApi, resId);

    yield put(fetchResourceDetailSuccess(res.data));
  } catch (err) {
    yield put(
      fetchResourceDetailFailure(
        err.response?.data?.message || "자원 상세 조회에 실패하였습니다.",
      ),
    );
  }
}

// =========================================================
// 4) 자원 등록 POST /api/res
// =========================================================
export const addResourceApi = (dto) => api.post(RES_API_BASE, dto);

export function* addResource(action) {
  try {
    const dto = action.payload;
    const res = yield call(addResourceApi, dto);

    yield put(addResourceSuccess(res.data));
  } catch (err) {
    // 자원코드 중복 등, 서버가 message 와 함께 reason 도 내려준다.
    yield put(
      addResourceFailure({
        message: err.response?.data?.message || "자원 등록에 실패하였습니다.",
        reason: err.response?.data?.reason ?? null,
      }),
    );
  }
}

// =========================================================
// 5) 자원 수정 PUT /api/res/{resId}
// action.payload: { resId, dto: ResRequest }
// =========================================================
export const updateResourceApi = (resId, dto) =>
  api.put(`${RES_API_BASE}/${resId}`, dto);

export function* updateResource(action) {
  try {
    const { resId, dto } = action.payload;
    const res = yield call(updateResourceApi, resId, dto);

    yield put(updateResourceSuccess(res.data));
  } catch (err) {
    yield put(
      updateResourceFailure(
        err.response?.data?.message || "자원 수정에 실패하였습니다.",
      ),
    );
  }
}

// =========================================================
// 6) 자원 삭제 DELETE /api/res/{resId}
// action.payload: { resId, password }
// =========================================================
export const deleteResourceApi = (resId, password) =>
  api.delete(`${RES_API_BASE}/${resId}`, {
    data: { password }, // EmpRequest
  });

export function* deleteResource(action) {
  try {
    const { resId, password } = action.payload;
    const res = yield call(deleteResourceApi, resId, password);

    yield put(deleteResourceSuccess({ ...res.data, resId }));
  } catch (err) {
    // 비밀번호 불일치, 진행 중인 예약 존재 등 - 서버가 message 와 함께 reason 도 내려준다.
    yield put(
      deleteResourceFailure({
        message: err.response?.data?.message || "자원 삭제에 실패하였습니다.",
        reason: err.response?.data?.reason ?? null,
      }),
    );
  }
}

// =========================================================
// 7) 자원코드 중복 체크 GET /api/res/check-rescode
// =========================================================
export const checkResCodeApi = (resCode) =>
  api.get(`${RES_API_BASE}/check-rescode`, { params: { resCode } });

export function* checkResCode(action) {
  try {
    const resCode = action.payload;
    const res = yield call(checkResCodeApi, resCode);

    yield put(checkResCodeSuccess(res.data));
  } catch (err) {
    yield put(
      checkResCodeFailure(
        err.response?.data?.message || "자원코드 중복확인에 실패하였습니다.",
      ),
    );
  }
}

// =========================================================
// 8) 예약 가능 자원 목록 조회 GET /api/res/reservable
// =========================================================
export const fetchReservableResourcesApi = (search) =>
  api.get(`${RES_API_BASE}/reservable`, { params: search });

export function* fetchReservableResources(action) {
  try {
    const res = yield call(fetchReservableResourcesApi, action.payload);

    yield put(fetchReservableResourcesSuccess(res.data));
  } catch (err) {
    yield put(
      fetchReservableResourcesFailure(
        err.response?.data?.message || "예약 가능 자원 조회에 실패하였습니다.",
      ),
    );
  }
}

// =========================================================
// Watcher
// =========================================================
function* watchFetchResourceList() {
  yield takeLatest(fetchResourceListRequest.type, fetchResourceList);
}
function* watchFetchResourceCount() {
  yield takeLatest(fetchResourceCountRequest.type, fetchResourceCount);
}
function* watchFetchResourceDetail() {
  yield takeLatest(fetchResourceDetailRequest.type, fetchResourceDetail);
}
function* watchAddResource() {
  yield takeLatest(addResourceRequest.type, addResource);
}
function* watchUpdateResource() {
  yield takeLatest(updateResourceRequest.type, updateResource);
}
function* watchDeleteResource() {
  yield takeLatest(deleteResourceRequest.type, deleteResource);
}
function* watchCheckResCode() {
  yield takeLatest(checkResCodeRequest.type, checkResCode);
}
function* watchFetchReservableResources() {
  yield takeLatest(
    fetchReservableResourcesRequest.type,
    fetchReservableResources,
  );
}

export default function* resourceSaga() {
  yield all([
    call(watchFetchResourceList),
    call(watchFetchResourceCount),
    call(watchFetchResourceDetail),
    call(watchAddResource),
    call(watchUpdateResource),
    call(watchDeleteResource),
    call(watchCheckResCode),
    call(watchFetchReservableResources),
  ]);
}
