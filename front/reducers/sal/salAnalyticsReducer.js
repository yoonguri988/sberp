// reducers/sal/salAnalyticsReducer.js
// 급여 분석 대시보드 - Django 분석 서비스(GET /api/analytics/salary/summary) 조회 결과.
// 기존 salPay 등과 달리 이 리듀서는 등록/수정 같은 쓰기 액션이 없다. 조회 전용.
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  latestMonth: null,
  deptAverage: [], // [{ deptId, deptName, empCount, avgBaseSal, avgNetPay }]
  monthlyTrend: [], // [{ payMonth, totalBaseSal, totalAllow, totalDedt, totalNetPay, payCount }]
  itemBreakdown: [], // [{ itemCode, itemLabel, totalAmt }]
  statusDistribution: [], // [{ status, statusLabel, count }]
  months: 6,
  loading: false,
  error: null,
};

const salAnalyticsReducer = createSlice({
  name: "salAnalytics",
  initialState,
  reducers: {
    fetchSalAnalyticsRequest: (state, action) => {
      state.loading = true;
      state.error = null;
      state.months = action.payload?.months || state.months;
    },
    fetchSalAnalyticsSuccess: (state, action) => {
      state.loading = false;
      state.latestMonth = action.payload.latestMonth;
      state.deptAverage = action.payload.deptAverage || [];
      state.monthlyTrend = action.payload.monthlyTrend || [];
      state.itemBreakdown = action.payload.itemBreakdown || [];
      state.statusDistribution = action.payload.statusDistribution || [];
    },
    fetchSalAnalyticsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetSalAnalyticsState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchSalAnalyticsRequest,
  fetchSalAnalyticsSuccess,
  fetchSalAnalyticsFailure,
  resetSalAnalyticsState,
} = salAnalyticsReducer.actions;

export default salAnalyticsReducer.reducer;
