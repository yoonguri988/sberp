// reducers/apct/apctAuthReducer.js
// 지원자(채용 공개 사이트) 전용 인증 상태.
// 사내 직원 로그인(state.auth)과는 완전히 분리된 별도 슬라이스이다.
// - 사원 로그인: /auth/login (이메일/비번) → accessToken + refreshToken(HttpOnly 쿠키)
// - 지원자 로그인: 소셜(OAuth2, kakao/naver/google) → /oauth2/authorization/{provider} 리다이렉트
//   → 백엔드가 인증 성공 후 /oauth2/callback?token=... 으로 accessToken만 발급해 리다이렉트
//   (지원자용 refreshToken/재발급 엔드포인트는 없음 → accessToken 만료 시 재로그인 필요)
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  apctUser: null, // { provider, providerId, email, type: "APPLICANT" }
  apctAccessToken: null,
  loading: false,
  error: null,
  // 새로고침 직후 쿠키 → accessToken 복원 시도가 끝났는지 여부 (ApplicantLayout 가드용)
  initialized: false,
};

const apctAuthReducer = createSlice({
  name: "apctAuth",
  initialState,
  reducers: {
    // --- 상태 초기화 ---
    resetApctAuthState: (state) => {
      state.loading = false;
      state.error = null;
    },

    // --- oauth2/callback에서 받은 token 저장 ---
    applyApctTokenRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    applyApctTokenSuccess: (state, action) => {
      state.loading = false;
      state.apctUser = action.payload.apctUser || null;
      state.apctAccessToken = action.payload.apctAccessToken || null;
      state.initialized = true;
    },
    applyApctTokenFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.apctUser = null;
      state.apctAccessToken = null;
      state.initialized = true;
    },

    // --- 새로고침 시 쿠키에서 세션 복원 ---
    loadApctUserRequest: (state) => {
      state.loading = true;
    },
    loadApctUserSuccess: (state, action) => {
      state.loading = false;
      state.apctUser = action.payload.apctUser || null;
      state.apctAccessToken = action.payload.apctAccessToken || null;
      state.initialized = true;
    },
    loadApctUserFailure: (state) => {
      state.loading = false;
      state.apctUser = null;
      state.apctAccessToken = null;
      state.initialized = true;
    },

    // --- axios 인터셉터: accessToken 만료(401) 감지 → 세션 종료 ---
    apctSessionExpired: (state) => {
      state.apctUser = null;
      state.apctAccessToken = null;
      state.initialized = true;
    },

    // --- 로그아웃(클라이언트 측 - 서버에 별도 로그아웃 API 없음, 토큰 폐기만) ---
    apctLogout: (state) => {
      state.apctUser = null;
      state.apctAccessToken = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  resetApctAuthState,
  applyApctTokenRequest,
  applyApctTokenSuccess,
  applyApctTokenFailure,
  loadApctUserRequest,
  loadApctUserSuccess,
  loadApctUserFailure,
  apctSessionExpired,
  apctLogout,
} = apctAuthReducer.actions;

export default apctAuthReducer.reducer;
