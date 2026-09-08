import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    summary: null,
    summaryLoading: false,
    summaryError: null,
};

const memberDashboardReducer = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        fetchSummaryRequest: (state) => {
            state.summaryLoading = true;
            state.summaryError = null;
        },
        fetchSummarySuccess: (state, action) => {
            state.summaryLoading = false;
            state.summary = action.payload;
        },
        fetchSummaryFailure: (state, action) => {
            state.summaryLoading = false;
            state.summaryError = action.payload;
        },
    },
});

export const {
    fetchSummaryRequest, fetchSummarySuccess, fetchSummaryFailure,
} = memberDashboardReducer.actions;

export default memberDashboardReducer.reducer;