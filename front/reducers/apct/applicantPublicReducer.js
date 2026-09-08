// reducers/apct/applicantPublicReducer.js
// 채용 공개 사이트 - 지원서 제출/내 지원현황/취소
// POST /api/public/applicant/apply, GET /api/public/applicant/me, DELETE /api/public/applicant/{apctId}
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 지원서 제출
  applyLoading: false,
  applyError: null,
  applySuccess: false,
  appliedApplicant: null, // 방금 등록된 지원 상세(apctId 등, 이력서 업로드에 필요)
  updateLoading: false,
  updateError: null,
  updateSuccess: false,


  // 내 지원현황
  myApplications: [],
  myApplicationsLoading: false,
  myApplicationsError: null,

  // 지원 취소
  cancelLoading: false,
  cancelError: null,
  cancelSuccess: false,
};

const applicantPublicReducer = createSlice({
  name: "applicantPublic",
  initialState,
  reducers: {
    resetApplicantPublicState: (state) => {
      state.applyLoading = false;
      state.applyError = null;
      state.applySuccess = false;
      state.cancelLoading = false;
      state.cancelError = null;
      state.cancelSuccess = false;
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },

    // --- 지원서 제출 ---
    applyRequest: (state) => {
      state.applyLoading = true;
      state.applyError = null;
      state.applySuccess = false;
    },
    applySuccessAction: (state, action) => {
      state.applyLoading = false;
      state.applySuccess = true;
      state.appliedApplicant = action.payload.applicant || null;
    },
    applyFailure: (state, action) => {
      state.applyLoading = false;
      state.applyError = action.payload;
      state.applySuccess = false;
    },

    // --- 내 지원현황 ---
    fetchMyApplicationsRequest: (state) => {
      state.myApplicationsLoading = true;
      state.myApplicationsError = null;
    },
    fetchMyApplicationsSuccess: (state, action) => {
      state.myApplicationsLoading = false;
      state.myApplications = action.payload || [];
    },
    fetchMyApplicationsFailure: (state, action) => {
      state.myApplicationsLoading = false;
      state.myApplicationsError = action.payload;
    },

    // --- 지원 수정 ---
    updateApplicationRequest: (state) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    },
    updateApplicationSuccess: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      const { apctId, apctName, apctEmail, apctPhone } = action.payload;
      state.myApplications = state.myApplications.map((a) =>
        a.apctId === apctId ? { ...a, apctName, apctEmail, apctPhone } : a,
      );
    },
    updateApplicationFailure: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
      state.updateSuccess = false;
    },

    // --- 지원 취소 ---
    cancelApplicationRequest: (state) => {
      state.cancelLoading = true;
      state.cancelError = null;
      state.cancelSuccess = false;
    },
    cancelApplicationSuccess: (state, action) => {
      state.cancelLoading = false;
      state.cancelSuccess = true;
      state.myApplications = state.myApplications.filter(
        (a) => a.apctId !== action.payload,
      );
    },
    cancelApplicationFailure: (state, action) => {
      state.cancelLoading = false;
      state.cancelError = action.payload;
      state.cancelSuccess = false;
    },
  },
});

export const {
  resetApplicantPublicState,
  applyRequest,
  applySuccessAction,
  applyFailure,
  fetchMyApplicationsRequest,
  fetchMyApplicationsSuccess,
  fetchMyApplicationsFailure,
  updateApplicationRequest,
  updateApplicationSuccess,
  updateApplicationFailure,
  cancelApplicationRequest,
  cancelApplicationSuccess,
  cancelApplicationFailure,
} = applicantPublicReducer.actions;

export default applicantPublicReducer.reducer;
