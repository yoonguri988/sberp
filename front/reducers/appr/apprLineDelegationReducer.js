import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    
    // 위임/대결 요청 생성 (문서 상세 화면)
    createSubmitting: false,
    createError: null,
    createSuccess: false,

    // 본인이 신청한 위임 요청 목록
    myRequests: [],
    myRequestsLoading: false,
    myRequestsError: null,

    // 관리자 - 승인 대기중인 요청 목록
    pendingRequests: [],
    pendingLoading: false,
    pendingError: null,

    // 관리자 - 승인/반려 처리
    processSubmitting: false,
    processSuccess: false,
    processError: null,

    // 관리자 - 처리이력 조회 (B-9, 페이징)
    history: [],
    historyTotal: 0,
    historyLoading: false,
    historyError: null,
};

const apprLineDelegationReducer = createSlice({
    name: "apprLineDelegation",
    initialState,
    reducers: {
        // 위임/대결 요청 생성
        createDelegReqRequest: (state) => {
            state.createSubmitting = true;
            state.createError = null;
            state.createSuccess = false;
        },
        createDelegReqSuccess: (state) => {
            state.createSubmitting = false;
            state.createSuccess = true;
        },
        createDelegReqFailure: (state, action) => {
            state.createSubmitting = false;
            state.createError = action.payload;
        },
        resetCreateStats: (state) => {
            state.createSubmitting = false;
            state.createError = null;
            state.createSuccess = false;
        },

        // 본인 위임 요청 목록 조회
        fetchMyDelegReqRequest: (state) => {
            state.myRequestsLoading = true;
            state.myRequestsError = null;
        },
        fetchMyDelegReqSuccess: (state, action) => {
            state.myRequestsLoading = false;
            state.myRequests = action.payload;
        },
        fetchMyDelegReqFailure: (state, action) => {
            state.myRequestsLoading = false;
            state.myRequestsError = action.payload;
        },

        // 관리자 - 승인 대기중인 요청 목록 조회
        fetchPendingDelegReqRequest: (state) => {
            state.pendingLoading = true;
            state.pendingError = null;
        },
        fetchPendingDelegReqSuccess: (state, action) => {
            state.pendingLoading = false;
            state.pendingRequests = action.payload;
        },
        fetchPendingDelegReqFailure: (state, action) => {
            state.pendingLoading = false;
            state.pendingError = action.payload;
        },

        // 관리자 - 승인 처리
        approveDelegReqRequest: (state) => {
            state.processSubmitting = true;
            state.processError = null;
            state.processSuccess = false;
        },
        approveDelegReqSuccess: (state) => {
            state.processSubmitting = false;
            state.processSuccess = true;
        },
        approveDelegReqFailure: (state, action) => {
            state.processSubmitting = false;
            state.processError = action.payload;
        },

        // 관리자 - 반려 처리
        rejectDelegReqRequest: (state) => {
            state.processSubmitting = true;
            state.processError = null;
            state.processSuccess = false;
        },
        rejectDelegReqSuccess: (state) => {
            state.processSubmitting = false;
            state.processSuccess = true;
        },
        rejectDelegReqFailure: (state, action) => {
            state.processSubmitting = false;
            state.processError = action.payload;
        },
        resetProcessState: (state) => {
            state.processSubmitting = false;
            state.processError = null;
            state.processSuccess = false;
        },

        // 관리자 - 처리이력 조회
        fetchDelegHistoryRequest: (state) => {
            state.historyLoading = true;
            state.historyError = null;
        },
        fetchDelegHistorySuccess: (state, action) => {
            state.historyLoading = false;
            state.history = action.payload.content;
            state.historyTotal = action.payload.totalElements;
        },
        fetchDelegHistoryFailure: (state, action) => {
            state.historyLoading = false;
            state.historyError = action.payload;
        }
    },
});

export const {
    createDelegReqRequest, createDelegReqSuccess, createDelegReqFailure,
    resetCreateStats,
    fetchMyDelegReqRequest, fetchMyDelegReqSuccess, fetchMyDelegReqFailure,
    fetchPendingDelegReqRequest, fetchPendingDelegReqSuccess, fetchPendingDelegReqFailure,
    approveDelegReqRequest, approveDelegReqSuccess, approveDelegReqFailure,
    rejectDelegReqRequest, rejectDelegReqSuccess, rejectDelegReqFailure,
    resetProcessState,
    fetchDelegHistoryRequest, fetchDelegHistorySuccess, fetchDelegHistoryFailure,
} = apprLineDelegationReducer.actions;

export default apprLineDelegationReducer.reducer