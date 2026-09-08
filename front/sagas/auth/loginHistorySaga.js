// sagas/auth/loginHistorySaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  fetchLoginHistoryListRequest,
  fetchLoginHistoryListSuccess,
  fetchLoginHistoryListFailure,
  fetchLoginHistoryStatsRequest,
  fetchLoginHistoryStatsSuccess,
  fetchLoginHistoryStatsFailure,
} from "../../reducers/auth/loginHistoryReducer";

const BASE = "/api/admin/login-history";

export const fetchLoginHistoryListApi = (params) => api.get(BASE, { params });
export function* fetchLoginHistoryList(action) {
  try {
    const res = yield call(fetchLoginHistoryListApi, action.payload);
    yield put(fetchLoginHistoryListSuccess(res.data));
  } catch (err) {
    yield put(
      fetchLoginHistoryListFailure(
        err.response?.data?.error || "로그인 이력 조회에 실패했습니다.",
      ),
    );
  }
}

export const fetchLoginHistoryStatsApi = (params) =>
  api.get(`${BASE}/stats`, { params });
export function* fetchLoginHistoryStats(action) {
  try {
    const res = yield call(fetchLoginHistoryStatsApi, action.payload);
    yield put(fetchLoginHistoryStatsSuccess(res.data));
  } catch (err) {
    yield put(
      fetchLoginHistoryStatsFailure(
        err.response?.data?.error || "로그인 이력 통계 조회에 실패했습니다.",
      ),
    );
  }
}

function* watchFetchLoginHistoryList() {
  yield takeLatest(fetchLoginHistoryListRequest.type, fetchLoginHistoryList);
}
function* watchFetchLoginHistoryStats() {
  yield takeLatest(fetchLoginHistoryStatsRequest.type, fetchLoginHistoryStats);
}

export default function* loginHistorySaga() {
  yield all([
    call(watchFetchLoginHistoryList),
    call(watchFetchLoginHistoryStats),
  ]);
}
