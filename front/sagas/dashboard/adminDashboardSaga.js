// sagas/dashboard/adminDashboardSaga.js

import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";

import {
  adminDashboardRequest, adminDashboardSuccess, adminDashboardFailure,
  adminRecentNoticesRequest, adminRecentNoticesSuccess, adminRecentNoticesFailure,
} from "../../reducers/dashboard/adminDashboardReducer";

const API_BASE = "/api/admin/dashboard";
const NOTICE_API = "/api/notice";

///////////////////////////////////////////////////////////
// 관리자용 대시보드 GET /api/admin/dashboard/summary
///////////////////////////////////////////////////////////

export const adminDashboardSummaryApi = () =>
  api.get(`${API_BASE}/summary`);

export function* fetchAdminDashboardSummary() {
  try {
    const result = yield call(adminDashboardSummaryApi);
    yield put(adminDashboardSuccess(result.data));
  } catch (err) {
    yield put(
      adminDashboardFailure(err.response?.data?.message || err.message)
    );
  }
}

///////////////////////////////////////////////////////////
// 공지사항 요약 GET /api/notice
///////////////////////////////////////////////////////////

export const adminRecentNoticesApi = () =>
  api.get(NOTICE_API, {
    params: {
      pstartno: 1,
      onepagelist: 5,   // 최근 5건만
      sortBy: "new",
    },
  });
 
export function* fetchAdminRecentNotices() {
  try {
    const result = yield call(adminRecentNoticesApi);
    // 응답 구조: { notices: [...], paging, totalCnt }
    const notices = result.data?.notices || [];
    yield put(adminRecentNoticesSuccess(notices));
  } catch (err) {
    yield put(adminRecentNoticesFailure());
  }
}

////////////////////////////////////////////////////////////////////

function* watchAdminDashboard(){ yield takeLatest(adminDashboardRequest.type, fetchAdminDashboardSummary) }
function* watchRecentNotices(){ yield takeLatest(adminRecentNoticesRequest.type, fetchAdminRecentNotices) }

export default function* adminDashboardSaga(){
	yield all([
	  call(watchAdminDashboard),
    call(watchRecentNotices),
	]);
}