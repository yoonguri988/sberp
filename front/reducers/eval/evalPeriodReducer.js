// reducers/eval/evalPeriodReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // 회차 목록
    periodList: [],
    stats: null,           // 상태별 건수 { READY: 1, OPEN: 2, ... }

    // 회차 상세
    currentPeriod: null,
    evalCount: 0,
    reportCount: 0,

    // 리포트 진행률 (폴링용)
    reportProgress: null,  // { periodStatus, completed, total }

    // 중복 확인
    checkDuplicate: null,  // true=중복, false=사용가능, null=미검사

    // 공통
    loading: false,
    error: null,
    success: false,
};

const evalPeriodReducer = createSlice({
    name: "period",
    initialState,
    reducers: {

        // --- 상태 초기화 ---
        resetPeriodState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        clearPeriodDetail: (state) => {
            state.currentPeriod = null;
            state.evalCount = 0;
            state.reportCount = 0;
            state.reportProgress = null;
        },
        clearCheckDuplicate: (state) => {
            state.checkDuplicate = null;
        },

        // --- 회차 목록 조회 ---
        listPeriodRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        listPeriodSuccess: (state, action) => {
            state.loading = false;
            state.periodList = action.payload.periodList;
            state.stats = action.payload.stats;
        },
        listPeriodFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 회차 상세 조회 ---
        detailPeriodRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        detailPeriodSuccess: (state, action) => {
            state.loading = false;
            state.currentPeriod = action.payload.period;
            state.evalCount = action.payload.evalCount;
            state.reportCount = action.payload.reportCount;
        },
        detailPeriodFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 회차 등록 ---
        createPeriodRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        createPeriodSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        createPeriodFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 회차 수정 ---
        updatePeriodRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        updatePeriodSuccess: (state, action) => {
            state.loading = false;
            state.currentPeriod = action.payload;
            state.success = true;
        },
        updatePeriodFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 회차 열기 (READY → OPEN) ---
        openPeriodRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        openPeriodSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        openPeriodFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 회차 마감 (OPEN → CLOSED) ---
        closePeriodRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        closePeriodSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        closePeriodFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- AI 분석 시작 (CLOSED → REPORTING) ---
        reportPeriodRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        reportPeriodSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        reportPeriodFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 리포트 진행률 조회 (폴링) ---
        reportStatusRequest: () => {},  // 로딩 없이 조용히 조회
        reportStatusSuccess: (state, action) => {
            state.reportProgress = action.payload;
        },

        // --- 회차 중복 확인 ---
        checkDuplicateRequest: () => {},
        checkDuplicateSuccess: (state, action) => {
            state.checkDuplicate = action.payload;
        },
    }
});

export const {
    resetPeriodState, clearPeriodDetail, clearCheckDuplicate,
    listPeriodRequest, listPeriodSuccess, listPeriodFailure,
    detailPeriodRequest, detailPeriodSuccess, detailPeriodFailure,
    createPeriodRequest, createPeriodSuccess, createPeriodFailure,
    updatePeriodRequest, updatePeriodSuccess, updatePeriodFailure,
    openPeriodRequest, openPeriodSuccess, openPeriodFailure,
    closePeriodRequest, closePeriodSuccess, closePeriodFailure,
    reportPeriodRequest, reportPeriodSuccess, reportPeriodFailure,
    reportStatusRequest, reportStatusSuccess,
    checkDuplicateRequest, checkDuplicateSuccess,
} = evalPeriodReducer.actions;

export default evalPeriodReducer.reducer;
