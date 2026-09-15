// sagas/sal/salAnalyticsSaga.js
// 급여 분석 대시보드 - Spring이 아니라 별도 Django 분석 서비스를 호출한다.
//
// 로그인/JWT는 여전히 Spring이 발급한 걸 그대로 쓴다 - api.js의 요청 인터셉터가
// Authorization 헤더를 이미 붙여주므로, 이 요청도 그 인스턴스를 그대로 쓰되
// baseURL만 이번 호출 한정으로 Django 서비스 주소로 덮어쓴다. (axios는 요청별
// baseURL이 인스턴스 기본값보다 우선하고, 401 발생 시 응답 인터셉터의 refresh는
// 여전히 Spring(/auth/refresh, 인스턴스 기본 baseURL)으로 가서 새 토큰을 받은 뒤
// 원래 요청(Django 주소)을 그대로 재시도한다 - 어느 쪽을 호출했는지와 무관하게
// 토큰 재발급 로직 하나만 유지하면 된다.)
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  fetchSalAnalyticsRequest,
  fetchSalAnalyticsSuccess,
  fetchSalAnalyticsFailure,
} from "../../reducers/sal/salAnalyticsReducer";

// Django 분석 서비스 주소. 로컬 개발 기본값은 8000번 포트(Django manage.py runserver 기본값).
const ANALYTICS_API_BASE_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_API_BASE_URL || "http://localhost:8000";

export const fetchSalAnalyticsApi = ({ months = 6 } = {}) =>
  api.get("/api/analytics/salary/summary", {
    baseURL: ANALYTICS_API_BASE_URL,
    params: { months },
  });

export function* fetchSalAnalytics(action) {
  try {
    const result = yield call(fetchSalAnalyticsApi, action.payload);
    yield put(fetchSalAnalyticsSuccess(result.data));
  } catch (err) {
    yield put(
      fetchSalAnalyticsFailure(
        err.response?.data?.detail || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchFetchSalAnalytics() {
  yield takeLatest(fetchSalAnalyticsRequest.type, fetchSalAnalytics);
}

export default function* salAnalyticsSaga() {
  yield all([call(watchFetchSalAnalytics)]);
}
