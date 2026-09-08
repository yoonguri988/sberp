import {all,call,put,take,takeLatest} from 'redux-saga/effects';
import api from '../../api/axios';
import{       fetchProjRequest,fetchProjSuccess,fetchProjFailure,
              fetchProjDetailRequest,fetchProjDetailSuccess,fetchProjDetailFailure,
              createProjRequest,createProjSuccess,createProjFailure,
              updateProjRequest,updateProjSuccess,updateProjFailure,
              deleteProjRequest,deleteProjSuccess,deleteProjFailure,
              searchEmpRequest,searchEmpSuccess,searchEmpFailure,
              analyzeProjRequest,analyzeProjSuccess,analyzeProjFailure,
              resetProjState
}from "../../reducers/proj/projReducer";

const PROJ_API_BASE="/api/projects";

    // 전체 목록
    export const fetchProjAPI = (params) => api.get(PROJ_API_BASE,{params});
    export function* fetchProj(action){
        try{
            const result = yield call(fetchProjAPI, action.payload)
            yield put(fetchProjSuccess(result.data))
        }catch(err){
            yield put(fetchProjFailure(err.response?.data?.message || err.message));
        }
    }
    
    // 상세 조회
    export const fetchProjDetailAPI=({proId, pstartno})=>api.get(`${PROJ_API_BASE}/${proId}`,{params:{pstartno}});
    export function* fetchProjDetail(action){
        try{
            const result = yield call(fetchProjDetailAPI,action.payload)
            yield put(fetchProjDetailSuccess(result.data))
        }catch(err){
            yield put(fetchProjDetailFailure(err.response?.data?.message || err.message));
        }
    }

    // 프로젝트 등록
    export const createProjAPI = (dto) => api.post(PROJ_API_BASE, dto);
    export function* createProj(action){
        try {
            const result = yield call(createProjAPI, action.payload); 
            yield put(createProjSuccess(result.data));
        } catch (err) {
            yield put(createProjFailure(err.response?.data?.message || err.message));
        }
    }

    // 프로젝트 수정
    export const updateProjAPI=({proId,dto})=>api.put(`${PROJ_API_BASE}/${proId}`,dto);
    export function* updateProj(action){
        try{
            const result = yield call(updateProjAPI,action.payload);
            yield put(updateProjSuccess(result.data))
        }catch(err){
            yield put(updateProjFailure(err.response?.data?.message || err.message));
        }
    }

    // 프로젝트 삭제
    export const deleteProjAPI=(proId)=>api.delete(`${PROJ_API_BASE}/${proId}`);
    export function* deleteProj(action){
        try{
            yield call(deleteProjAPI,action.payload)
            yield put(deleteProjSuccess(action.payload))
        }catch(err){
            yield put(deleteProjFailure(err.response?.data?.message || err.message));
        }
    }

    // 사원 검색
    export const searchEmpAPI=(keyword)=>api.get(`${PROJ_API_BASE}/empSearch`,{params:{keyword}});
    export function* searchEmp(action){
    try {
        const result = yield call(searchEmpAPI, action.payload);
        yield put(searchEmpSuccess(result.data));
    } catch (err) {
        yield put(searchEmpFailure(err.response?.data?.message || err.message));
        }
    }
    // ai 분석 결과
    export const analyzeProjAPI=(proId)=>api.get(`${PROJ_API_BASE}/${proId}/analysis`);
    export function* analyzeProj(action){
        try{
            const result = yield call(analyzeProjAPI,action.payload)
            yield put(analyzeProjSuccess(result.data))
        }catch(err){
            yield put(analyzeProjFailure(err.response?.data?.message || err.message));
        }
    }

function* watchFetchProj(){yield takeLatest(fetchProjRequest.type,fetchProj);}
function* watchFetchProjDetail(){yield takeLatest(fetchProjDetailRequest.type,fetchProjDetail);}
function* watchCreateProj(){yield takeLatest(createProjRequest.type,createProj);}
function* watchUpdateProj(){yield takeLatest(updateProjRequest.type,updateProj);}
function* watchDeleteProj(){yield takeLatest(deleteProjRequest.type,deleteProj);}
function* watchSearchEmp(){yield takeLatest(searchEmpRequest.type,searchEmp);}
function* watchAnalyzeProj(){yield takeLatest(analyzeProjRequest.type,analyzeProj);}

export default function* projSaga(){
    yield all([
        call(watchFetchProj),
        call(watchFetchProjDetail),
        call(watchCreateProj),
        call(watchUpdateProj),
        call(watchDeleteProj),
        call(watchSearchEmp),
        call(watchAnalyzeProj)
    ]);
}