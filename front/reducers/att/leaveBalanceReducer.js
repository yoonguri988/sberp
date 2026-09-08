// reducers/att/leaveBalanceReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {

    // ── 내 연차 현황 ──
    // 연도별 연차 잔여 현황 목록 (예: 2025년 15일, 2026년 17일)
    myBalances: [],

    // ── 관리자: 전체 사원 연차 현황 ──
    // 특정 연도의 전 직원 연차 현황
    allBalances: [],

    // ── 관리자: 특정 사원 단건 ──
    // 모달이나 상세 화면에서 한 사원의 연차 정보를 보여줄 때 사용
    currentBalance: null,

    // ── 관리자: 부여/차감 이력 ──
    // 특정 사원이 언제 몇 일을 부여/차감받았는지 이력
    grantHistory: [],

    // ── 공통 ──
    loading: false,
    error: null,
    success: false,
};

// ============================================================
//  2. createSlice
// ============================================================

const leaveBalanceSlice = createSlice({
    name: "leave",
    initialState,
    reducers: {

        // ── 상태 초기화 ──
        resetLeaveState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },

        // 상세/이력 데이터 정리 (페이지 이탈 시 cleanup)
        clearLeaveDetail: (state) => {
            state.currentBalance = null;
            state.grantHistory = [];
        },

        // ================================================================
        //  조회 actions
        // ================================================================
        
        // ── 사용자: 내 연차 현황 조회 ──
        fetchMyBalancesRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchMyBalancesSuccess: (state, action) => {
            state.loading = false;
            state.myBalances = action.payload;
        },
        fetchMyBalancesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── 사용자: 본인 이력 조회 ──
        fetchMyGrantsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchMyGrantsSuccess: (state, action) => {
            state.loading = false;
            state.grantHistory = action.payload;
        },
        fetchMyGrantsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── 관리자: 전체 사원 연차 조회 ──
        fetchAllBalancesRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchAllBalancesSuccess: (state, action) => {
            state.loading = false;
            // action.payload = LeaveBalanceResponse[]
            state.allBalances = action.payload;
        },
        fetchAllBalancesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── 관리자: 사원 단건 연차 조회 ──
        fetchBalanceRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchBalanceSuccess: (state, action) => {
            state.loading = false;
            state.currentBalance = action.payload;
        },
        fetchBalanceFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── 관리자: 부여/차감 이력 조회 ──
        fetchGrantHistoryRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchGrantHistorySuccess: (state, action) => {
            state.loading = false;
            // action.payload = LeaveGrantResponse[]
            state.grantHistory = action.payload;
        },
        fetchGrantHistoryFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── 관리자: 연차 일괄 계산  ──
        calculateAllRequest: (state) => { 
            state.loading = true; 
            state.error = null; 
        },
        calculateAllSuccess: (state) => { 
            state.loading = false; 
            state.success = true; 
        },
        calculateAllFailure: (state, action) => { 
            state.loading = false; 
            state.error = action.payload; 
        },

        // ================================================================
        //  쓰기
        // ================================================================

        // ── 연차 발생 (관리자) ──
        calculateRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        calculateSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
        },
        calculateFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── 연차 차감 ──
        deductRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        deductSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
        },
        deductFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // ── 연차 수동 조정 (관리자) ──
        adjustRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        adjustSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
        },
        adjustFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

// ============================================================
//  3. action creator export
// ============================================================
export const {
    resetLeaveState, clearLeaveDetail,
    fetchMyBalancesRequest, fetchMyBalancesSuccess, fetchMyBalancesFailure,
    fetchMyGrantsRequest, fetchMyGrantsSuccess, fetchMyGrantsFailure,
    fetchAllBalancesRequest, fetchAllBalancesSuccess, fetchAllBalancesFailure,
    fetchBalanceRequest, fetchBalanceSuccess, fetchBalanceFailure,
    fetchGrantHistoryRequest, fetchGrantHistorySuccess, fetchGrantHistoryFailure,
    calculateRequest, calculateSuccess, calculateFailure,
    deductRequest, deductSuccess, deductFailure,
    adjustRequest, adjustSuccess, adjustFailure,
    calculateAllRequest, calculateAllSuccess, calculateAllFailure,
} = leaveBalanceSlice.actions;

// ============================================================
//  4. reducer export
// ============================================================
export default leaveBalanceSlice.reducer;