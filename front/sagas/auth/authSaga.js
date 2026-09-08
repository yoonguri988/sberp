// auth/authSaga.js
import { all, call, put, take, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
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
} from "../../reducers/auth/authReducer";
import Cookies from "js-cookie";
import { decodeUser, isTokenExpired } from "../../utils/jwt";

const AUTH_API_BASE = "/auth";

// --- 로그인 ---
export const loginApi = (payload) =>
  api.post(`${AUTH_API_BASE}/login`, payload, { withCredentials: true });
export function* login(action) {
  try {
    const res = yield call(loginApi, action.payload);
    const { accessToken } = res.data;

    if (!accessToken) {
      yield put(loginFailure("로그인 응답이 올바르지 않습니다."));
      return;
    }

    if (typeof window !== "undefined") {
      Cookies.set("accessToken", accessToken);
    }

    const user = decodeUser(accessToken); // ★ 토큰에서 empName/empEmail/roles까지 추출

    yield put(loginSuccess({ user, accessToken }));
  } catch (err) {
    yield put(loginFailure(err.response?.data?.error || "로그인 실패"));
  }
}

// --- 사용자 정보 로드 (새로고침 시 세션 복원용) ---
export function* loadUser() {
  try {
    let accessToken =
      typeof window !== "undefined" ? Cookies.get("accessToken") : null;

    // accessToken 쿠키가 없거나 만료됐으면, HttpOnly refreshToken으로 재발급 시도
    if (!accessToken || isTokenExpired(accessToken)) {
      try {
        const res = yield call(refreshTokenApi); // POST /auth/refresh (withCredentials)
        accessToken = res.data?.accessToken;
        if (!accessToken) throw new Error("no accessToken");
        if (typeof window !== "undefined")
          Cookies.set("accessToken", accessToken);
      } catch (e) {
        if (typeof window !== "undefined") Cookies.remove("accessToken");
        yield put(loadUserFailure("세션이 만료되었습니다."));
        return;
      }
    }

    const user = decodeUser(accessToken);
    yield put(loadUserSuccess({ user, accessToken }));
  } catch (err) {
    if (typeof window !== "undefined") Cookies.remove("accessToken");
    yield put(loadUserFailure("세션 정보를 불러오지 못했습니다."));
  }
}

// --- 토큰 재발급 ---
export const refreshTokenApi = () =>
  api.post(`${AUTH_API_BASE}/refresh`, {}, { withCredentials: true });
export function* refreshToken() {
  try {
    const res = yield call(refreshTokenApi);
    const { accessToken } = res.data;

    if (typeof window !== "undefined") {
      Cookies.set("accessToken", accessToken);
    }

    // 새 토큰의 클레임(pwdChangeRequired 등)을 반영하도록 user도 함께 갱신
    const user = decodeUser(accessToken);

    yield put(refreshTokenSuccess({ accessToken, user }));
  } catch (err) {
    yield put(refreshTokenFailure(err.response?.data?.error || "재발급 실패"));
  }
}

// --- 로그아웃 ---
export const logoutApi = () =>
  api.post(`${AUTH_API_BASE}/logout`, {}, { withCredentials: true });
export function* logout() {
  try {
    yield call(logoutApi);
    if (typeof window !== "undefined") {
      Cookies.remove("accessToken");
    }
    yield put(logoutSuccess());
  } catch (err) {
    yield put(logoutFailure(err.response?.data?.error || "로그아웃 실패"));
  }
}

// --- 비밀번호 재설정 - 본인확인 ---
// 성공(state: OK) 시 서버가 등록된 이메일로 재설정 링크를 발송한다.
// resetToken은 더 이상 응답에 포함되지 않으며, 사용자는 메일의 링크(?token=...)를 통해서만
// forgotResetPass 페이지에 접근할 수 있다.
export const confirmApi = (payload) =>
  api.post(`${AUTH_API_BASE}/confirm`, payload);
export function* confirm(action) {
  try {
    const res = yield call(confirmApi, action.payload);
    yield put(confirmSuccess(res.data));
  } catch (err) {
    yield put(confirmFailure(err.response?.data?.error || "본인확인 실패"));
  }
}

// --- 비밀번호 재설정 (비로그인, resetToken 기반) ---
// resetToken은 이메일 링크의 쿼리스트링에서 읽어 forgotResetPass 페이지가 payload로 직접 넘겨준다.
export const updatePassApi = (payload) =>
  api.post(`${AUTH_API_BASE}/updatePass`, payload);
export function* updatePass(action) {
  try {
    yield call(updatePassApi, action.payload);
    yield put(updatePassSuccess());
  } catch (err) {
    yield put(
      updatePassFailure(err.response?.data?.error || "비밀번호 재설정 실패"),
    );
  }
}

// --- 비밀번호 변경 (로그인 상태) ---
export const changePasswordApi = (payload) =>
  api.put(`${AUTH_API_BASE}/password`, payload);
export function* changePassword(action) {
  try {
    yield call(changePasswordApi, action.payload);
    yield put(changePasswordSuccess());
  } catch (err) {
    yield put(
      changePasswordFailure(err.response?.data?.error || "비밀번호 변경 실패"),
    );
  }
}

function* watchLogin() {
  yield takeLatest(loginRequest.type, login);
}
function* watchLoadUser() {
  yield takeLatest(loadUserRequest.type, loadUser);
}
function* watchRefreshToken() {
  yield takeLatest(refreshTokenRequest.type, refreshToken);
}
function* watchLogout() {
  yield takeLatest(logoutRequest.type, logout);
}
function* watchConfirm() {
  yield takeLatest(confirmRequest.type, confirm);
}
function* watchUpdatePass() {
  yield takeLatest(updatePassRequest.type, updatePass);
}
function* watchChangePassword() {
  yield takeLatest(changePasswordRequest.type, changePassword);
}

export default function* authSaga() {
  yield all([
    call(watchLogin),
    call(watchLoadUser),
    call(watchRefreshToken),
    call(watchLogout),
    call(watchConfirm),
    call(watchUpdatePass),
    call(watchChangePassword),
  ]);
}
