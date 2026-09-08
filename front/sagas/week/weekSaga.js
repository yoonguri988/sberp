import {all,call,put,take,takeLatest} from 'redux-saga/effects';
import api from '../../api/axios';
import{     checkMyReportRequest,checkMyReportSuccess,checkMyReportFailure,
            createMyReportRequest,createMyReportSuccess,createMyReportFailure,
            resetWeekState
}from "../../reducers/week/weekReducer";

const WEEK_API_BASE="/api/week";

    // 개인 주간보고서 생성 가능 여부 확인
    export const checkMyReportAPI=()=>api.get(`${WEEK_API_BASE}/my-report/check`);
    export function* checkMyReport(action){
        try{
            const result = yield call(checkMyReportAPI,action.payload)
            yield put(checkMyReportSuccess(result.data))
        }catch(err){
            yield put(checkMyReportFailure(err.response?.data?.message || err.message));
        }
    }
    // 개인 주간보고서 PDF 생성
    export const createMyReportAPI=()=>api.get(`${WEEK_API_BASE}/my-report`, { responseType: "blob" });
    export function* createMyReport(action){
        try{
            const result = yield call(createMyReportAPI,action.payload)
            yield put(createMyReportSuccess(result.data))
        }catch(err){
            yield put(createMyReportFailure(err.response?.data?.message || err.message));
        }
    }

function* watchCheckMyReport(){yield takeLatest(checkMyReportRequest.type,checkMyReport);}
function* watchCreateMyReport(){yield takeLatest(createMyReportRequest.type,createMyReport);}

export default function* weekSaga(){
    yield all([
        call(watchCheckMyReport),
        call(watchCreateMyReport)
    ]);
}