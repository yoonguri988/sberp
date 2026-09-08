// sagas/emp/empSaga.js
import { all, call, put, takeLatest } from 'redux-saga/effects';
import api from '../../api/axios';
import { 
    resetEmpState,
    listEmpRequest, listEmpSuccess, listEmpFailure,
    detailEmpRequest, detailEmpSuccess, detailEmpFailure,
    createEmpRequest, createEmpSuccess, createEmpFailure,
    updateEmpRequest, updateEmpSuccess, updateEmpFailure,
    updatePasswordRequest, updatePasswordSuccess, updatePasswordFailure,
    resetPasswordRequest, resetPasswordSuccess, resetPasswordFailure,
    checkEmailRequest, checkEmailSuccess,
    checkMobileRequest, checkMobileSuccess,
    checkEmpNoRequest, checkEmpNoSuccess,
} from '../../reducers/emp/empReducer';

const EMP_API_BASE = '/api/emp';

//////////////////////////////////////////////////////////////////////////////
// listEmp  - GET /api/emp 사원 목록 조회 ---
//////////////////////////////////////////////////////////////////////////////

export const listEmpApi = (params) => {
    const clean = {};
    Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) clean[k] = v;
    });
    return api.get(EMP_API_BASE, { params: clean });
};

export function* listEmp(action){
    try{
        const result = yield call(listEmpApi, action.payload);
        yield put(listEmpSuccess(result.data));
    }catch(err){
        yield put(listEmpFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// detailEmp - GET /api/emp 사원 상세 조회 ---
//////////////////////////////////////////////////////////////////////////////

export const detailEmpApi = (empId)=> api.get(`${EMP_API_BASE}/${empId}`);

export function* detailEmp(action){
    try{
        const result = yield call(detailEmpApi, action.payload);
        yield put(detailEmpSuccess(result.data));
    }catch(err){
        yield put(detailEmpFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// createEmp  - POST /api/emp 사원 등록 ---
//////////////////////////////////////////////////////////////////////////////

export const createEmpApi = (data)=> api.post(EMP_API_BASE, data);

export function* createEmp(action){
    try{
        const result = yield call(createEmpApi, action.payload);
        yield put(createEmpSuccess(result.data));
    }catch(err){
        yield put(createEmpFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// updateEmp  - PUT /api/emp/{empId} 사원 정보 수정 ---
//////////////////////////////////////////////////////////////////////////////

export const updateEmpApi = ({empId, ...data})=> api.put(`${EMP_API_BASE}/${empId}`, data);

export function* updateEmp(action){
    try{
        const result = yield call(updateEmpApi, action.payload);
        yield put(updateEmpSuccess(result.data));
    }catch(err){
        yield put(updateEmpFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// updatePassword  - PUT /api/emp/{empId}/password 비밀번호 변경(본인) ---
//////////////////////////////////////////////////////////////////////////////

export const updatePasswordApi = ({empId, ...data})=> api.put(`${EMP_API_BASE}/${empId}/password`, data);

export function* updatePassword(action){
    try{
        const result = yield call(updatePasswordApi, action.payload);
        yield put(updatePasswordSuccess(result.data));
    }catch(err){
        yield put(updatePasswordFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// resetPassword  - PUT /api/emp/{empId}/reset-password 비밀번호 초기화(관리자) ---
//////////////////////////////////////////////////////////////////////////////

export const resetPasswordApi = (empId)=> api.put(`${EMP_API_BASE}/${empId}/reset-password`);

export function* resetPassword(action){
    try{
        const result = yield call(resetPasswordApi, action.payload);
        yield put(resetPasswordSuccess(result.data));
    }catch(err){
        yield put(resetPasswordFailure(err.response?.data?.message || err.message));
    }
}

//////////////////////////////////////////////////////////////////////////////
// checkEmail  - GET /api/emp/check-email 	이메일 중복검사 ---
//////////////////////////////////////////////////////////////////////////////

export const checkEmailApi = (email)=> api.get(`${EMP_API_BASE}/check-email`, { params: {email} });

export function* checkEmail(action){
    try{
        const result = yield call(checkEmailApi, action.payload);
        yield put(checkEmailSuccess(!result.data.duplicate));
    }catch(err){
        console.error('이메일 중복검사 실패: ', err);
    }
}

//////////////////////////////////////////////////////////////////////////////
// checkMobile  - GET /api/emp/check-mobile 	모바일 중복검사 ---
//////////////////////////////////////////////////////////////////////////////

export const checkMobileApi = (mobile)=> api.get(`${EMP_API_BASE}/check-mobile`, { params: {mobile} });

export function* checkMobile(action){
    try{
        const result = yield call(checkMobileApi, action.payload);
        yield put(checkMobileSuccess(!result.data.duplicate));
    }catch(err){
        console.error('모바일 중복검사 실패: ', err);
    }
}

//////////////////////////////////////////////////////////////////////////////
// checkEmpNo  - GET /api/emp/check-empno 	사번 중복검사 ---
//////////////////////////////////////////////////////////////////////////////

export const checkEmpNoApi = (empNo)=> api.get(`${EMP_API_BASE}/check-empno`, { params: {empNo} });

export function* checkEmpNo(action){
    try{
        const result = yield call(checkEmpNoApi, action.payload);
        yield put(checkEmpNoSuccess(!result.data.duplicate));
    }catch(err){
        console.error('사번 중복검사 실패: ', err);
    }
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

function* watchListEmp(){ yield takeLatest( listEmpRequest.type, listEmp ); }
function* watchDetailEmp(){ yield takeLatest( detailEmpRequest.type, detailEmp ); }
function* watchCreateEmp(){ yield takeLatest( createEmpRequest.type, createEmp ); }
function* watchUpdateEmp(){ yield takeLatest( updateEmpRequest.type, updateEmp ); }
function* watchUpdatePass(){ yield takeLatest( updatePasswordRequest.type, updatePassword ); }
function* watchResetPass(){ yield takeLatest( resetPasswordRequest.type, resetPassword ); }
function* watchCheckEmail(){ yield takeLatest( checkEmailRequest.type, checkEmail ); }
function* watchCheckMobile(){ yield takeLatest( checkMobileRequest.type, checkMobile ); }
function* watchCheckEmpNo(){ yield takeLatest( checkEmpNoRequest.type, checkEmpNo ); }

export default function* empSaga(){
    yield all([
        call(watchListEmp),
        call(watchDetailEmp),
        call(watchCreateEmp),
        call(watchUpdateEmp),
        call(watchUpdatePass),
        call(watchResetPass),
        call(watchCheckEmail),
        call(watchCheckMobile),
        call(watchCheckEmpNo),
    ]);
}
