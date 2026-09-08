// sagas/sal/salPaySaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  listSalPayRequest,
  listSalPaySuccess,
  listSalPayFailure,
  fetchMyPaymentsRequest,
  fetchMyPaymentsSuccess,
  fetchMyPaymentsFailure,
  fetchItemCodesRequest,
  fetchItemCodesSuccess,
  fetchItemCodesFailure,
  createSalPayRequest,
  createSalPaySuccess,
  createSalPayFailure,
  recalcSalPayRequest,
  recalcSalPaySuccess,
  recalcSalPayFailure,
  adjustSalPayItemRequest,
  adjustSalPayItemSuccess,
  adjustSalPayItemFailure,
  changeSalPayStatusRequest,
  changeSalPayStatusSuccess,
  changeSalPayStatusFailure,
  deleteSalPayRequest,
  deleteSalPaySuccess,
  deleteSalPayFailure,
} from "../../reducers/sal/salPayReducer";

const SALPAY_API_BASE = "/api/salpay";

// listSalPay  - GET /api/salpay 급여지급 전체 조회 (검색+페이지네이션)
//   params: { empName, department, paymentMonth, status, page(0-based), size }
export const listSalPayApi = ({
  empName,
  department,
  paymentMonth,
  status,
  page = 0,
  size = 10,
} = {}) =>
  api.get(SALPAY_API_BASE, {
    params: {
      ...(empName ? { empName } : {}),
      ...(department ? { department } : {}),
      ...(paymentMonth ? { paymentMonth } : {}),
      ...(status ? { status } : {}),
      page,
      size,
    },
  });
export function* listSalPay(action) {
  try {
    const result = yield call(listSalPayApi, action.payload);
    yield put(listSalPaySuccess(result.data));
  } catch (err) {
    yield put(listSalPayFailure(err.response?.data?.error || err.response?.data?.message || err.message));
  }
}

// fetchMyPayments  - GET /api/salpay/me 본인 급여명세서 조회
//   params: { page(0-based), size }
export const fetchMyPaymentsApi = ({ page = 0, size = 10 } = {}) =>
  api.get(`${SALPAY_API_BASE}/me`, { params: { page, size } });
export function* fetchMyPayments(action) {
  try {
    const result = yield call(fetchMyPaymentsApi, action.payload);
    yield put(fetchMyPaymentsSuccess(result.data));
  } catch (err) {
    yield put(
      fetchMyPaymentsFailure(err.response?.data?.error || err.response?.data?.message || err.message),
    );
  }
}

// fetchItemCodes  - GET /api/salpay/item-codes 수당/공제 항목 코드 조회
export const fetchItemCodesApi = () => api.get(`${SALPAY_API_BASE}/item-codes`);
export function* fetchItemCodes() {
  try {
    const result = yield call(fetchItemCodesApi);
    yield put(fetchItemCodesSuccess(result.data));
  } catch (err) {
    yield put(
      fetchItemCodesFailure(err.response?.data?.error || err.response?.data?.message || err.message),
    );
  }
}

// createSalPay  - POST /api/salpay 급여 등록(산정)
//   data: { empId, payMonth }
export const createSalPayApi = (data) => api.post(SALPAY_API_BASE, data);
export function* createSalPay(action) {
  try {
    const result = yield call(createSalPayApi, action.payload);
    yield put(createSalPaySuccess(result.data));
  } catch (err) {
    yield put(createSalPayFailure(err.response?.data?.error || err.response?.data?.message || err.message));
  }
}

// recalcSalPay  - PUT /api/salpay/{payId} 급여 재산정 (대기 상태 건만)
//   data: { payId, reason }
export const recalcSalPayApi = ({ payId, ...data }) =>
  api.put(`${SALPAY_API_BASE}/${payId}`, data);
export function* recalcSalPay(action) {
  try {
    const result = yield call(recalcSalPayApi, action.payload);
    yield put(recalcSalPaySuccess(result.data));
  } catch (err) {
    yield put(recalcSalPayFailure(err.response?.data?.error || err.response?.data?.message || err.message));
  }
}

// adjustSalPayItem  - PATCH /api/salpay/{payId}/items/{itemId} 개별 항목 수동 조정
//   data: { payId, itemId, amt, reason }
export const adjustSalPayItemApi = ({ payId, itemId, ...data }) =>
  api.patch(`${SALPAY_API_BASE}/${payId}/items/${itemId}`, data);
export function* adjustSalPayItem(action) {
  try {
    const result = yield call(adjustSalPayItemApi, action.payload);
    yield put(adjustSalPayItemSuccess(result.data));
  } catch (err) {
    yield put(
      adjustSalPayItemFailure(err.response?.data?.error || err.response?.data?.message || err.message),
    );
  }
}

// changeSalPayStatus  - PATCH /api/salpay/{payId}/status 지급 상태 변경
//   data: { payId, stat, rejRsn }
export const changeSalPayStatusApi = ({ payId, ...data }) =>
  api.patch(`${SALPAY_API_BASE}/${payId}/status`, data);

export function* changeSalPayStatus(action) {
  try {
    const result = yield call(changeSalPayStatusApi, action.payload);
    yield put(changeSalPayStatusSuccess(result.data));
  } catch (err) {
    yield put(
      changeSalPayStatusFailure(err.response?.data?.error || err.response?.data?.message || err.message),
    );
  }
}

// deleteSalPay  - DELETE /api/salpay/{payId} 급여 삭제(취소)
export const deleteSalPayApi = (payId) =>
  api.delete(`${SALPAY_API_BASE}/${payId}`);
export function* deleteSalPay(action) {
  try {
    yield call(deleteSalPayApi, action.payload);
    yield put(deleteSalPaySuccess(action.payload));
  } catch (err) {
    yield put(deleteSalPayFailure(err.response?.data?.error || err.response?.data?.message || err.message));
  }
}

function* watchListSalPay() {
  yield takeLatest(listSalPayRequest.type, listSalPay);
}
function* watchFetchMyPayments() {
  yield takeLatest(fetchMyPaymentsRequest.type, fetchMyPayments);
}
function* watchFetchItemCodes() {
  yield takeLatest(fetchItemCodesRequest.type, fetchItemCodes);
}
function* watchCreateSalPay() {
  yield takeLatest(createSalPayRequest.type, createSalPay);
}
function* watchRecalcSalPay() {
  yield takeLatest(recalcSalPayRequest.type, recalcSalPay);
}
function* watchAdjustSalPayItem() {
  yield takeLatest(adjustSalPayItemRequest.type, adjustSalPayItem);
}
function* watchChangeSalPayStatus() {
  yield takeLatest(changeSalPayStatusRequest.type, changeSalPayStatus);
}
function* watchDeleteSalPay() {
  yield takeLatest(deleteSalPayRequest.type, deleteSalPay);
}

export default function* salPaySaga() {
  yield all([
    call(watchListSalPay),
    call(watchFetchMyPayments),
    call(watchFetchItemCodes),
    call(watchCreateSalPay),
    call(watchRecalcSalPay),
    call(watchAdjustSalPayItem),
    call(watchChangeSalPayStatus),
    call(watchDeleteSalPay),
  ]);
}
