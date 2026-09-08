// sagas/sal/salStdSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  listSalStdRequest,
  listSalStdSuccess,
  listSalStdFailure,
  fetchMySalStdRequest,
  fetchMySalStdSuccess,
  fetchMySalStdFailure,
  createSalStdRequest,
  createSalStdSuccess,
  createSalStdFailure,
  updateSalStdRequest,
  updateSalStdSuccess,
  updateSalStdFailure,
  deleteSalStdRequest,
  deleteSalStdSuccess,
  deleteSalStdFailure,
} from "../../reducers/sal/salStdReducer";

const SALSTD_API_BASE = "/api/salstd";

// listSalStd  - GET /api/salstd 급여기준 전체 조회 (검색+페이지네이션)
//   params: { empName, department, position, page(0-based), size }
export const listSalStdApi = ({
  empName,
  department,
  position,
  page = 0,
  size = 10,
} = {}) =>
  api.get(SALSTD_API_BASE, {
    params: {
      ...(empName ? { empName } : {}),
      ...(department ? { department } : {}),
      ...(position ? { position } : {}),
      page,
      size,
    },
  });

export function* listSalStd(action) {
  try {
    const result = yield call(listSalStdApi, action.payload);
    yield put(listSalStdSuccess(result.data));
  } catch (err) {
    yield put(
      listSalStdFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// fetchMySalStd  - GET /api/salstd/me 본인 급여기준 조회
export const fetchMySalStdApi = () => api.get(`${SALSTD_API_BASE}/me`);

export function* fetchMySalStd() {
  try {
    const result = yield call(fetchMySalStdApi);
    yield put(fetchMySalStdSuccess(result.data));
  } catch (err) {
    yield put(
      fetchMySalStdFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// createSalStd  - POST /api/salstd 급여기준 등록
//   data: { empId, baseSal, annuSal, startDate }
export const createSalStdApi = (data) => api.post(SALSTD_API_BASE, data);

export function* createSalStd(action) {
  try {
    const result = yield call(createSalStdApi, action.payload);
    yield put(createSalStdSuccess(result.data));
  } catch (err) {
    yield put(
      createSalStdFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// updateSalStd  - PUT /api/salstd/{stdId} 급여기준 수정
export const updateSalStdApi = ({ stdId, ...data }) =>
  api.put(`${SALSTD_API_BASE}/${stdId}`, data);

export function* updateSalStd(action) {
  try {
    const result = yield call(updateSalStdApi, action.payload);
    yield put(updateSalStdSuccess(result.data));
  } catch (err) {
    yield put(
      updateSalStdFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// deleteSalStd  - DELETE /api/salstd/{stdId} 급여기준 삭제
export const deleteSalStdApi = (stdId) =>
  api.delete(`${SALSTD_API_BASE}/${stdId}`);

export function* deleteSalStd(action) {
  try {
    yield call(deleteSalStdApi, action.payload);
    yield put(deleteSalStdSuccess(action.payload));
  } catch (err) {
    yield put(
      deleteSalStdFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchListSalStd() {
  yield takeLatest(listSalStdRequest.type, listSalStd);
}
function* watchFetchMySalStd() {
  yield takeLatest(fetchMySalStdRequest.type, fetchMySalStd);
}
function* watchCreateSalStd() {
  yield takeLatest(createSalStdRequest.type, createSalStd);
}
function* watchUpdateSalStd() {
  yield takeLatest(updateSalStdRequest.type, updateSalStd);
}
function* watchDeleteSalStd() {
  yield takeLatest(deleteSalStdRequest.type, deleteSalStd);
}

export default function* salStdSaga() {
  yield all([
    call(watchListSalStd),
    call(watchFetchMySalStd),
    call(watchCreateSalStd),
    call(watchUpdateSalStd),
    call(watchDeleteSalStd),
  ]);
}
