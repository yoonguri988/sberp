// sagas/sal/salPolicySaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  fetchRatePolicyRequest,
  fetchRatePolicySuccess,
  fetchRatePolicyFailure,
  createRatePolicyRequest,
  createRatePolicySuccess,
  createRatePolicyFailure,
  fetchTaxBracketRequest,
  fetchTaxBracketSuccess,
  fetchTaxBracketFailure,
  createTaxBracketRequest,
  createTaxBracketSuccess,
  createTaxBracketFailure,
  fetchMealPolicyRequest,
  fetchMealPolicySuccess,
  fetchMealPolicyFailure,
  createMealPolicyRequest,
  createMealPolicySuccess,
  createMealPolicyFailure,
  fetchPosAllowanceRequest,
  fetchPosAllowanceSuccess,
  fetchPosAllowanceFailure,
  createPosAllowanceRequest,
  createPosAllowanceSuccess,
  createPosAllowanceFailure,
} from "../../reducers/sal/salPolicyReducer";

const RATE_API_BASE = "/api/calc/salrateplcy";
const TAX_BRACKET_API_BASE = "/api/calc/salinctaxbrkt";
const MEAL_POLICY_API_BASE = "/api/calc/salmealalwplcy";
const POS_ALLOWANCE_API_BASE = "/api/calc/salposalw";

// 4대보험 요율 정책  - GET/POST /api/calc/salrateplcy (ROOT)
export const fetchRatePolicyApi = () => api.get(RATE_API_BASE);
export function* fetchRatePolicy() {
  try {
    const result = yield call(fetchRatePolicyApi);
    yield put(fetchRatePolicySuccess(result.data));
  } catch (err) {
    yield put(
      fetchRatePolicyFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

export const createRatePolicyApi = (data) => api.post(RATE_API_BASE, data);
export function* createRatePolicy(action) {
  try {
    yield call(createRatePolicyApi, action.payload);
    yield put(createRatePolicySuccess());
  } catch (err) {
    yield put(
      createRatePolicyFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// 소득세 간이 구간표  - GET/POST /api/calc/salinctaxbrkt (ROOT)
export const fetchTaxBracketApi = () => api.get(TAX_BRACKET_API_BASE);
export function* fetchTaxBracket() {
  try {
    const result = yield call(fetchTaxBracketApi);
    yield put(fetchTaxBracketSuccess(result.data));
  } catch (err) {
    yield put(
      fetchTaxBracketFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

export const createTaxBracketApi = (data) =>
  api.post(TAX_BRACKET_API_BASE, data);
export function* createTaxBracket(action) {
  try {
    yield call(createTaxBracketApi, action.payload);
    yield put(createTaxBracketSuccess());
  } catch (err) {
    yield put(
      createTaxBracketFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// 식대 정책  - GET/POST /api/calc/salmealalwplcy (ROLE_ADMIN)
export const fetchMealPolicyApi = () => api.get(MEAL_POLICY_API_BASE);
export function* fetchMealPolicy() {
  try {
    const result = yield call(fetchMealPolicyApi);
    yield put(fetchMealPolicySuccess(result.data));
  } catch (err) {
    yield put(
      fetchMealPolicyFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

export const createMealPolicyApi = (data) =>
  api.post(MEAL_POLICY_API_BASE, data);
export function* createMealPolicy(action) {
  try {
    yield call(createMealPolicyApi, action.payload);
    yield put(createMealPolicySuccess());
  } catch (err) {
    yield put(
      createMealPolicyFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// 직책수당 정책  - GET/POST /api/calc/salposalw (ROLE_ADMIN)
export const fetchPosAllowanceApi = () => api.get(POS_ALLOWANCE_API_BASE);
export function* fetchPosAllowance() {
  try {
    const result = yield call(fetchPosAllowanceApi);
    yield put(fetchPosAllowanceSuccess(result.data));
  } catch (err) {
    yield put(
      fetchPosAllowanceFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

export const createPosAllowanceApi = (data) =>
  api.post(POS_ALLOWANCE_API_BASE, data);
export function* createPosAllowance(action) {
  try {
    yield call(createPosAllowanceApi, action.payload);
    yield put(createPosAllowanceSuccess());
  } catch (err) {
    yield put(
      createPosAllowanceFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchFetchRatePolicy() {
  yield takeLatest(fetchRatePolicyRequest.type, fetchRatePolicy);
}
function* watchCreateRatePolicy() {
  yield takeLatest(createRatePolicyRequest.type, createRatePolicy);
}
function* watchFetchTaxBracket() {
  yield takeLatest(fetchTaxBracketRequest.type, fetchTaxBracket);
}
function* watchCreateTaxBracket() {
  yield takeLatest(createTaxBracketRequest.type, createTaxBracket);
}
function* watchFetchMealPolicy() {
  yield takeLatest(fetchMealPolicyRequest.type, fetchMealPolicy);
}
function* watchCreateMealPolicy() {
  yield takeLatest(createMealPolicyRequest.type, createMealPolicy);
}
function* watchFetchPosAllowance() {
  yield takeLatest(fetchPosAllowanceRequest.type, fetchPosAllowance);
}
function* watchCreatePosAllowance() {
  yield takeLatest(createPosAllowanceRequest.type, createPosAllowance);
}

export default function* salPolicySaga() {
  yield all([
    call(watchFetchRatePolicy),
    call(watchCreateRatePolicy),
    call(watchFetchTaxBracket),
    call(watchCreateTaxBracket),
    call(watchFetchMealPolicy),
    call(watchCreateMealPolicy),
    call(watchFetchPosAllowance),
    call(watchCreatePosAllowance),
  ]);
}
