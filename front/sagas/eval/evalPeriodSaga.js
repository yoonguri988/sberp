// sagas/eval/evalPeriodSaga.js
import { all, call, put, takeLatest } from 'redux-saga/effects';
import api from '../../api/axios';
import {
    listPeriodRequest, listPeriodSuccess, listPeriodFailure,
    detailPeriodRequest, detailPeriodSuccess, detailPeriodFailure,
    createPeriodRequest, createPeriodSuccess, createPeriodFailure,
    updatePeriodRequest, updatePeriodSuccess, updatePeriodFailure,
    openPeriodRequest, openPeriodSuccess, openPeriodFailure,
    closePeriodRequest, closePeriodSuccess, closePeriodFailure,
    reportPeriodRequest, reportPeriodSuccess, reportPeriodFailure,
    reportStatusRequest, reportStatusSuccess,
    checkDuplicateRequest, checkDuplicateSuccess,
} from '../../reducers/eval/evalPeriodReducer';

const PERIOD_API_BASE = '/api/eval-period';

//////////////////////////////////////////////////////////////////////////////
// listPeriod  - GET /api/eval-period 회차 목록 조회
//////////////////////////////////////////////////////////////////////////////

export const listPeriodApi = (params) => api.get(PERIOD_API_BASE, { params });

export function* listPeriod(action) {
    try {
        const result = yield call(listPeriodApi, action.payload);
        yield put(listPeriodSuccess(result.data));
    } catch(err) {
        yield put(listPeriodFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// detailPeriod  - GET /api/eval-period/{periodId} 회차 상세 조회
//////////////////////////////////////////////////////////////////////////////

export const detailPeriodApi = (periodId) => api.get(`${PERIOD_API_BASE}/${periodId}`);

export function* detailPeriod(action) {
    try {
        const result = yield call(detailPeriodApi, action.payload);
        yield put(detailPeriodSuccess(result.data));
    } catch(err) {
        yield put(detailPeriodFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// createPeriod  - POST /api/eval-period 회차 등록
//////////////////////////////////////////////////////////////////////////////

export const createPeriodApi = (data) => api.post(PERIOD_API_BASE, data);

export function* createPeriod(action) {
    try {
        const result = yield call(createPeriodApi, action.payload);
        yield put(createPeriodSuccess(result.data));
    } catch(err) {
        yield put(createPeriodFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// updatePeriod  - PUT /api/eval-period/{periodId} 회차 수정
//////////////////////////////////////////////////////////////////////////////

export const updatePeriodApi = ({ periodId, ...data }) => api.put(`${PERIOD_API_BASE}/${periodId}`, data);

export function* updatePeriod(action) {
    try {
        const result = yield call(updatePeriodApi, action.payload);
        yield put(updatePeriodSuccess(result.data));
    } catch(err) {
        yield put(updatePeriodFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// openPeriod  - POST /api/eval-period/{periodId}/open 회차 열기
//////////////////////////////////////////////////////////////////////////////

export const openPeriodApi = (periodId) => api.post(`${PERIOD_API_BASE}/${periodId}/open`);

export function* openPeriod(action) {
    try {
        yield call(openPeriodApi, action.payload);
        yield put(openPeriodSuccess());
    } catch(err) {
        yield put(openPeriodFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// closePeriod  - POST /api/eval-period/{periodId}/close 회차 마감
//////////////////////////////////////////////////////////////////////////////

export const closePeriodApi = (periodId) => api.post(`${PERIOD_API_BASE}/${periodId}/close`);

export function* closePeriod(action) {
    try {
        yield call(closePeriodApi, action.payload);
        yield put(closePeriodSuccess());
    } catch(err) {
        yield put(closePeriodFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// reportPeriod  - POST /api/eval-period/{periodId}/report AI 분석 시작
//////////////////////////////////////////////////////////////////////////////

export const reportPeriodApi = (periodId) => api.post(`${PERIOD_API_BASE}/${periodId}/report`);

export function* reportPeriod(action) {
    try {
        yield call(reportPeriodApi, action.payload);
        yield put(reportPeriodSuccess());
    } catch(err) {
        yield put(reportPeriodFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// reportStatus  - GET /api/eval-period/{periodId}/status 진행률 조회
//////////////////////////////////////////////////////////////////////////////

export const reportStatusApi = (periodId) => api.get(`${PERIOD_API_BASE}/${periodId}/status`);

export function* reportStatus(action) {
    try {
        const result = yield call(reportStatusApi, action.payload);
        yield put(reportStatusSuccess(result.data));
    } catch(err) {
        console.error('진행률 조회 실패:', err);
    }
}

//////////////////////////////////////////////////////////////////////////////
// checkDuplicate  - GET /api/eval-period/check-duplicate 회차 중복 확인
//////////////////////////////////////////////////////////////////////////////

export const checkDuplicateApi = ({ evalYear, evalTerm }) =>
    api.get(`${PERIOD_API_BASE}/check-duplicate`, { params: { evalYear, evalTerm } });

export function* checkDuplicate(action) {
    try {
        const result = yield call(checkDuplicateApi, action.payload);
        yield put(checkDuplicateSuccess(result.data.duplicate));
    } catch(err) {
        console.error('중복 확인 실패:', err);
    }
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function* watchListPeriod()      { yield takeLatest(listPeriodRequest.type, listPeriod); }
function* watchDetailPeriod()    { yield takeLatest(detailPeriodRequest.type, detailPeriod); }
function* watchCreatePeriod()    { yield takeLatest(createPeriodRequest.type, createPeriod); }
function* watchUpdatePeriod()    { yield takeLatest(updatePeriodRequest.type, updatePeriod); }
function* watchOpenPeriod()      { yield takeLatest(openPeriodRequest.type, openPeriod); }
function* watchClosePeriod()     { yield takeLatest(closePeriodRequest.type, closePeriod); }
function* watchReportPeriod()    { yield takeLatest(reportPeriodRequest.type, reportPeriod); }
function* watchReportStatus()    { yield takeLatest(reportStatusRequest.type, reportStatus); }
function* watchCheckDuplicate()  { yield takeLatest(checkDuplicateRequest.type, checkDuplicate); }

export default function* evalPeriodSaga() {
    yield all([
        call(watchListPeriod),
        call(watchDetailPeriod),
        call(watchCreatePeriod),
        call(watchUpdatePeriod),
        call(watchOpenPeriod),
        call(watchClosePeriod),
        call(watchReportPeriod),
        call(watchReportStatus),
        call(watchCheckDuplicate),
    ]);
}
