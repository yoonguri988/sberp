// api/apctAxios.js
// 지원자(채용 공개 사이트) 전용 axios 인스턴스.
// 사내 직원용 api/axios.js 와 분리한 이유:
//  1) 토큰 저장 쿠키명이 다르다 ("apctAccessToken" vs "accessToken") — 같은 브라우저에서
//     관리자가 미리보기 삼아 커리어 사이트에 소셜로그인해도 사원 세션과 절대 섞이지 않는다.
//  2) 지원자 토큰은 refreshToken/재발급 엔드포인트가 없다(백엔드 ApplicantOAuth2SuccessHandler가
//     accessToken만 발급). 그래서 401을 만나면 재발급을 시도하지 않고 즉시 세션을 정리하고
//     "/careers/login" 으로 보낸다(사원용 "/auth/login" 아님).
import axios from "axios";
import Cookies from "js-cookie";
import { message } from "antd";

export const APCT_TOKEN_COOKIE = "apctAccessToken";

const apctApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apctApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = Cookies.get(APCT_TOKEN_COOKIE);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apctApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;

    if (status === 401 && typeof window !== "undefined") {
      Cookies.remove(APCT_TOKEN_COOKIE);
      // 이미 로그인 화면이면 중복 리다이렉트를 하지 않는다.
      if (!window.location.pathname.startsWith("/careers/login")) {
        message.warning("로그인이 만료되었습니다. 다시 로그인해 주세요.");
        const next = encodeURIComponent(
          window.location.pathname + window.location.search,
        );
        window.location.href = `/careers/login?next=${next}`;
      }
    } else if (status === 400 && error.config?.notifyOnError) {
      const serverMessage =
        error.response?.data?.error || error.response?.data?.message;
      message.error(serverMessage || "요청이 올바르지 않습니다.");
    }

    return Promise.reject(error);
  },
);

export default apctApi;
