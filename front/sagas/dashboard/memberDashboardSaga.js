import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
    fetchSummaryRequest, fetchSummarySuccess, fetchSummaryFailure,
} from "../../reducers/dashboard/memberDashboardReducer";

// 대시보드 요약 조회
// get /api/dashboard/member
export const fetchSummaryApi = () => api.get("/api/dashboard/member");

export function* fetchSummary() {
    try {
        const result = yield call(fetchSummaryApi);
        yield put(fetchSummarySuccess(result.data));
    } catch (err) {
        yield put(fetchSummaryFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchSummary() {
    yield takeLatest(fetchSummaryRequest.type, fetchSummary);
}

export default function* memberDashboardSaga() {
    yield all([
        call(watchFetchSummary),
    ]);
}