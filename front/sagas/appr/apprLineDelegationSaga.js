import { all, call, put, takeLatest, takeLeading } from "redux-saga/effects";
import api from "../../api/axios";
import {
    createDelegReqRequest, createDelegReqSuccess, createDelegReqFailure,
    resetCreateStats,
    fetchMyDelegReqRequest, fetchMyDelegReqSuccess, fetchMyDelegReqFailure,
    fetchPendingDelegReqRequest, fetchPendingDelegReqSuccess, fetchPendingDelegReqFailure,
    approveDelegReqRequest, approveDelegReqSuccess, approveDelegReqFailure,
    rejectDelegReqRequest, rejectDelegReqSuccess, rejectDelegReqFailure,
    resetProcessState,
    fetchDelegHistoryRequest, fetchDelegHistorySuccess, fetchDelegHistoryFailure,
} from "../../reducers/appr/apprLineDelegationReducer";

const APPR_API_BASE = "/api/appr/lines";

// 위임/대결 요청 생성 (토큰 empId)
// post /appr/lines/requests
export const createDelegRequestApi = ({linId, newEmpId, reqReason}) =>
    api.post(`${APPR_API_BASE}/requests`, {linId, newEmpId, reqReason});

export function* createDelegRequest(action) {
    // {linId, newEmpId, reqReason}
    try {
        yield call(createDelegRequestApi, action.payload);
        yield put(createDelegReqSuccess());
    } catch (err) {
        yield put(createDelegReqFailure(err.response?.data?.error || err.message));
    }
}

function* watchCreateDelegRequest() {
    yield takeLeading(createDelegReqRequest.type, createDelegRequest);
}

// 본인 위임 요청 목록
// GET /appr/lines/requests/my
export const fetchMyDelegRequestsApi = () =>
    api.get(`${APPR_API_BASE}/requests/my`);

export function* fetchMyDelegRequests () {
    try {
        const result = yield call(fetchMyDelegRequestsApi);
        yield put(fetchMyDelegReqSuccess(result.data));
    } catch (err) {
        yield put(fetchMyDelegReqFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchMyDelegRequests() {
    yield takeLatest(fetchMyDelegReqRequest.type, fetchMyDelegRequests);
}

// 관리자 - 승인 대기중인 요청 목록
// get /appr/lines/requests/pending
export const fetchPendingDelegRequestsApi = () =>
    api.get(`${APPR_API_BASE}/requests/pending`);

export function* fetchPendingDelegRequests() {
    try {
        const result = yield call(fetchPendingDelegRequestsApi);
        yield put(fetchPendingDelegReqSuccess(result.data));
    } catch (err) {
        yield put(fetchPendingDelegReqFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchPendingDelegRequests() {
    yield takeLatest(fetchPendingDelegReqRequest.type, fetchPendingDelegRequests);
}

// 관리자 - 승인 처리
// post /appr/lines/requests/{reqId}/app
export const approveDelegRequestApi = ({reqId}) =>
    api.post(`${APPR_API_BASE}/requests/${reqId}/app`, null);

export function* approveDelegRequest(action) {
    try {
        yield call(approveDelegRequestApi, action.payload);
        yield put(approveDelegReqSuccess());
    } catch (err) {
        yield put(approveDelegReqFailure(err.response?.data?.error || err.message));
    }
}

function* watchApproveDelegRequest() {
    yield takeLeading(approveDelegReqRequest.type, approveDelegRequest);
}

// 관리자 - 반려 처리
// post /appr/lines/requests/{reqId}/rej
export const rejectDelegRequestApi = ({reqId}) =>
    api.post(`${APPR_API_BASE}/requests/${reqId}/rej`, null);

export function* rejectDelegRequest(action) {
    try {
        yield call(rejectDelegRequestApi, action.payload);
        yield put(rejectDelegReqSuccess());
    } catch (err) {
        yield put(rejectDelegReqFailure(err.response?.data?.error || err.message));
    }
}

function* watchRejectDelegRequest() {
    yield takeLeading(rejectDelegReqRequest.type, rejectDelegRequest);
}

// 관리자 - 처리이력 조회
export const fetchDelegHistoryApi = ({cond, page, size}) =>
    api.get(`${APPR_API_BASE}/requests/history`, {
        params: {
            ...cond,
            page,
            size,
        },
    });

export function* fetchDelegHistory(action) {
    //{cond: {reqStatus, reqEmpId, startDate, endDate}, page, size}
    try {
        const result = yield call(fetchDelegHistoryApi, action.payload);
        yield put(fetchDelegHistorySuccess(result.data));
    } catch (err) {
        yield put(fetchDelegHistoryFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchDelegHistory() {
    yield takeLatest(fetchDelegHistoryRequest.type, fetchDelegHistory);
}

export default function* apprLineDelegationSaga() {
    yield all([
       call(watchCreateDelegRequest),
       call(watchFetchMyDelegRequests),
       call(watchFetchPendingDelegRequests),
       call(watchApproveDelegRequest),
       call(watchRejectDelegRequest),
       call(watchFetchDelegHistory),
    ]);
}
