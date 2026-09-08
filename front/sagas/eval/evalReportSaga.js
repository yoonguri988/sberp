// sagas/eval/evalReportSaga.js
import { all, call, put, takeLatest } from 'redux-saga/effects';
import api from '../../api/axios';
import {
    listReportRequest, listReportSuccess, listReportFailure,
    detailReportRequest, detailReportSuccess, detailReportFailure,
    myReportRequest, myReportSuccess, myReportFailure,
    generateReportRequest, generateReportSuccess, generateReportFailure,
    regenerateReportRequest, regenerateReportSuccess, regenerateReportFailure,
} from '../../reducers/eval/evalReportReducer';

const REPORT_API_BASE = '/api/eval-report';

//////////////////////////////////////////////////////////////////////////////
// listReport  - GET /api/eval-report 회차별 리포트 목록 조회
//   params: { periodId(필수), keyword, deptId, page }
//////////////////////////////////////////////////////////////////////////////

export const listReportApi = (params) => api.get(REPORT_API_BASE, { params });

export function* listReport(action) {
    try {
        const result = yield call(listReportApi, action.payload);
        yield put(listReportSuccess(result.data));
    } catch(err) {
        yield put(listReportFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// detailReport  - GET /api/eval-report/{reportId} 리포트 상세 조회
//////////////////////////////////////////////////////////////////////////////

export const detailReportApi = (reportId) => api.get(`${REPORT_API_BASE}/${reportId}`);

export function* detailReport(action) {
    try {
        const result = yield call(detailReportApi, action.payload);
        yield put(detailReportSuccess(result.data));
    } catch(err) {
        yield put(detailReportFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// myReport  - GET /api/eval-report/my 내 리포트 이력
//////////////////////////////////////////////////////////////////////////////

export const myReportApi = () => api.get(`${REPORT_API_BASE}/my`);

export function* myReport() {
    try {
        const result = yield call(myReportApi);
        yield put(myReportSuccess(result.data));
    } catch(err) {
        yield put(myReportFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// generateReport  - POST /api/eval-report/generate 회차 전체 리포트 생성
//   Controller: @RequestParam("periodId") → query parameter로 보내야 함
//////////////////////////////////////////////////////////////////////////////

export const generateReportApi = (periodId) =>
    api.post(`${REPORT_API_BASE}/generate`, null, { params: { periodId } });

export function* generateReport(action) {
    try {
        yield call(generateReportApi, action.payload);
        yield put(generateReportSuccess());
    } catch(err) {
        yield put(generateReportFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// regenerateReport  - POST /api/eval-report/regenerate 특정 사원 리포트 재생성
//   Controller: @RequestParam("periodId") + @RequestParam("empId")
//////////////////////////////////////////////////////////////////////////////

export const regenerateReportApi = ({ periodId, empId }) =>
    api.post(`${REPORT_API_BASE}/regenerate`, null, { params: { periodId, empId } });

export function* regenerateReport(action) {
    try {
        yield call(regenerateReportApi, action.payload);
        yield put(regenerateReportSuccess());
    } catch(err) {
        yield put(regenerateReportFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function* watchListReport()       { yield takeLatest(listReportRequest.type, listReport); }
function* watchDetailReport()     { yield takeLatest(detailReportRequest.type, detailReport); }
function* watchMyReport()         { yield takeLatest(myReportRequest.type, myReport); }
function* watchGenerateReport()   { yield takeLatest(generateReportRequest.type, generateReport); }
function* watchRegenerateReport() { yield takeLatest(regenerateReportRequest.type, regenerateReport); }

export default function* evalReportSaga() {
    yield all([
        call(watchListReport),
        call(watchDetailReport),
        call(watchMyReport),
        call(watchGenerateReport),
        call(watchRegenerateReport),
    ]);
}
