import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notices: [],
    noticesPaging: null,
    totalCnt: 0,          // 뱃지용 전체 건수 (긴급공지 제외 전체)
    currentNotice: null,
    loading: false,
    error: null,
    success: false,
    deleteSuccess: false
}
const noticeReducer = createSlice({
    name: "notice",
    initialState,
    reducers: {
        // 전체 목록
        fetchNoticeRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchNoticeSuccess: (state, action) => {
            state.loading = false;
            state.notices = action.payload.notices;
            state.noticesPaging = action.payload.paging;
            state.totalCnt = action.payload.totalCnt;
        },
        fetchNoticeFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        
        // 상세 조회
        fetchNoticeDetailRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        fetchNoticeDetailSuccess: (state, action) => {
            state.loading = false;
            state.currentNotice = action.payload; 
            //state.success = true;
        },
        fetchNoticeDetailFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // 공지 등록
        createNoticeRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        createNoticeSuccess: (state, action) => {
            state.loading = false;
            state.notices.unshift(action.payload.notice);
            state.success = true;
        },
        createNoticeFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // 공지 수정
        updateNoticeRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        updateNoticeSuccess: (state,action) => {
            state.loading = false;
            const updatedNotice = action.payload.notice;
            state.notices = state.notices.map(n =>
                n.bno === updatedNotice.bno ? updatedNotice : n
            );
            state.currentNotice = updatedNotice;
            state.success = true;
        },
        updateNoticeFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        },

        // 공지 삭제
        deleteNoticeRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.deleteSuccess = false;
        },
        deleteNoticeSuccess: (state, action) => {
            state.loading = false;
            state.notices = state.notices.filter(n => n.bno !== action.payload);
            state.deleteSuccess = true;
        },
        deleteNoticeFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.deleteSuccess = false;
        },

        // 공지 초기화
        resetNoticeState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
            state.deleteSuccess = false;
            state.currentNotice = null;
        },
    }
});

export const {
    fetchNoticeRequest, fetchNoticeSuccess, fetchNoticeFailure,
    fetchNoticeDetailRequest, fetchNoticeDetailSuccess, fetchNoticeDetailFailure,
    createNoticeRequest, createNoticeSuccess, createNoticeFailure,
    updateNoticeRequest, updateNoticeSuccess, updateNoticeFailure,
    deleteNoticeRequest, deleteNoticeSuccess, deleteNoticeFailure,
    resetNoticeState
} = noticeReducer.actions;

export default noticeReducer.reducer;