// sagas/eval/evalSaga.js
import { all, call, put, takeLatest } from 'redux-saga/effects';
import api from '../../api/axios';
import {
    dashboardEvalRequest, dashboardEvalSuccess, dashboardEvalFailure,
    detailEvalRequest, detailEvalSuccess, detailEvalFailure,
    draftEvalRequest, draftEvalSuccess, draftEvalFailure,
    submitEvalRequest, submitEvalSuccess, submitEvalFailure,
} from '../../reducers/eval/evalReducer';

const EVAL_API_BASE = '/api/eval';

//////////////////////////////////////////////////////////////////////////////
// dashboardEval  - GET /api/eval/dashboard 평가 대시보드
//   periodId 없이 호출 → { openPeriods: [...] }
//   periodId 지정     → { period, targets, submittedCount, totalCount }
//////////////////////////////////////////////////////////////////////////////

export const dashboardEvalApi = (periodId) =>
    api.get(`${EVAL_API_BASE}/dashboard`, { params: periodId ? { periodId } : {} });

export function* dashboardEval(action) {
    try {
        const result = yield call(dashboardEvalApi, action.payload);
        yield put(dashboardEvalSuccess(result.data));
    } catch(err) {
        yield put(dashboardEvalFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// detailEval  - GET /api/eval/{evalId} 평가 상세 조회
//////////////////////////////////////////////////////////////////////////////

export const detailEvalApi = (evalId) => api.get(`${EVAL_API_BASE}/${evalId}`);

export function* detailEval(action) {
    try {
        const result = yield call(detailEvalApi, action.payload);
        yield put(detailEvalSuccess(result.data));
    } catch(err) {
        yield put(detailEvalFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// draftEval  - POST /api/eval/draft 평가 임시저장
//////////////////////////////////////////////////////////////////////////////

export const draftEvalApi = (data) => api.post(`${EVAL_API_BASE}/draft`, data);

export function* draftEval(action) {
    try {
        yield call(draftEvalApi, action.payload);
        yield put(draftEvalSuccess());
    } catch(err) {
        yield put(draftEvalFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// submitEval  - POST /api/eval/submit 평가 제출
//////////////////////////////////////////////////////////////////////////////

export const submitEvalApi = (data) => api.post(`${EVAL_API_BASE}/submit`, data);

export function* submitEval(action) {
    try {
        yield call(submitEvalApi, action.payload);
        yield put(submitEvalSuccess());
    } catch(err) {
        yield put(submitEvalFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function* watchDashboardEval() { yield takeLatest(dashboardEvalRequest.type, dashboardEval); }
function* watchDetailEval()    { yield takeLatest(detailEvalRequest.type, detailEval); }
function* watchDraftEval()     { yield takeLatest(draftEvalRequest.type, draftEval); }
function* watchSubmitEval()    { yield takeLatest(submitEvalRequest.type, submitEval); }

export default function* evalSaga() {
    yield all([
        call(watchDashboardEval),
        call(watchDetailEval),
        call(watchDraftEval),
        call(watchSubmitEval),
    ]);
}
