// sagas/att/attSaga.js

import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";

import {
  listAttRequest,
  listAttSuccess,
  listAttFailure,
  myAttRequest,
  myAttSuccess,
  myAttFailure,
  checkInRequest,
  checkInSuccess,
  checkInFailure,
  checkOutRequest,
  checkOutSuccess,
  checkOutFailure,
  editAttRequest,
  editAttSuccess,
  editAttFailure,
  createAttRequest,
  createAttSuccess,
  createAttFailure,
} from "../../reducers/att/attReducer";

const ATT_API_BASE = "/api/att";

//////////////////////////////////////////////////////////////////////////////
// listAtt  - GET /api/att?startDate=... 근태 목록 조회 ---
//////////////////////////////////////////////////////////////////////////////

export const listAttApi = (params) => {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== "" && v !== null && v !== undefined) clean[k] = v;
  });
  return api.get(ATT_API_BASE, { params: clean });
};

export function* listAtt(action) {
  try {
    // action.payload = { startDate, endDate, start, end }
    const result = yield call(listAttApi, action.payload);

    yield put(
      listAttSuccess({
        list: result.data,
        paging: null,
      }),
    );
  } catch (err) {
    yield put(
      listAttFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// myAtt  - GET /api/att/my 내 근태 이력 조회 ---
//////////////////////////////////////////////////////////////////////////////

export const myAttApi = () => api.get(`${ATT_API_BASE}/my`);

export function* myAtt() {
  try {
    const result = yield call(myAttApi);
    // result.data = AttendanceResponse[] 배열 그대로
    yield put(myAttSuccess(result.data));
  } catch (err) {
    yield put(
      myAttFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// checkIn  - POST /api/att/check-in 출근 ---
//////////////////////////////////////////////////////////////////////////////

export const checkInApi = () => api.post(`${ATT_API_BASE}/check-in`);

export function* checkIn() {
  try {
    const result = yield call(checkInApi);
    yield put(checkInSuccess(result.data));
  } catch (err) {
    yield put(
      checkInFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// checkOut  - PUT /api/att/check-out 퇴근 ---
//////////////////////////////////////////////////////////////////////////////

export const checkOutApi = () => api.put(`${ATT_API_BASE}/check-out`);

export function* checkOut() {
  try {
    const result = yield call(checkOutApi);
    yield put(checkOutSuccess(result.data));
  } catch (err) {
    yield put(
      checkOutFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// createAtt  - POST /api/att/admin 근태 등록  ---
//////////////////////////////////////////////////////////////////////////////
export const createAttApi = (data) => api.post(`${ATT_API}/admin`, data);

export function* createAtt(action) {
  try {
    // action.payload = { empId, attDate, checkIn, checkOut, attStatus }
    const result = yield call(createAttApi, action.payload);
    yield put(createAttSuccess(result.data));
  } catch (err) {
    yield put(
      createAttFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
// editAtt  - PUT /api/att/{attId} 근태 수정  ---
//////////////////////////////////////////////////////////////////////////////

export const editAttApi = ({ attId, ...data }) =>
  api.put(`${ATT_API_BASE}/${attId}`, data);

export function* editAtt(action) {
  try {
    // action.payload = { attId, checkInTime, checkOutTime, attStatus }
    const result = yield call(editAttApi, action.payload);
    yield put(editAttSuccess(result.data));
  } catch (err) {
    yield put(
      editAttFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

//////////////////////////////////////////////////////////////////////////////
//  watcher
//////////////////////////////////////////////////////////////////////////////

function* watchListAtt() {
  yield takeLatest(listAttRequest.type, listAtt);
}
function* watchMyAtt() {
  yield takeLatest(myAttRequest.type, myAtt);
}
function* watchCheckIn() {
  yield takeLatest(checkInRequest.type, checkIn);
}
function* watchCheckOut() {
  yield takeLatest(checkOutRequest.type, checkOut);
}
function* watchEditAtt() {
  yield takeLatest(editAttRequest.type, editAtt);
}
function* watchCreateAtt() {
  yield takeLatest(createAttRequest.type, createAtt);
}

//////////////////////////////////////////////////////////////////////////////
//  루트 saga export
//////////////////////////////////////////////////////////////////////////////

export default function* attSaga() {
  yield all([
    call(watchListAtt),
    call(watchMyAtt),
    call(watchCheckIn),
    call(watchCheckOut),
    call(watchEditAtt),
    call(watchCreateAtt),
  ]);
}
