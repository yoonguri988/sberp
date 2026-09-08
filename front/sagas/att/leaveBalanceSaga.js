// sagas/att/leaveBalanceSaga.js

import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";

import {
  fetchMyBalancesRequest, fetchMyBalancesSuccess, fetchMyBalancesFailure,
  fetchMyGrantsRequest, fetchMyGrantsSuccess, fetchMyGrantsFailure,
  fetchAllBalancesRequest, fetchAllBalancesSuccess, fetchAllBalancesFailure,
  fetchBalanceRequest, fetchBalanceSuccess, fetchBalanceFailure,
  fetchGrantHistoryRequest, fetchGrantHistorySuccess, fetchGrantHistoryFailure,
  calculateRequest, calculateSuccess, calculateFailure,
  deductRequest, deductSuccess, deductFailure,
  adjustRequest, adjustSuccess, adjustFailure,
  calculateAllRequest, calculateAllSuccess, calculateAllFailure,
} from "../../reducers/att/leaveBalanceReducer";

// ── API base 경로 ──
const LEAVE_API_BASE = "/api/att/leave";


//////////////////////////////////////////////////////////////////////////////
// fetchMyBalances  - GET /api/att/leave/balance/my 내 연차 현황 조회  ---
//////////////////////////////////////////////////////////////////////////////

export const fetchMyBalancesApi = () => api.get(`${LEAVE_API_BASE}/balance/my`);

export function* fetchMyBalances(action) {
  try {
    const result = yield call(fetchMyBalancesApi);
    yield put(fetchMyBalancesSuccess(result.data));
  } catch (err) {
    yield put(
      fetchMyBalancesFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// fetchMyBalances  -GET /api/att/leave/grant/my 내 연차 사용 이력 조회  ---
//////////////////////////////////////////////////////////////////////////////

export const fetchMyGrantsApi = () => api.get(`${LEAVE_API_BASE}/grant/my`);

export function* fetchMyGrants(action) {
  try {
    const result = yield call(fetchMyGrantsApi);
    yield put(fetchMyGrantsSuccess(result.data));
  } catch (err) {
    yield put(
      fetchMyGrantsFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// fetchAllBalances  - GET /api/att/leave/balance?year={year} 전체 사원 연차 조회
//////////////////////////////////////////////////////////////////////////////

export const fetchAllBalancesApi = ({ year, keyword }) =>
  api.get(`${LEAVE_API_BASE}/balance`, { params: { year, keyword } });

export function* fetchAllBalances(action) {
  try {
    // action.payload = { year: 2026, keyword: "name" }
    const result = yield call(fetchAllBalancesApi, action.payload);
    yield put(fetchAllBalancesSuccess(result.data));
  } catch (err) {
    yield put(
      fetchAllBalancesFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// fetchBalance  - GET /api/att/leave/balance/{empId}?year={year} 사원 단건 연차 조회
//////////////////////////////////////////////////////////////////////////////

export const fetchBalanceApi = ({ empId, year }) =>
  api.get(`${LEAVE_API_BASE}/balance/${empId}`, { params: { year } });

export function* fetchBalance(action) {
  try {
    // action.payload = { empId, year }
    const result = yield call(fetchBalanceApi, action.payload);
    yield put(fetchBalanceSuccess(result.data));
  } catch (err) {
    yield put(
      fetchBalanceFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// fetchGrantHistory  - GET /api/att/leave/grant/{empId} 부여/차감 이력 조회
//////////////////////////////////////////////////////////////////////////////

export const fetchGrantHistoryApi = (empId) =>
  api.get(`${LEAVE_API_BASE}/grant/${empId}`);

export function* fetchGrantHistory(action) {
  try {
    // action.payload = empId (숫자)
    const result = yield call(fetchGrantHistoryApi, action.payload);
    yield put(fetchGrantHistorySuccess(result.data));
  } catch (err) {
    yield put(
      fetchGrantHistoryFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// calculate  - POST /api/att/leave/calculate/{empId}?year={year} 연차 발생
//////////////////////////////////////////////////////////////////////////////

export const calculateApi = ({ empId, year }) =>
  api.post(`${LEAVE_API_BASE}/calculate/${empId}`, null, { params: { year } });

export function* calculate(action) {
  try {
    // action.payload = { empId, year }
    const result = yield call(calculateApi, action.payload);
    yield put(calculateSuccess(result.data));
  } catch (err) {
    yield put(
      calculateFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// deduct  - POST /api/att/leave/deduct 연차 차감
//////////////////////////////////////////////////////////////////////////////

export const deductApi = (data) => api.post(`${LEAVE_API_BASE}/deduct`, data);

export function* deduct(action) {
  try {
    // action.payload = { empId, amount, halfType, reason, year }
    const result = yield call(deductApi, action.payload);
    yield put(deductSuccess(result.data));
  } catch (err) {
    yield put(
      deductFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// adjust  - POST /api/att/leave/adjust 연차 수동 조정
//////////////////////////////////////////////////////////////////////////////

export const adjustApi = (data) => api.post(`${LEAVE_API_BASE}/adjust`, data);

export function* adjust(action) {
  try {
    // action.payload = { empId, amount, reason, year }
    const result = yield call(adjustApi, action.payload);
    yield put(adjustSuccess(result.data));
  } catch (err) {
    yield put(
      adjustFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// calculate-all  - POST /api/att/leave/calculate-all 연차 일괄 계산
//////////////////////////////////////////////////////////////////////////////

export const calculateAllApi = ({ year }) =>
  api.post(`${LEAVE_API_BASE}/calculate-all`, null, { params: { year } });

export function* calculateAll(action) {
  try {
    const result = yield call(calculateAllApi, action.payload);
    yield put(calculateAllSuccess(result.data));
  } catch (err) {
    yield put(
      calculateAllFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
//  watcher
//////////////////////////////////////////////////////////////////////////////

function* watchFetchMyBalances() {
  yield takeLatest(fetchMyBalancesRequest.type, fetchMyBalances);
}
function* watchFetchMyGrants() {
  yield takeLatest(fetchMyGrantsRequest.type, fetchMyGrants);
}
function* watchFetchAllBalances() {
  yield takeLatest(fetchAllBalancesRequest.type, fetchAllBalances);
}
function* watchFetchBalance() {
  yield takeLatest(fetchBalanceRequest.type, fetchBalance);
}
function* watchFetchGrantHistory() {
  yield takeLatest(fetchGrantHistoryRequest.type, fetchGrantHistory);
}
function* watchCalculate() {
  yield takeLatest(calculateRequest.type, calculate);
}
function* watchDeduct() {
  yield takeLatest(deductRequest.type, deduct);
}
function* watchAdjust() {
  yield takeLatest(adjustRequest.type, adjust);
}
function* watchCalculateAll() {
  yield takeLatest(calculateAllRequest.type, calculateAll);
}

//////////////////////////////////////////////////////////////////////////////
//  루트 saga export
//////////////////////////////////////////////////////////////////////////////

export default function* leaveBalanceSaga() {
  yield all([
    call(watchFetchMyBalances),
    call(watchFetchAllBalances),
    call(watchFetchBalance),
    call(watchFetchGrantHistory),
    call(watchCalculate),
    call(watchDeduct),
    call(watchAdjust),
    call(watchFetchMyGrants),
    call(watchCalculateAll),
  ]);
}
