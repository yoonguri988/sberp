// auth/authReducer.test.js
import authReducer, {
    resetUserState,
    loginRequest, loginSuccess, loginFailure,
    refreshTokenRequest, refreshTokenSuccess, refreshTokenFailure,
    logoutRequest, logoutSuccess, logoutFailure,
    loadUserRequest, loadUserSuccess, loadUserFailure,
    confirmRequest, confirmSuccess, confirmFailure,
    updatePassRequest, updatePassSuccess, updatePassFailure,
    changePasswordRequest, changePasswordSuccess, changePasswordFailure,
} from "../auth/authReducer";

describe("authReducer", () => {

    const initialState = {
        user: null,
        accessToken: null,
        loading: false,
        error: null,
        success: false,
    };

    test("초기 상태 반환", () => {
        expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
    });

    // ---------------- resetUserState ----------------
    describe("resetUserState", () => {
        test("loading/error/success 초기화, user/accessToken은 유지", () => {
            const prevState = {
                user: { empId: 1 },
                accessToken: "token123",
                loading: true,
                error: "에러",
                success: true,
            };
            const state = authReducer(prevState, resetUserState());
            expect(state.loading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.success).toBe(false);
            // user, accessToken은 건드리지 않음
            expect(state.user).toEqual({ empId: 1 });
            expect(state.accessToken).toBe("token123");
        });
    });

    // ---------------- 로그인 ----------------
    describe("login", () => {
        test("loginRequest: loading true, error null", () => {
            const state = authReducer(initialState, loginRequest({ empEmail: "a@a.com", empPass: "1234" }));
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        test("loginSuccess: user/accessToken 세팅, loading false", () => {
            const payload = {
                user: { empId: 1, comId: 10 },
                accessToken: "access-token-abc",
            };
            const state = authReducer(
                { ...initialState, loading: true },
                loginSuccess(payload)
            );
            expect(state.loading).toBe(false);
            expect(state.user).toEqual(payload.user);
            expect(state.accessToken).toBe("access-token-abc");
        });

        test("loginSuccess: payload 누락 시 null로 폴백", () => {
            const state = authReducer(initialState, loginSuccess({}));
            expect(state.user).toBeNull();
            expect(state.accessToken).toBeNull();
        });

        test("loginFailure: error 세팅, user null, loading false", () => {
            const state = authReducer(
                { ...initialState, loading: true, user: { empId: 1 } },
                loginFailure("이메일 또는 비밀번호가 올바르지 않습니다.")
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe("이메일 또는 비밀번호가 올바르지 않습니다.");
            expect(state.user).toBeNull();
        });
    });

    // ---------------- 토큰 재발급 ----------------
    describe("refreshToken", () => {
        test("refreshTokenRequest: loading true", () => {
            const state = authReducer(initialState, refreshTokenRequest());
            expect(state.loading).toBe(true);
        });

        test("refreshTokenSuccess: accessToken 갱신", () => {
            const state = authReducer(
                { ...initialState, loading: true, accessToken: "old-token" },
                refreshTokenSuccess({ accessToken: "new-token" })
            );
            expect(state.loading).toBe(false);
            expect(state.accessToken).toBe("new-token");
        });

        test("refreshTokenSuccess: payload 없으면 accessToken null", () => {
            const state = authReducer(initialState, refreshTokenSuccess(undefined));
            expect(state.accessToken).toBeNull();
        });

        test("refreshTokenFailure: error 세팅", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                refreshTokenFailure({ error: "Invalid refresh token" })
            );
            expect(state.loading).toBe(false);
            expect(state.error).toEqual("Invalid refresh token");
        });
    });

    // ---------------- 로그아웃 ----------------
    describe("logout", () => {
        test("logoutRequest: loading true", () => {
            const state = authReducer(initialState, logoutRequest());
            expect(state.loading).toBe(true);
        });

        test("logoutSuccess: user/accessToken/error/success 모두 초기화", () => {
            const prevState = {
                user: { empId: 1 },
                accessToken: "token123",
                loading: true,
                error: "이전 에러",
                success: true,
            };
            const state = authReducer(prevState, logoutSuccess());
            expect(state).toEqual(initialState);
        });

        test("logoutFailure: error 세팅, loading false", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                logoutFailure("로그아웃 실패")
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe("로그아웃 실패");
        });
    });

    // ---------------- 사용자 정보 로드 ----------------
    describe("loadUser", () => {
        test("loadUserRequest: loading true", () => {
            const state = authReducer(initialState, loadUserRequest());
            expect(state.loading).toBe(true);
        });

        test("loadUserSuccess: user 세팅", () => {
            const user = { empId: 1, empName: "홍길동" };
            const state = authReducer(
                { ...initialState, loading: true },
                loadUserSuccess(user)
            );
            expect(state.loading).toBe(false);
            expect(state.user).toEqual(user);
        });

        test("loadUserFailure: user null, error 세팅", () => {
            const state = authReducer(
                { ...initialState, loading: true, user: { empId: 1 } },
                loadUserFailure("사용자 조회 실패")
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe("사용자 조회 실패");
            expect(state.user).toBeNull();
        });
    });

    // ---------------- 비밀번호 재설정 - 본인확인 ----------------
    describe("confirm", () => {
        test("confirmRequest: loading true, success false", () => {
            const state = authReducer(
                { ...initialState, success: true },
                confirmRequest()
            );
            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
            expect(state.success).toBe(false);
        });

        test("confirmSuccess: state가 'OK'면 success true", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                confirmSuccess({ state: "OK", resetToken: "reset-token" })
            );
            expect(state.loading).toBe(false);
            expect(state.success).toBe(true);
        });

        test("confirmSuccess: state가 'FAIL'이면 success false", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                confirmSuccess({ state: "FAIL" })
            );
            expect(state.success).toBe(false);
        });

        test("confirmFailure: error 세팅", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                confirmFailure("본인확인 실패")
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe("본인확인 실패");
        });
    });

    // ---------------- 비밀번호 재설정 (비로그인) ----------------
    describe("updatePass", () => {
        test("updatePassRequest: loading true, success false", () => {
            const state = authReducer(
                { ...initialState, success: true },
                updatePassRequest()
            );
            expect(state.loading).toBe(true);
            expect(state.success).toBe(false);
        });

        test("updatePassSuccess: success true", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                updatePassSuccess()
            );
            expect(state.loading).toBe(false);
            expect(state.success).toBe(true);
        });

        test("updatePassFailure: error 세팅, loading false", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                updatePassFailure("유효하지 않거나 만료된 요청입니다.")
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe("유효하지 않거나 만료된 요청입니다.");
        });
    });

    // ---------------- 비밀번호 변경 (로그인 상태) ----------------
    describe("changePassword", () => {
        test("changePasswordRequest: loading true, success false", () => {
            const state = authReducer(
                { ...initialState, success: true },
                changePasswordRequest()
            );
            expect(state.loading).toBe(true);
            expect(state.success).toBe(false);
        });

        test("changePasswordSuccess: success true", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                changePasswordSuccess()
            );
            expect(state.loading).toBe(false);
            expect(state.success).toBe(true);
        });

        test("changePasswordFailure: error 세팅", () => {
            const state = authReducer(
                { ...initialState, loading: true },
                changePasswordFailure("비밀번호 변경 실패")
            );
            expect(state.loading).toBe(false);
            expect(state.error).toBe("비밀번호 변경 실패");
        });
    });
});