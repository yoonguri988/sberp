// sagas/perm/permSaga.js
import { all, call, put, takeLatest } from 'redux-saga/effects';
import api from '../../api/axios';
import {
    listPermRequest, listPermSuccess, listPermFailure,
    detailPermRequest, detailPermSuccess, detailPermFailure,
    createPermRequest, createPermSuccess, createPermFailure,
    updatePermRequest, updatePermSuccess, updatePermFailure,
    deletePermRequest, deletePermSuccess, deletePermFailure,
    empAuthListRequest, empAuthListSuccess, empAuthListFailure,
    grantPermRequest, grantPermSuccess, grantPermFailure,
    revokePermRequest, revokePermSuccess, revokePermFailure,
} from '../../reducers/perm/permReducer';

const PERM_API_BASE = '/api/perm';

//////////////////////////////////////////////////////////////////////////////
// listPerm  - GET /api/perm 권한 목록 조회
//////////////////////////////////////////////////////////////////////////////

export const listPermApi = () => api.get(PERM_API_BASE);

export function* listPerm() {
    try {
        const result = yield call(listPermApi);
        yield put(listPermSuccess(result.data));
    } catch(err) {
        yield put(listPermFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// detailPerm  - GET /api/perm/{autId} 권한 상세 조회
//////////////////////////////////////////////////////////////////////////////

export const detailPermApi = (autId) => api.get(`${PERM_API_BASE}/${autId}`);

export function* detailPerm(action) {
    try {
        const result = yield call(detailPermApi, action.payload);
        yield put(detailPermSuccess(result.data));
    } catch(err) {
        yield put(detailPermFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// createPerm  - POST /api/perm 권한 등록
//////////////////////////////////////////////////////////////////////////////

export const createPermApi = (data) => api.post(PERM_API_BASE, data);

export function* createPerm(action) {
    try {
        const result = yield call(createPermApi, action.payload);
        yield put(createPermSuccess(result.data));
    } catch(err) {
        yield put(createPermFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// updatePerm  - PUT /api/perm/{autId} 권한 수정
//////////////////////////////////////////////////////////////////////////////

export const updatePermApi = ({ autId, ...data }) => api.put(`${PERM_API_BASE}/${autId}`, data);

export function* updatePerm(action) {
    try {
        const result = yield call(updatePermApi, action.payload);
        yield put(updatePermSuccess(result.data));
    } catch(err) {
        yield put(updatePermFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// deletePerm  - DELETE /api/perm/{autId} 권한 삭제
//////////////////////////////////////////////////////////////////////////////

export const deletePermApi = (autId) => api.delete(`${PERM_API_BASE}/${autId}`);

export function* deletePerm(action) {
    try {
        yield call(deletePermApi, action.payload);
        yield put(deletePermSuccess(action.payload));
    } catch(err) {
        yield put(deletePermFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// empAuthList  - GET /api/perm/emp/{empId} 사원별 권한 목록 조회
//////////////////////////////////////////////////////////////////////////////

export const empAuthListApi = (empId) => api.get(`${PERM_API_BASE}/emp/${empId}`);

export function* empAuthList(action) {
    try {
        const result = yield call(empAuthListApi, action.payload);
        yield put(empAuthListSuccess(result.data));
    } catch(err) {
        yield put(empAuthListFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// grantPerm  - POST /api/perm/grant 사원에게 권한 부여
//////////////////////////////////////////////////////////////////////////////

export const grantPermApi = (data) => api.post(`${PERM_API_BASE}/grant`, data);

export function* grantPerm(action) {
    try {
        yield call(grantPermApi, action.payload);
        yield put(grantPermSuccess());
    } catch(err) {
        yield put(grantPermFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// revokePerm  - POST /api/perm/revoke 사원의 권한 회수
//////////////////////////////////////////////////////////////////////////////

export const revokePermApi = (data) => api.post(`${PERM_API_BASE}/revoke`, data);

export function* revokePerm(action) {
    try {
        yield call(revokePermApi, action.payload);
        yield put(revokePermSuccess());
    } catch(err) {
        yield put(revokePermFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function* watchListPerm()     { yield takeLatest(listPermRequest.type, listPerm); }
function* watchDetailPerm()   { yield takeLatest(detailPermRequest.type, detailPerm); }
function* watchCreatePerm()   { yield takeLatest(createPermRequest.type, createPerm); }
function* watchUpdatePerm()   { yield takeLatest(updatePermRequest.type, updatePerm); }
function* watchDeletePerm()   { yield takeLatest(deletePermRequest.type, deletePerm); }
function* watchEmpAuthList()  { yield takeLatest(empAuthListRequest.type, empAuthList); }
function* watchGrantPerm()    { yield takeLatest(grantPermRequest.type, grantPerm); }
function* watchRevokePerm()   { yield takeLatest(revokePermRequest.type, revokePerm); }

export default function* permSaga() {
    yield all([
        call(watchListPerm),
        call(watchDetailPerm),
        call(watchCreatePerm),
        call(watchUpdatePerm),
        call(watchDeletePerm),
        call(watchEmpAuthList),
        call(watchGrantPerm),
        call(watchRevokePerm),
    ]);
}
