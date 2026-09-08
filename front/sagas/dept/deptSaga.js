// sagas/dept/deptSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 적용) - 경로는 실제 프로젝트에 맞게 수정

import {
  fetchDeptListRequest,
  fetchDeptListSuccess,
  fetchDeptListFailure,

  fetchDeptFlatRequest,
  fetchDeptFlatSuccess,
  fetchDeptFlatFailure,

  addDeptRequest,
  addDeptSuccess,
  addDeptFailure,

  fetchDeptDetailRequest,
  fetchDeptDetailSuccess,
  fetchDeptDetailFailure,

  fetchMyDeptRequest,
  fetchMyDeptSuccess,
  fetchMyDeptFailure,

  updateDeptRequest,
  updateDeptSuccess,
  updateDeptFailure,

  deleteDeptRequest,
  deleteDeptSuccess,
  deleteDeptFailure,

  checkDeptCodeRequest,
  checkDeptCodeSuccess,
  checkDeptCodeFailure,

  fetchAncestorDeptsRequest,
  fetchAncestorDeptsSuccess,
  fetchAncestorDeptsFailure,

  fetchDeptEmpListRequest,
  fetchDeptEmpListSuccess,
  fetchDeptEmpListFailure,
} from "../../reducers/dept/deptReducer";

const DEPT_API_BASE = "/api/dept";

// =========================================================
// 1) 부서 조직도 조회 GET /api/dept?comId=
// =========================================================
export const fetchDeptListApi = (comId) =>
  api.get(DEPT_API_BASE, { params: comId ? { comId } : {} });

export function* fetchDeptList(action) {
  try {
    const comId = action.payload;
    const res = yield call(fetchDeptListApi, comId);

    yield put(fetchDeptListSuccess(res.data));
  } catch (err) {
    yield put(fetchDeptListFailure(err.response?.data?.message || "부서 조직도 조회에 실패하였습니다."));
  }
}

// =========================================================
// 2) 부서 목록 평탄화 조회 GET /api/dept/flat?comId=
// =========================================================
export const fetchDeptFlatApi = (comId) =>
  api.get(`${DEPT_API_BASE}/flat`, { params: { comId } });

export function* fetchDeptFlat(action) {
  try {
    const comId = action.payload;
    const res = yield call(fetchDeptFlatApi, comId);

    yield put(fetchDeptFlatSuccess(res.data));
  } catch (err) {
    yield put(fetchDeptFlatFailure(err.response?.data?.message || "부서 목록 조회에 실패하였습니다."));
  }
}

// =========================================================
// 3) 부서 등록 POST /api/dept
// =========================================================
export const addDeptApi = (dto) => api.post(DEPT_API_BASE, dto);

export function* addDept(action) {
  try {
    const dto = action.payload;
    const res = yield call(addDeptApi, dto);

    yield put(addDeptSuccess(res.data));
  } catch (err) {
    yield put(addDeptFailure(err.response?.data?.message || "부서 등록에 실패하였습니다."));
  }
}

// =========================================================
// 4) 부서 상세 조회 GET /api/dept/{deptId}
// =========================================================
export const fetchDeptDetailApi = (deptId) => api.get(`${DEPT_API_BASE}/${deptId}`);

export function* fetchDeptDetail(action) {
  try {
    const deptId = action.payload;
    const res = yield call(fetchDeptDetailApi, deptId);

    yield put(fetchDeptDetailSuccess(res.data));
  } catch (err) {
    yield put(fetchDeptDetailFailure(err.response?.data?.message || "부서 상세 조회에 실패하였습니다."));
  }
}

// =========================================================
// 5) 내 부서 상세 조회 GET /api/dept/my
// =========================================================
export const fetchMyDeptApi = () => api.get(`${DEPT_API_BASE}/my`);

export function* fetchMyDept() {
  try {
    const res = yield call(fetchMyDeptApi);

    yield put(fetchMyDeptSuccess(res.data));
  } catch (err) {
    yield put(fetchMyDeptFailure(err.response?.data?.message || "내 부서 조회에 실패하였습니다."));
  }
}

// =========================================================
// 6) 부서 수정 PUT /api/dept/{deptId}
// action.payload: { deptId, dto: DeptRequest }
// =========================================================
export const updateDeptApi = (deptId, dto) => api.put(`${DEPT_API_BASE}/${deptId}`, dto);

export function* updateDept(action) {
  try {
    const { deptId, dto } = action.payload;
    const res = yield call(updateDeptApi, deptId, dto);

    yield put(updateDeptSuccess(res.data));
  } catch (err) {
    yield put(updateDeptFailure(err.response?.data?.message || "부서 수정에 실패하였습니다."));
  }
}

// =========================================================
// 7) 부서 삭제 DELETE /api/dept/{deptId}
// action.payload: deptId
// 응답: 완전삭제 { message } 또는 이관대기 { message, pendingTransfer: true, deptId }
// =========================================================
export const deleteDeptApi = (deptId) => api.delete(`${DEPT_API_BASE}/${deptId}`);

export function* deleteDept(action) {
  try {
    const deptId = action.payload;
    const res = yield call(deleteDeptApi, deptId);

    // 완전삭제 응답에는 deptId 가 없으므로, 목록에서 제거할 수 있도록 항상 deptId 를 함께 전달한다.
    yield put(deleteDeptSuccess({ ...res.data, deptId }));
  } catch (err) {
    yield put(deleteDeptFailure(err.response?.data?.message || "부서 삭제에 실패하였습니다."));
  }
}

// =========================================================
// 8) 부서코드 중복확인 GET /api/dept/check-deptcode
// action.payload: DeptSearchRequest
// =========================================================
export const checkDeptCodeApi = (search) =>
  api.get(`${DEPT_API_BASE}/check-deptcode`, { params: search });

export function* checkDeptCode(action) {
  try {
    const search = action.payload;
    const res = yield call(checkDeptCodeApi, search);

    yield put(checkDeptCodeSuccess(res.data));
  } catch (err) {
    yield put(checkDeptCodeFailure(err.response?.data?.message || "부서코드 중복확인에 실패하였습니다."));
  }
}

// =========================================================
// 9) 상위 계층 부서 목록 GET /api/dept/{deptId}/ancestors
// =========================================================
export const fetchAncestorDeptsApi = (deptId) => api.get(`${DEPT_API_BASE}/${deptId}/ancestors`);

export function* fetchAncestorDepts(action) {
  try {
    const deptId = action.payload;
    const res = yield call(fetchAncestorDeptsApi, deptId);

    yield put(fetchAncestorDeptsSuccess(res.data));
  } catch (err) {
    yield put(fetchAncestorDeptsFailure(err.response?.data?.message || "상위 계층 부서 조회에 실패하였습니다."));
  }
}

// =========================================================
// 10) 부서(+하위부서) 소속 사원 목록 GET /api/dept/{deptId}/emp
// action.payload: deptId
// 응답: { list: EmpResponse[] }
// =========================================================
export const fetchDeptEmpListApi = (deptId) => api.get(`${DEPT_API_BASE}/${deptId}/emp`);

export function* fetchDeptEmpList(action) {
  try {
    const deptId = action.payload;
    const res = yield call(fetchDeptEmpListApi, deptId);

    yield put(fetchDeptEmpListSuccess(res.data?.list ?? []));
  } catch (err) {
    yield put(fetchDeptEmpListFailure(err.response?.data?.message || "부서 소속 사원 조회에 실패하였습니다."));
  }
}

// =========================================================
// Watcher
// =========================================================
function* watchFetchDeptList() { yield takeLatest(fetchDeptListRequest.type, fetchDeptList); }
function* watchFetchDeptFlat() { yield takeLatest(fetchDeptFlatRequest.type, fetchDeptFlat); }
function* watchAddDept() { yield takeLatest(addDeptRequest.type, addDept); }
function* watchFetchDeptDetail() { yield takeLatest(fetchDeptDetailRequest.type, fetchDeptDetail); }
function* watchFetchMyDept() { yield takeLatest(fetchMyDeptRequest.type, fetchMyDept); }
function* watchUpdateDept() { yield takeLatest(updateDeptRequest.type, updateDept); }
function* watchDeleteDept() { yield takeLatest(deleteDeptRequest.type, deleteDept); }
function* watchCheckDeptCode() { yield takeLatest(checkDeptCodeRequest.type, checkDeptCode); }
function* watchFetchAncestorDepts() { yield takeLatest(fetchAncestorDeptsRequest.type, fetchAncestorDepts); }
function* watchFetchDeptEmpList() { yield takeLatest(fetchDeptEmpListRequest.type, fetchDeptEmpList); }

export default function* deptSaga() {
  yield all([
    call(watchFetchDeptList),
    call(watchFetchDeptFlat),
    call(watchAddDept),
    call(watchFetchDeptDetail),
    call(watchFetchMyDept),
    call(watchUpdateDept),
    call(watchDeleteDept),
    call(watchCheckDeptCode),
    call(watchFetchAncestorDepts),
    call(watchFetchDeptEmpList),
  ]);
}