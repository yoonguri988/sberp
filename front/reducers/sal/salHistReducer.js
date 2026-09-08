// reducers/sal/salHistReducer.js
// 급여 변경이력(SalHist) 조회 - GET /api/salhist (조회 전용, 등록/수정 없음)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  histList: [],
  paging: null, // { totalElements, totalPages, number, size }
  loading: false,
  error: null,
};

const salHistReducer = createSlice({
  name: "salHist",
  initialState,
  reducers: {
    resetSalHistState: (state) => {
      state.loading = false;
      state.error = null;
    },

    searchSalHistRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    searchSalHistSuccess: (state, action) => {
      state.loading = false;
      state.histList = action.payload.content || [];
      state.paging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    searchSalHistFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  resetSalHistState,
  searchSalHistRequest,
  searchSalHistSuccess,
  searchSalHistFailure,
} = salHistReducer.actions;

export default salHistReducer.reducer;
