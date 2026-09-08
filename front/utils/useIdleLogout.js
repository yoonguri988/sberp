// utils/useIdleLogout.js
// 비밀번호 정책 & 세션 만료 요구사항 2번째 항목:
// "30분 미사용 시 로그아웃" - 사용자의 마우스/키보드/터치 활동이 IDLE_LIMIT_MS 동안
// 전혀 없으면 클라이언트에서 강제로 로그아웃시킨다.
//
// 절대 세션 만료(로그인 후 1시간)는 백엔드 refreshToken TTL(jwt.refresh-token-exp-seconds)로
// 별도 처리되며, 이 훅은 활동 여부에 따른 "미사용" 만료만 담당한다.
// 두 정책 중 먼저 도달하는 조건이 적용되는 셈이다.

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { logoutRequest } from "../reducers/auth/authReducer";

export const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30분
const WARNING_BEFORE_MS = 60 * 1000; // 만료 1분 전 경고
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
];

export default function useIdleLogout(active) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("common");
  const idleTimerRef = useRef(null);
  const warnTimerRef = useRef(null);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!active || typeof window === "undefined") return undefined;

    const clearTimers = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    };

    const doLogout = () => {
      clearTimers();
      dispatch(logoutRequest());
      message.warning(t("session.idleLogoutMsg"));
      router.replace("/auth/login?reason=idle_timeout");
    };

    const resetTimers = () => {
      clearTimers();
      warnedRef.current = false;

      warnTimerRef.current = setTimeout(() => {
        warnedRef.current = true;
        message.warning(t("session.idleWarningMsg"));
      }, IDLE_LIMIT_MS - WARNING_BEFORE_MS);

      idleTimerRef.current = setTimeout(doLogout, IDLE_LIMIT_MS);
    };

    // 너무 잦은 리셋을 피하기 위해 짧게 스로틀링
    let lastReset = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastReset < 5000) return; // 5초 이내 재발생 무시
      lastReset = now;
      resetTimers();
    };

    resetTimers();
    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true }),
    );

    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onActivity),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
