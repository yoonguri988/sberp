// reducers/eval/evalReportReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // 리포트 목록 (회차별)
    reportList: [],
    reportPeriod: null,    // 리포트 목록 조회 시 함께 내려오는 회차 정보
    reportCount: 0,
    paging: null,

    // 리포트 상세
    currentReport: null,

    // 내 리포트 이력
    myReports: [],

    // 공통
    loading: false,
    error: null,
    success: false,
};

const evalReportReducer = createSlice({
    name: "report",
    initialState,
    reducers: {

        // --- 상태 초기화 ---
        resetReportState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        clearReportDetail: (state) => {
            state.currentReport = null;
        },

        // --- 회차별 리포트 목록 조회 ---
        listReportRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        listReportSuccess: (state, action) => {
            state.loading = false;
            state.reportList = action.payload.reports;
            state.reportPeriod = action.payload.period;
            state.reportCount = action.payload.reportCount;
            state.paging = action.payload.paging;
        },
        listReportFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 리포트 상세 조회 ---
        detailReportRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        detailReportSuccess: (state, action) => {
            state.loading = false;
            state.currentReport = action.payload;
        },
        detailReportFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 내 리포트 이력 ---
        myReportRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        myReportSuccess: (state, action) => {
            state.loading = false;
            state.myReports = action.payload;
        },
        myReportFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 회차 전체 리포트 생성 ---
        generateReportRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        generateReportSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        generateReportFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 특정 사원 리포트 재생성 ---
        regenerateReportRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        regenerateReportSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        regenerateReportFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
});

export const {
    resetReportState, clearReportDetail,
    listReportRequest, listReportSuccess, listReportFailure,
    detailReportRequest, detailReportSuccess, detailReportFailure,
    myReportRequest, myReportSuccess, myReportFailure,
    generateReportRequest, generateReportSuccess, generateReportFailure,
    regenerateReportRequest, regenerateReportSuccess, regenerateReportFailure,
} = evalReportReducer.actions;

export default evalReportReducer.reducer;
