import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    available: false,   // 주간보고서 생성 가능 여부
    loading: false,
    error: null,
    success: false
};

const weekReducer = createSlice({
    name: "week",
    initialState,
    reducers: {

        // 개인 주간보고서 생성 가능 여부 확인
        checkMyReportRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        checkMyReportSuccess: (state, action) => {
            state.loading = false;
            state.available = action.payload;
        },
        checkMyReportFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.available = false;
        },

        // 개인 주간보고서 PDF 생성
        createMyReportRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        createMyReportSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        createMyReportFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },
        // 상태 초기화
        resetWeekState: (state) => {
            state.available = false;
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    }
});

export const {
    checkMyReportRequest,checkMyReportSuccess,checkMyReportFailure,
    createMyReportRequest,createMyReportSuccess,createMyReportFailure,
    resetWeekState
} = weekReducer.actions;

export default weekReducer.reducer;