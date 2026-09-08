import {all,call,put,take,takeLatest} from 'redux-saga/effects';
import api from '../../api/axios';
import{       fetchProjMemRequest,fetchProjMemSuccess,fetchProjMemFailure,
              createProjMemRequest,createProjMemSuccess,createProjMemFailure,
              deleteProjMemRequest,deleteProjMemSuccess,deleteProjMemFailure,
              resetProjMemState
}from "../../reducers/proj/projMemReducer";

const PROJMEM_API_BASE="/api/projectMember";

    // 전체 목록
    export const fetchProjMemAPI =(proId)=>api.get(PROJMEM_API_BASE,{params:{proId}});
    export function* fetchProjMem(action){
        try{
            const result = yield call(fetchProjMemAPI,action.payload)
            yield put(fetchProjMemSuccess(result.data))
        }catch(err){
            yield put(fetchProjMemFailure(err.response?.data?.message || err.message));
        }
    }

    // 멤버 등록
    export const createProjMemAPI=(dto)=>api.post(`${PROJMEM_API_BASE}/proj_member_create`,dto);
    export function* createProjMem(action){
        try{
            const result = yield call(createProjMemAPI,action.payload)
            yield put(createProjMemSuccess(result.data))
        }catch(err){
            yield put(createProjMemFailure(err.response?.data?.message || err.message));
        }
    }

    // 멤버 삭제
    export const deleteProjMemAPI=({pmId,proId})=>api.delete(`${PROJMEM_API_BASE}/${pmId}`,{params:{proId}});
    export function* deleteProjMem(action){
        try{
            yield call(deleteProjMemAPI,action.payload)
            yield put(deleteProjMemSuccess(action.payload.pmId))
        }catch(err){
            yield put(deleteProjMemFailure(err.response?.data?.message || err.message));
        }
    }

    function* watchFetchProjMem(){yield takeLatest(fetchProjMemRequest.type,fetchProjMem);}
    function* watchCreateProjMem(){yield takeLatest(createProjMemRequest.type,createProjMem);}
    function* watchDeleteProjMem(){yield takeLatest(deleteProjMemRequest.type,deleteProjMem);}

    
    export default function* projMemSaga(){
        yield all([
            call(watchFetchProjMem),
            call(watchCreateProjMem),
            call(watchDeleteProjMem)
        ]);
    }