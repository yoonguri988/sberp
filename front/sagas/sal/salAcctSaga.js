// sagas/sal/salAcctSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  fetchMyAcctRequest,
  fetchMyAcctSuccess,
  fetchMyAcctFailure,
  registerMyAcctRequest,
  registerMyAcctSuccess,
  registerMyAcctFailure,
  updateMyAcctRequest,
  updateMyAcctSuccess,
  updateMyAcctFailure,
  fetchAcctByEmpIdRequest,
  fetchAcctByEmpIdSuccess,
  fetchAcctByEmpIdFailure,
  updateAcctByAdminRequest,
  updateAcctByAdminSuccess,
  updateAcctByAdminFailure,
} from "../../reducers/sal/salAcctReducer";

const SALACCT_API_BASE = "/api/salacct";

// fetchMyAcct  - GET /api/salacct/me 본인 급여 수령 계좌 조회
export const fetchMyAcctApi = () => api.get(`${SALACCT_API_BASE}/me`);
export function* fetchMyAcct() {
  try {
    const result = yield call(fetchMyAcctApi);
    yield put(fetchMyAcctSuccess(result.data));
  } catch (err) {
    yield put(fetchMyAcctFailure(err.response?.data?.error || err.response?.data?.message || err.message));
  }
}

// registerMyAcct  - POST /api/salacct 급여 수령 계좌 등록 (직원당 1건, empId는 서버가 토큰으로 세팅)
//   data: { bankName, acctNo, hldrName }
export const registerMyAcctApi = (data) => api.post(SALACCT_API_BASE, data);
export function* registerMyAcct(action) {
  try {
    const result = yield call(registerMyAcctApi, action.payload);
    yield put(registerMyAcctSuccess(result.data));
  } catch (err) {
    yield put(
      registerMyAcctFailure(err.response?.data?.error || err.response?.data?.message || err.message),
    );
  }
}

// updateMyAcct  - PUT /api/salacct/me 본인 급여 수령 계좌 수정
export const updateMyAcctApi = (data) =>
  api.put(`${SALACCT_API_BASE}/me`, data);
export function* updateMyAcct(action) {
  try {
    const result = yield call(updateMyAcctApi, action.payload);
    yield put(updateMyAcctSuccess(result.data));
  } catch (err) {
    yield put(updateMyAcctFailure(err.response?.data?.error || err.response?.data?.message || err.message));
  }
}

// fetchAcctByEmpId  - GET /api/salacct/{empId} 특정 직원 계좌 조회 (ROLE_ADMIN)
export const fetchAcctByEmpIdApi = (empId) =>
  api.get(`${SALACCT_API_BASE}/${empId}`);

export function* fetchAcctByEmpId(action) {
  try {
    const result = yield call(fetchAcctByEmpIdApi, action.payload);
    yield put(fetchAcctByEmpIdSuccess(result.data));
  } catch (err) {
    yield put(
      fetchAcctByEmpIdFailure(err.response?.data?.error || err.response?.data?.message || err.message),
    );
  }
}

// updateAcctByAdmin  - PUT /api/salacct/{empId} 특정 직원 계좌 수정 (ROLE_ADMIN)
//   data: { empId, bankName, acctNo, hldrName }
export const updateAcctByAdminApi = ({ empId, ...data }) =>
  api.put(`${SALACCT_API_BASE}/${empId}`, data);

export function* updateAcctByAdmin(action) {
  try {
    const result = yield call(updateAcctByAdminApi, action.payload);
    yield put(updateAcctByAdminSuccess(result.data));
  } catch (err) {
    yield put(
      updateAcctByAdminFailure(err.response?.data?.error || err.response?.data?.message || err.message),
    );
  }
}

function* watchFetchMyAcct() {
  yield takeLatest(fetchMyAcctRequest.type, fetchMyAcct);
}
function* watchRegisterMyAcct() {
  yield takeLatest(registerMyAcctRequest.type, registerMyAcct);
}
function* watchUpdateMyAcct() {
  yield takeLatest(updateMyAcctRequest.type, updateMyAcct);
}
function* watchFetchAcctByEmpId() {
  yield takeLatest(fetchAcctByEmpIdRequest.type, fetchAcctByEmpId);
}
function* watchUpdateAcctByAdmin() {
  yield takeLatest(updateAcctByAdminRequest.type, updateAcctByAdmin);
}

export default function* salAcctSaga() {
  yield all([
    call(watchFetchMyAcct),
    call(watchRegisterMyAcct),
    call(watchUpdateMyAcct),
    call(watchFetchAcctByEmpId),
    call(watchUpdateAcctByAdmin),
  ]);
}
