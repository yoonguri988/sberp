// sagas/apct/apctAuthSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import Cookies from "js-cookie";
import {
  applyApctTokenRequest,
  applyApctTokenSuccess,
  applyApctTokenFailure,
  loadApctUserRequest,
  loadApctUserSuccess,
  loadApctUserFailure,
  apctLogout,
} from "../../reducers/apct/apctAuthReducer";
import { APCT_TOKEN_COOKIE } from "../../api/apctAxios";
import { decodeApctUser, isApctTokenExpired } from "../../utils/apctJwt";

// --- /oauth2/callback?token=... 으로 넘어온 토큰을 저장 ---
export function* applyApctToken(action) {
  try {
    const token = action.payload?.token;
    if (!token || isApctTokenExpired(token)) {
      yield put(applyApctTokenFailure("유효하지 않은 로그인 토큰입니다."));
      return;
    }
    const apctUser = decodeApctUser(token);
    if (!apctUser) {
      yield put(applyApctTokenFailure("지원자 인증 토큰이 아닙니다."));
      return;
    }
    if (typeof window !== "undefined") {
      Cookies.set(APCT_TOKEN_COOKIE, token);
    }
    yield put(
      applyApctTokenSuccess({ apctUser, apctAccessToken: token }),
    );
  } catch (err) {
    yield put(applyApctTokenFailure("로그인 처리 중 오류가 발생했습니다."));
  }
}

// --- 새로고침 시 쿠키에서 세션 복원 (지원자는 refresh 엔드포인트가 없으므로
//     accessToken 쿠키만 확인한다. 만료되었으면 그냥 비로그인 상태) ---
export function* loadApctUser() {
  try {
    const token =
      typeof window !== "undefined" ? Cookies.get(APCT_TOKEN_COOKIE) : null;

    if (!token || isApctTokenExpired(token)) {
      if (typeof window !== "undefined") Cookies.remove(APCT_TOKEN_COOKIE);
      yield put(loadApctUserFailure());
      return;
    }

    const apctUser = decodeApctUser(token);
    if (!apctUser) {
      yield put(loadApctUserFailure());
      return;
    }

    yield put(loadApctUserSuccess({ apctUser, apctAccessToken: token }));
  } catch (err) {
    yield put(loadApctUserFailure());
  }
}

// --- 로그아웃(클라이언트 측 토큰 폐기) ---
export function* logoutApct() {
  if (typeof window !== "undefined") {
    Cookies.remove(APCT_TOKEN_COOKIE);
  }
}

function* watchApplyApctToken() {
  yield takeLatest(applyApctTokenRequest.type, applyApctToken);
}
function* watchLoadApctUser() {
  yield takeLatest(loadApctUserRequest.type, loadApctUser);
}
function* watchApctLogout() {
  yield takeLatest(apctLogout.type, logoutApct);
}

export default function* apctAuthSaga() {
  yield all([
    call(watchApplyApctToken),
    call(watchLoadApctUser),
    call(watchApctLogout),
  ]);
}
