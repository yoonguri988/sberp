// reducers/sal/salPolicyReducer.js
// 급여 계산 정책 관리
// 4대보험요율(salrateplcy, ROOT), 소득세구간표(salinctaxbrkt, ROOT)
// 식대정책(salmealalwplcy, ADMIN), 직책수당정책(salposalw, ADMIN)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 4대보험 요율 정책
  rateList: [],
  rateLoading: false,

  // 소득세 간이 구간표
  taxBracketList: [],
  taxBracketLoading: false,

  // 식대 정책
  mealPolicyList: [],
  mealPolicyLoading: false,

  // 직책수당 정책
  posAllowanceList: [],
  posAllowanceLoading: false,

  // 공통(등록 처리)
  saving: false,
  error: null,
  success: false,
};

const salPolicyReducer = createSlice({
  name: "salPolicy",
  initialState,
  reducers: {
    resetSalPolicyState: (state) => {
      state.saving = false;
      state.success = false;
      state.error = null;
    },

    // --- 4대보험 요율 정책 ---
    fetchRatePolicyRequest: (state) => {
      state.rateLoading = true;
    },
    fetchRatePolicySuccess: (state, action) => {
      state.rateLoading = false;
      state.rateList = action.payload;
    },
    fetchRatePolicyFailure: (state) => {
      state.rateLoading = false;
    },
    createRatePolicyRequest: (state) => {
      state.saving = true;
      state.error = null;
      state.success = false;
    },
    createRatePolicySuccess: (state) => {
      state.saving = false;
      state.success = true;
    },
    createRatePolicyFailure: (state, action) => {
      state.saving = false;
      state.error = action.payload;
    },

    // --- 소득세 간이 구간표 ---
    fetchTaxBracketRequest: (state) => {
      state.taxBracketLoading = true;
    },
    fetchTaxBracketSuccess: (state, action) => {
      state.taxBracketLoading = false;
      state.taxBracketList = action.payload;
    },
    fetchTaxBracketFailure: (state) => {
      state.taxBracketLoading = false;
    },
    createTaxBracketRequest: (state) => {
      state.saving = true;
      state.error = null;
      state.success = false;
    },
    createTaxBracketSuccess: (state) => {
      state.saving = false;
      state.success = true;
    },
    createTaxBracketFailure: (state, action) => {
      state.saving = false;
      state.error = action.payload;
    },

    // --- 식대 정책 ---
    fetchMealPolicyRequest: (state) => {
      state.mealPolicyLoading = true;
    },
    fetchMealPolicySuccess: (state, action) => {
      state.mealPolicyLoading = false;
      state.mealPolicyList = action.payload;
    },
    fetchMealPolicyFailure: (state) => {
      state.mealPolicyLoading = false;
    },
    createMealPolicyRequest: (state) => {
      state.saving = true;
      state.error = null;
      state.success = false;
    },
    createMealPolicySuccess: (state) => {
      state.saving = false;
      state.success = true;
    },
    createMealPolicyFailure: (state, action) => {
      state.saving = false;
      state.error = action.payload;
    },

    // --- 직책수당 정책 ---
    fetchPosAllowanceRequest: (state) => {
      state.posAllowanceLoading = true;
    },
    fetchPosAllowanceSuccess: (state, action) => {
      state.posAllowanceLoading = false;
      state.posAllowanceList = action.payload;
    },
    fetchPosAllowanceFailure: (state) => {
      state.posAllowanceLoading = false;
    },
    createPosAllowanceRequest: (state) => {
      state.saving = true;
      state.error = null;
      state.success = false;
    },
    createPosAllowanceSuccess: (state) => {
      state.saving = false;
      state.success = true;
    },
    createPosAllowanceFailure: (state, action) => {
      state.saving = false;
      state.error = action.payload;
    },
  },
});

export const {
  resetSalPolicyState,
  fetchRatePolicyRequest,
  fetchRatePolicySuccess,
  fetchRatePolicyFailure,
  createRatePolicyRequest,
  createRatePolicySuccess,
  createRatePolicyFailure,
  fetchTaxBracketRequest,
  fetchTaxBracketSuccess,
  fetchTaxBracketFailure,
  createTaxBracketRequest,
  createTaxBracketSuccess,
  createTaxBracketFailure,
  fetchMealPolicyRequest,
  fetchMealPolicySuccess,
  fetchMealPolicyFailure,
  createMealPolicyRequest,
  createMealPolicySuccess,
  createMealPolicyFailure,
  fetchPosAllowanceRequest,
  fetchPosAllowanceSuccess,
  fetchPosAllowanceFailure,
  createPosAllowanceRequest,
  createPosAllowanceSuccess,
  createPosAllowanceFailure,
} = salPolicyReducer.actions;

export default salPolicyReducer.reducer;
