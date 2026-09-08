// reducers/empReducer.js
import { createSlice } from "@reduxjs/toolkit";

//초기화 상태(공용)
const initialState={
    //사원 목록
    empList: [],

    //상세
    currentEmp: null,

    //페이징
    paging: null,

    //리포트 결과
    latestReport: null,

    //중복 검사 결과
    checkResult: {
        email: null,        // true=사용가능, false=중복, null=미검사
        mobile: null,
        empNo: null,
    },

    //공통
    loading: false,
    error: null,
    success: false,         // 등록/수정 성공 (목록 이동용)
    passwordSuccess: false, // 비밀번호 변경/초기화 성공 (알림용)
};

//2. 상태 변화
const empReducer=createSlice({
    name: "emp",
    initialState,
    reducers: {

        // --- 상태 초기화 ---
        resetEmpState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
            state.checkResult = { email: null, mobile: null, empNo: null };
        },
        
        // --- 사원 목록 조회 ---
        listEmpRequest: (state)=>{
            state.loading = true;
            state.error = null;
        },
        listEmpSuccess: (state, action)=>{
            state.loading = false;
            state.empList = action.payload.list;
            state.paging = action.payload.paging;
        },
        listEmpFailure: (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },

        // --- 사원 상세 조회 ---
        detailEmpRequest: (state)=>{
            state.loading = true;
            state.error = null;
        },
        detailEmpSuccess: (state, action)=>{
            state.loading = false;
            state.currentEmp = action.payload.emp;
            state.latestReport = action.payload.latestReport || null;
        },
        detailEmpFailure: (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },

        // --- 사원 등록 ---
        createEmpRequest: (state)=>{
            state.loading = true;
            state.error = null;
        },
        createEmpSuccess: (state, action)=>{
            state.loading = false;
            state.success = true;
        },
        createEmpFailure: (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },

        // --- 사원 수정 ---
        updateEmpRequest: (state)=>{
            state.loading = true;
            state.error = null;
        },
        updateEmpSuccess: (state, action)=>{
            state.loading = false;
            state.currentEmp = action.payload;
            state.success = true;
        },
        updateEmpFailure: (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },

        // --- 비밀번호 변경(본인) ---
        updatePasswordRequest: (state)=>{
            state.loading = true;
            state.error = null;
        },
        updatePasswordSuccess: (state, action)=>{
            state.loading = false;
            state.passwordSuccess = true;
        },
        updatePasswordFailure: (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },

        // --- 비밀번호 초기화(관리자) ---
        resetPasswordRequest: (state)=>{
            state.loading = true;
            state.error = null;
        },
        resetPasswordSuccess: (state, action)=>{
            state.loading = false;
            state.passwordSuccess = true;
        },
        resetPasswordFailure: (state, action)=>{
            state.loading = false;
            state.error = action.payload;
        },

        // --- 이메일 중복검사 ---
        checkEmailRequest: ()=>{},
        checkEmailSuccess: (state, action)=>{
            state.checkResult.email = action.payload;
        },

        // --- 연락처 중복검사 ---
        checkMobileRequest: ()=>{},
        checkMobileSuccess: (state, action)=>{
            state.checkResult.mobile = action.payload;
        },

        // --- 사번 중복검사 ---
        checkEmpNoRequest: ()=>{},
        checkEmpNoSuccess: (state, action)=>{
            state.checkResult.empNo = action.payload;
        },

    }
});

//3. action
export const {
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
} = empReducer.actions;

//4. export
export default empReducer.reducer;
