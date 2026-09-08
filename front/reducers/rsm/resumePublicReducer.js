// reducers/rsm/resumePublicReducer.js
// 지원자 본인 이력서 업로드 - POST /api/public/resume (multipart: request(json) + file(pdf))
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uploadLoading: false,
  uploadError: null,
  uploadSuccess: false,
  uploaded: null, // ResumeResponse
};

const resumePublicReducer = createSlice({
  name: "resumePublic",
  initialState,
  reducers: {
    resetResumePublicState: (state) => {
      state.uploadLoading = false;
      state.uploadError = null;
      state.uploadSuccess = false;
    },

    uploadResumeRequest: (state) => {
      state.uploadLoading = true;
      state.uploadError = null;
      state.uploadSuccess = false;
    },
    uploadResumeSuccess: (state, action) => {
      state.uploadLoading = false;
      state.uploadSuccess = true;
      state.uploaded = action.payload;
    },
    uploadResumeFailure: (state, action) => {
      state.uploadLoading = false;
      state.uploadError = action.payload;
      state.uploadSuccess = false;
    },
  },
});

export const {
  resetResumePublicState,
  uploadResumeRequest,
  uploadResumeSuccess,
  uploadResumeFailure,
} = resumePublicReducer.actions;

export default resumePublicReducer.reducer;
