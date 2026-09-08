// reducers/perm/permReducer.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    // 권한 목록
    permList: [],

    // 권한 상세
    currentPerm: null,
    permEmployees: [],     // 해당 권한을 가진 사원 목록

    // 사원별 권한 조회
    empAuthList: [],       // 특정 사원이 보유한 권한 목록
    empAuthTargetId: null, // 조회 대상 사원 ID

    // 공통
    loading: false,
    error: null,
    success: false,
};

const permReducer = createSlice({
    name: "perm",
    initialState,
    reducers: {

        // --- 상태 초기화 ---
        resetPermState: (state) => {
            state.loading = false;
            state.success = false;
            state.error = null;
        },
        clearPermDetail: (state) => {
            state.currentPerm = null;
            state.permEmployees = [];
        },
        clearEmpAuth: (state) => {
            state.empAuthList = [];
            state.empAuthTargetId = null;
        },

        // --- 권한 목록 조회 ---
        listPermRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        listPermSuccess: (state, action) => {
            state.loading = false;
            state.permList = action.payload;
        },
        listPermFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 권한 상세 조회 (권한 정보 + 부여된 사원 목록) ---
        detailPermRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        detailPermSuccess: (state, action) => {
            state.loading = false;
            state.currentPerm = action.payload.role;
            state.permEmployees = action.payload.employees;
        },
        detailPermFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 권한 등록 ---
        createPermRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        createPermSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        createPermFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 권한 수정 ---
        updatePermRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        updatePermSuccess: (state, action) => {
            state.loading = false;
            state.currentPerm = action.payload;
            state.success = true;
        },
        updatePermFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 권한 삭제 ---
        deletePermRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        deletePermSuccess: (state, action) => {
            state.loading = false;
            state.success = true;
            state.permList = state.permList.filter(perm => perm.autId !== action.payload);
        },
        deletePermFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 사원별 권한 목록 조회 ---
        empAuthListRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        empAuthListSuccess: (state, action) => {
            state.loading = false;
            state.empAuthTargetId = action.payload.empId;
            state.empAuthList = action.payload.authorities;
        },
        empAuthListFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 사원에게 권한 부여 ---
        grantPermRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        grantPermSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        grantPermFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // --- 사원의 권한 회수 ---
        revokePermRequest: (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        },
        revokePermSuccess: (state) => {
            state.loading = false;
            state.success = true;
        },
        revokePermFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
    }
});

export const {
    resetPermState, clearPermDetail, clearEmpAuth,
    listPermRequest, listPermSuccess, listPermFailure,
    detailPermRequest, detailPermSuccess, detailPermFailure,
    createPermRequest, createPermSuccess, createPermFailure,
    updatePermRequest, updatePermSuccess, updatePermFailure,
    deletePermRequest, deletePermSuccess, deletePermFailure,
    empAuthListRequest, empAuthListSuccess, empAuthListFailure,
    grantPermRequest, grantPermSuccess, grantPermFailure,
    revokePermRequest, revokePermSuccess, revokePermFailure,
} = permReducer.actions;

export default permReducer.reducer;
