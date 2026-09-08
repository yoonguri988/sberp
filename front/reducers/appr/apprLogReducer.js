import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // 관리자 - 결재선 감사로그 조회
    logs: [],
    logsTotal: 0,
    logsLoading: false,
    logsError: null,
};

const apprLogReducer = createSlice({
    name: "apprLog",
    initialState,
    reducers: {

        // 감사로그 조회
        fetchApprLogRequest: (state) => {
            state.logsLoading = true;
            state.logsError = null;
        },
        fetchApprLogSuccess: (state, action) => {
            state.logsLoading = false;
            state.logs = action.payload.content;
            state.logsTotal = action.payload.totalElements;
        },
        fetchApprLogFailure: (state, action) => {
            state.logsLoading = false;
            state.logsError = action.payload;
        },
    },
});

export const {
    fetchApprLogRequest, fetchApprLogSuccess, fetchApprLogFailure,
} = apprLogReducer.actions;

export default apprLogReducer.reducer;