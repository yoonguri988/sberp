import {all,call,put,take,takeLatest} from 'redux-saga/effects';
import api from '../../api/axios';
import{     fetchNoticeRequest, fetchNoticeSuccess, fetchNoticeFailure,
            fetchNoticeDetailRequest, fetchNoticeDetailSuccess, fetchNoticeDetailFailure,
            createNoticeRequest, createNoticeSuccess, createNoticeFailure,
            updateNoticeRequest, updateNoticeSuccess, updateNoticeFailure,
            deleteNoticeRequest, deleteNoticeSuccess, deleteNoticeFailure,
            resetNoticeState
}from "../../reducers/notice/noticeReducer";

const NOTICE_API_BASE="/api/notice";

    // 전체 목록
    export const fetchNoticeAPI = (params) => api.get(NOTICE_API_BASE,{params});
    export function* fetchNotice(action){
        try{
            const result = yield call(fetchNoticeAPI, action.payload)
            yield put(fetchNoticeSuccess(result.data))
        }catch(err){
            yield put(fetchNoticeFailure(err.response?.data?.message || err.message));
        }
    }

    // 상세 조회
    export const fetchNoticeDetailAPI=(bno)=>api.get(`${NOTICE_API_BASE}/${bno}`);
    export function* fetchNoticeDetail(action){
        try{
            const { bno } = action.payload;
            const result = yield call(fetchNoticeDetailAPI, bno);
            yield put(fetchNoticeDetailSuccess(result.data))
        }catch(err){
            yield put(fetchNoticeDetailFailure(err.response?.data?.message || err.message));
        }
    }

    // 공지 등록
    export function createNoticeAPI(payload){
        const {dto,file} = payload; 
        const formData = new FormData(); 
        Object.entries(dto || {}).forEach(([k, v]) => { 
            if (v !== undefined && v !== null) {
                formData.append(k, v);
            }
        });
        if (file) { 
            formData.append('file', file);
        }
        return api.post(NOTICE_API_BASE,formData,{
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    }
    export function* createNotice(action){
        try{
            const result = yield call(createNoticeAPI,action.payload); 
            yield put(createNoticeSuccess(result.data))
        }catch(err){
            yield put(createNoticeFailure(err.response?.data?.message || err.message));
        }
    }

    // 공지 수정
   export function updateNoticeAPI(payload){
            const {bno,dto,file} =payload;
            const formData = new FormData();
                Object.entries(dto || {}).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                    formData.append(k, v);
                }
                 });
                if (file) { 
                    formData.append('file', file);
                }
            return api.put(`${NOTICE_API_BASE}/${bno}`,formData,{
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        export function* updateNotice(action){
            try{
                const result = yield call(updateNoticeAPI,action.payload)
                yield put(updateNoticeSuccess(result.data))
            }catch(err){
                yield put(updateNoticeFailure(err.response?.data?.message || err.message));
            }
        }
    // 공지 삭제
    export const deleteNoticeAPI=(bno)=>api.delete(`${NOTICE_API_BASE}/${bno}`);
     export function* deleteNotice(action){
        try{
            const { bno } = action.payload;
            yield call(deleteNoticeAPI,bno)
            yield put(deleteNoticeSuccess(bno))
        }catch(err){
            yield put(deleteNoticeFailure(err.response?.data?.message || err.message));
        }
    }

function* watchFetchNotice(){yield takeLatest(fetchNoticeRequest.type,fetchNotice);}
function* watchFetchNoticeDetail(){yield takeLatest(fetchNoticeDetailRequest.type,fetchNoticeDetail);}
function* watchCreateNotice(){yield takeLatest(createNoticeRequest.type,createNotice);}
function* watchUpdateNotice(){yield takeLatest(updateNoticeRequest.type,updateNotice);}
function* watchDeleteNotice(){yield takeLatest(deleteNoticeRequest.type,deleteNotice);}

export default function* noticeSaga(){
    yield all([
        call(watchFetchNotice),
        call(watchFetchNoticeDetail),
        call(watchCreateNotice),
        call(watchUpdateNotice),
        call(watchDeleteNotice),
    ]);
}