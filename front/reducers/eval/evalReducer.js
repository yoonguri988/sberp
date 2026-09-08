// reducers/eval/evalReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // 대시보드 — periodId 없이 호출 시
    openPeriods: [],

    // 대시보드 — periodId 지정 시
    currentPeriod: null,
    targets: [],           // 평가 대상 목록
    submittedCount: 0,
    totalCount: 0,

    // 평가 상세
    currentEval: null,

    // 공통
    loading: false,
    error: null,
    success: false,
};

const evalReducer = createSlice({
    name: "eval",
    initialState,
    reducers: {

        // --- 상태 초기화 ---
        resetEvalState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        clearEvalDetail: (state) => {
            state.currentEval = null;
            state.currentPeriod = null;
            state.targets = [];
            state.submittedCount = 0;
            state.totalCount = 0;
        },

        // --- 대시보드 조회 ---
        dashboardEvalRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        dashboardEvalSuccess: (state, action) => {
            state.loading = false;
            // periodId 없이 호출 → openPeriods만 내려옴
            if (action.payload.openPeriods) {
                state.openPeriods = action.payload.openPeriods;
            }
            // periodId 지정 → period + targets + 진행률
            if (action.payload.period) {
                state.currentPeriod = action.payload.period;
                state.targets = action.payload.targets;
                state.submittedCount = action.payload.submittedCount;
                state.totalCount = action.payload.totalCount;
            }
        },
        dashboardEvalFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 평가 상세 조회 ---
        detailEvalRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        detailEvalSuccess: (state, action) => {
            state.loading = false;
            state.currentEval = action.payload;
        },
        detailEvalFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 평가 임시저장 ---
        draftEvalRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        draftEvalSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        draftEvalFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 평가 제출 ---
        submitEvalRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        submitEvalSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        submitEvalFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
});

export const {
    resetEvalState, clearEvalDetail,
    dashboardEvalRequest, dashboardEvalSuccess, dashboardEvalFailure,
    detailEvalRequest, detailEvalSuccess, detailEvalFailure,
    draftEvalRequest, draftEvalSuccess, draftEvalFailure,
    submitEvalRequest, submitEvalSuccess, submitEvalFailure,
} = evalReducer.actions;

export default evalReducer.reducer;
