// auth/authSaga.test.js
// call - 동기 - 제너레이터함수 function* 일시중단 후 결과물 받기
// put  - redux 액션 디스패치 확인
import { call, put } from "redux-saga/effects";
import Cookies from "js-cookie";
import api from "../../api/axios";

import {
  login,
  refreshToken,
  logout,
  confirm,
  updatePass,
  changePassword,
} from "../auth/authSaga";

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

// Cookies는 브라우저 API라 실제로 쓰면 안 되므로 spy 처리
jest.mock("js-cookie", () => ({
  set: jest.fn(),
  remove: jest.fn(),
}));

// authSaga의 decodeUser()가 jwtDecode(accessToken)으로 유저 정보를 뽑아오므로,
// 가짜 accessToken 문자열("token-abc")을 실제 JWT처럼 파싱하려 하면 에러가 납니다.
// jwt-decode 자체를 mock해서 claims를 직접 지정합니다.
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(() => ({
    sub: 1,
    comId: 10,
    empNo: "EMP001",
    empName: "홍길동",
    posName: "사원",
    comName: "테스트회사",
    empEmail: "a@a.com",
    roles: ["ROLE_USER"],
  })),
}));

describe("auth saga", () => {
  afterEach(() => {
    jest.clearAllMocks();
    window.sessionStorage.clear();
  });

  // --- 로그인 ---
  it("login success", () => {
    const payload = { empEmail: "a@a.com", empPass: "1234" };
    const generator = login(loginRequest(payload));

    // 1단계: API 호출 (call)
    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    // 2단계: API 성공했다는 가정하에 결과값 전달 (user 정보는 saga가 accessToken을 디코딩해서 만듦)
    const mockResponse = { data: { accessToken: "token-abc" } };
    const putStep = generator.next(mockResponse).value;

    // 3단계: 성공 액션 디스패치 확인 (decodeUser가 jwtDecode 결과에서 뽑아내는 필드들)
    const expectedUser = {
      empId: 1,
      comId: 10,
      empNo: "EMP001",
      empName: "홍길동",
      posName: "사원",
      comName: "테스트회사",
      empEmail: "a@a.com",
      roles: ["ROLE_USER"],
    };
    expect(putStep).toEqual(
      put(loginSuccess({ user: expectedUser, accessToken: "token-abc" })),
    );
    expect(Cookies.set).toHaveBeenCalledWith("accessToken", "token-abc");
    expect(generator.next().done).toBe(true); // 제너레이터 완전종료
  });

  it("login failure - accessToken이 없는 응답", () => {
    const payload = { empEmail: "a@a.com", empPass: "1234" };
    const generator = login(loginRequest(payload));

    generator.next(); // call

    const mockResponse = { data: {} };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(
      put(loginFailure("로그인 응답이 올바르지 않습니다.")),
    );
    expect(Cookies.set).not.toHaveBeenCalled();
    expect(generator.next().done).toBe(true);
  });

  it("login failure - API 에러 응답", () => {
    const payload = { empEmail: "a@a.com", empPass: "1234" };
    const generator = login(loginRequest(payload));

    generator.next(); // call

    const error = {
      response: {
        data: { error: "이메일 또는 비밀번호가 올바르지 않습니다." },
      },
    };
    const putStep = generator.throw(error).value; // catch 블록으로 진입

    expect(putStep).toEqual(
      put(loginFailure("이메일 또는 비밀번호가 올바르지 않습니다.")),
    );
    expect(generator.next().done).toBe(true);
  });

  // --- 토큰 재발급 ---
  it("refreshToken success", () => {
    const generator = refreshToken(refreshTokenRequest());

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = { data: { accessToken: "new-token" } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(
      put(refreshTokenSuccess({ accessToken: "new-token" })),
    );
    expect(generator.next().done).toBe(true);
  });

  it("refreshToken failure", () => {
    const generator = refreshToken(refreshTokenRequest());
    generator.next();

    const error = { response: { data: { error: "Invalid refresh token" } } };
    const putStep = generator.throw(error).value;

    expect(putStep).toEqual(put(refreshTokenFailure("Invalid refresh token")));
    expect(generator.next().done).toBe(true);
  });

  // --- 로그아웃 ---
  it("logout success", () => {
    const generator = logout(logoutRequest());

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const putStep = generator.next({}).value;

    expect(putStep).toEqual(put(logoutSuccess()));
    expect(Cookies.remove).toHaveBeenCalledWith("accessToken");
    expect(generator.next().done).toBe(true);
  });

  it("logout failure - 쿠키는 삭제하지 않음", () => {
    const generator = logout(logoutRequest());
    generator.next();

    const error = { response: { data: { error: "서버 오류" } } };
    const putStep = generator.throw(error).value;

    expect(putStep).toEqual(put(logoutFailure("서버 오류")));
    expect(Cookies.remove).not.toHaveBeenCalled();
  });

  // --- 비밀번호 재설정 - 본인확인 ---
  it("confirm success (state: OK)", () => {
    const payload = { empNo: "1", empEmail: "a@a.com", empMobile: "010" };
    const generator = confirm(confirmRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const mockResponse = {
      data: { state: "OK", resetToken: "reset-token-xyz" },
    };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(confirmSuccess(mockResponse.data)));
    expect(window.sessionStorage.getItem("resetToken")).toBe("reset-token-xyz");
    expect(generator.next().done).toBe(true);
  });

  it("confirm - state가 FAIL이면 sessionStorage에 저장 안함", () => {
    const payload = { empNo: "1", empEmail: "a@a.com", empMobile: "010" };
    const generator = confirm(confirmRequest(payload));

    generator.next();

    const mockResponse = { data: { state: "FAIL" } };
    const putStep = generator.next(mockResponse).value;

    expect(putStep).toEqual(put(confirmSuccess(mockResponse.data)));
    expect(window.sessionStorage.getItem("resetToken")).toBeNull();
  });

  it("confirm failure", () => {
    const payload = { empNo: "1", empEmail: "a@a.com", empMobile: "010" };
    const generator = confirm(confirmRequest(payload));
    generator.next();

    const error = { response: { data: { error: "본인확인 실패" } } };
    const putStep = generator.throw(error).value;

    expect(putStep).toEqual(put(confirmFailure("본인확인 실패")));
  });

  // --- 비밀번호 재설정 (비로그인, resetToken 기반) ---
  it("updatePass success - sessionStorage의 resetToken 실어 보내고 이후 제거", () => {
    window.sessionStorage.setItem("resetToken", "stored-reset-token");
    const payload = { newPass: "newPassword123" };
    const generator = updatePass(updatePassRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const putStep = generator.next({}).value;

    expect(putStep).toEqual(put(updatePassSuccess()));
    expect(window.sessionStorage.getItem("resetToken")).toBeNull();
    expect(generator.next().done).toBe(true);
  });

  it("updatePass failure - resetToken은 그대로 유지", () => {
    window.sessionStorage.setItem("resetToken", "stored-reset-token");
    const generator = updatePass(updatePassRequest({ newPass: "x" }));
    generator.next();

    const error = {
      response: { data: { error: "유효하지 않거나 만료된 요청입니다." } },
    };
    const putStep = generator.throw(error).value;

    expect(putStep).toEqual(
      put(updatePassFailure("유효하지 않거나 만료된 요청입니다.")),
    );
    expect(window.sessionStorage.getItem("resetToken")).toBe(
      "stored-reset-token",
    );
  });

  // --- 비밀번호 변경 (로그인 상태) ---
  it("changePassword success", () => {
    const payload = { newPass: "newPassword123" };
    const generator = changePassword(changePasswordRequest(payload));

    const callStep = generator.next().value;
    expect(callStep.type).toBe("CALL");

    const putStep = generator.next({}).value;

    expect(putStep).toEqual(put(changePasswordSuccess()));
    expect(generator.next().done).toBe(true);
  });

  it("changePassword failure", () => {
    const generator = changePassword(changePasswordRequest({ newPass: "x" }));
    generator.next();

    const error = { response: { data: { error: "비밀번호 변경 실패" } } };
    const putStep = generator.throw(error).value;

    expect(putStep).toEqual(put(changePasswordFailure("비밀번호 변경 실패")));
  });
});

// npm test authSaga.test.js
