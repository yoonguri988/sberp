// api/axios.js
import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";
import i18n from "../i18n";

const api = axios.create({
  // 기본 api 서버 주소, 환경변수 없으면 로컬 서버 사용
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  // refreshToken 이 HttpOnly 쿠키에 저장이 되어 있으면 자동으로 포함 필요
  withCredentials: true,
  headers: {
    "Content-Type": "application/json", // 요청 기본 json
    Accept: "application/json", // 응답을 json 받도록 지정
  },
});
// 요청 인터셉터: 요청보내기 전에 Access Token 을 헤더에 추가
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = Cookies.get("accessToken"); // localStorage → Cookies로 변경
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // CSR 환경에서만 localStorage 접근
      // const accessToken = localStorage.getItem("accessToken"); // 저장된 Access Token 가져오기
      // if (accessToken) {
      //   config.headers.Authorization = `Bearer ${accessToken}`; //Authorization 헤더에 추가
      // }
    }
    return config;
  },
  (error) => Promise.reject(error), // 요청에러처리
);

// 동시 요청용 refreshToken 상태 관리
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res, // 정상 응답 그대로 반환
  async (error) => {
    const original = error.config; // 원래 요청 정보
    const status = error.response?.status; // 응답 상태 코드

    // 비밀번호가 아직 사번(임시 비밀번호) 상태 → JwtAuthenticationFilter가 /auth/** 외 모든
    // API를 403(PWD_CHANGE_REQUIRED)으로 막는다. 새로고침/직접 URL 이동 등으로
    // AppLayout의 가드를 놓친 화면에서도 여기서 한 번 더 강제 이동시킨다.
    if (
      status === 403 &&
      error.response?.data?.error === "PWD_CHANGE_REQUIRED" &&
      typeof window !== "undefined" &&
      window.location.pathname !== "/auth/changePass"
    ) {
      window.location.href = "/auth/changePass";
      return Promise.reject(error);
    }

    // refresh 요청 자체가 실패한 경우 → 재귀 방지, 즉시 로그아웃 처리
    if (original?.url?.includes("/auth/refresh")) {
      if (typeof window !== "undefined") {
        Cookies.remove("accessToken");
        window.location.href = "/auth/login";
      }
      return Promise.reject(error);
    }

    // 로그인 여부와 무관하게 호출되는 공개 auth 엔드포인트의 401은
    // "세션 만료"가 아니다(로그인 실패, 재설정 토큰 만료 등) — refreshToken
    // 쿠키가 애초에 없는 게 정상 상태이므로 refresh를 시도하면 안 된다.
    // 각 saga의 catch(예: loginFailure/updatePassFailure)로 그대로 흘려보낸다.
    const PUBLIC_AUTH_PATHS = ["/auth/login", "/auth/updatePass"];
    if (PUBLIC_AUTH_PATHS.some((path) => original?.url?.includes(path))) {
      return Promise.reject(error);
    }

    // 401 발생 Refresh Token 재발급
    if (status === 401 && !original._retry) {
      // 이미 refresh 진행 중이면 큐에 대기했다가 새 토큰으로 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        });
      }

      original._retry = true; //무한 루프 방지 플래그
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newAccessToken = data?.accessToken;

        if (typeof window !== "undefined" && newAccessToken) {
          // localStorage.setItem("accessToken", newAccessToken); // local 저장
          Cookies.set("accessToken", newAccessToken);
        }

        processQueue(null, newAccessToken); // 대기 중인 요청 재시도
        original.headers.Authorization = `Bearer ${newAccessToken}`; // 원 요청 헤어 갱신
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== "undefined") {
          // localStorage.removeItem("accessToken"); // Access Token 제거
          Cookies.remove("accessToken"); // Access Token 제거
          window.location.href = "/auth/login"; // 로그인 페이지로 이동 (실제 로그인 라우트는 /login이 아니라 /auth/login)
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // 400 안전망: 이 프로젝트는 saga(try/catch) → xxxFailure 액션 → 페이지 컴포넌트의
    // message.error(error) 패턴으로 이미 대부분의 API 에러를 처리하고 있습니다.
    // 여기서 무조건 토스트를 띄우면 그 위에 또 message.error가 겹쳐서 이중 토스트가 됩니다.
    // 그래서 기본은 조용히 reject만 하고, saga 없이 컴포넌트에서 바로 api.xxx(...)를
    // 호출하는 등 별도 에러 처리가 없는 호출부에 한해서만 요청 시
    // `notifyOnError: true`를 명시적으로 넘기면 여기서 토스트를 대신 띄워줍니다.
    //   예) api.post("/api/foo", data, { notifyOnError: true })
    if (status === 400 && original?.notifyOnError) {
      const serverMessage =
        error.response?.data?.error || error.response?.data?.message;
      message.error(serverMessage || i18n.t("common:message.invalidRequest"));
    }

    return Promise.reject(error);
  },
);

export default api;
