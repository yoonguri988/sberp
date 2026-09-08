import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
    fetchApprLogRequest, fetchApprLogSuccess, fetchApprLogFailure,
} from "../../reducers/appr/apprLogReducer";

const APPR_LOG_API_BASE = "/api/appr/logs";

// 관리자 - 결재선 감사로그 조회
// get /appr/logs
export const fetchApprLogApi = ({cond, page, size}) =>
    api.get(APPR_LOG_API_BASE, {
        params: {
            ...cond,
            page,
            size,
        },
    });

export function* fetchApprLog(action) {
    //{cond: {docId, empId, startDate, endDate}, page, size}
    try {
        const result = yield call(fetchApprLogApi, action.payload);
        yield put(fetchApprLogSuccess(result.data));
    } catch (err) {
        yield put(fetchApprLogFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchApprLog() {
    yield takeLatest(fetchApprLogRequest.type, fetchApprLog);
}

export default function* apprLogSaga() {
    yield all([
        call(watchFetchApprLog),
    ]);
}