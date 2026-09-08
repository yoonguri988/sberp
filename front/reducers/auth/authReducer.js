// auth/authReducer.js
import { createSlice } from "@reduxjs/toolkit";

// 초기화
const initialState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
  success: false,
  // 새로고침 직후 loadUserRequest(쿠키 → accessToken 복원)가 끝났는지 여부.
  // false인 동안은 "아직 로그인 여부를 확인 중"인 상태이며, 이때 accessToken===null이라고
  // 곧바로 비로그인으로 단정하면 안 된다. (AppLayout의 리다이렉트 가드에서 사용)
  initialized: false,
};

// 상태변화
const authReducer = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ---상태 초기화---
    resetUserState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },

    // --- 로그인 ---
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user || null;
      state.accessToken = action.payload.accessToken || null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
    },

    // ---토큰 재발급--- ResponseEntity<Map<String, Object>>
    refreshTokenRequest: (state) => {
      state.loading = true;
    },
    refreshTokenSuccess: (state, action) => {
      state.loading = false;
      state.accessToken = action.payload?.accessToken || null;
      // 새로 발급된 토큰의 클레임(예: pwdChangeRequired)이 최신 상태이므로 user도 함께 갱신
      state.user = action.payload?.user || state.user;
    },
    refreshTokenFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
      // refresh 실패 = 로그인 세션 종료로 보는 게 일반적
      state.user = null;
      state.accessToken = null;
    },

    // ---로그아웃---
    logoutRequest: (state) => {
      state.loading = true;
    },
    logoutSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.user = null;
      state.accessToken = null;
      state.success = false;
    },
    logoutFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // --- axios 인터셉터: accessToken 자동(silent) 갱신 성공 ---
    // api 호출 도중 401 → refreshToken 으로 accessToken 재발급에 성공했을 때
    // 화면(로딩 스피너 등)에 영향 주지 않고 user/accessToken 정보만 조용히 갱신한다.
    tokenRefreshed: (state, action) => {
      state.user = action.payload.user || state.user;
      state.accessToken = action.payload.accessToken || null;
      state.initialized = true;
    },

    // --- axios 인터셉터: refreshToken 까지 만료되어 세션이 종료된 경우 ---
    sessionExpired: (state, action) => {
      state.loading = false;
      state.user = null;
      state.accessToken = null;
      state.initialized = true;
      state.error =
        action.payload || "로그인 정보가 없습니다. 다시 로그인해 주세요.";
    },

    // --- 사용자 정보 로드 ---
    loadUserRequest: (state) => {
      state.loading = true;
    },
    loadUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user || null;
      state.accessToken = action.payload.accessToken || null;
      state.initialized = true;
    },
    loadUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.accessToken = null;
      state.initialized = true;
    },

    // --- 비밀번호 재설정 - 본인확인 (/auth/confirm)---
    confirmRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    confirmSuccess: (state, action) => {
      state.loading = false;
      // resetToken은 store에 안 두고 saga에서 sessionStorage 등으로 별도 관리 추천
      state.success = action.payload.state === "OK";
    },
    confirmFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---비밀번호 재설정 (비로그인, resetToken) (/auth/updatePass)---
    updatePassRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updatePassSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    updatePassFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ---비밀번호 변경 (로그인 상태) (/auth/password)---
    changePasswordRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    changePasswordSuccess: (state) => {
      state.loading = false;
      state.success = true;
    },
    changePasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

//3. action
export const {
  resetUserState,
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  tokenRefreshed,
  sessionExpired,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  loadUserRequest,
  loadUserSuccess,
  loadUserFailure,
  confirmRequest,
  confirmSuccess,
  confirmFailure,
  updatePassRequest,
  updatePassSuccess,
  updatePassFailure,
  changePasswordRequest,
  changePasswordSuccess,
  changePasswordFailure,
} = authReducer.actions;

//4. export
export default authReducer.reducer;
