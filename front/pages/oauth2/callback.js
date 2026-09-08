// pages/oauth2/callback.js
// 지원자 소셜 로그인(카카오/네이버/구글) 완료 후 백엔드가 리다이렉트하는 착지 페이지.
// 반드시 이 경로("/oauth2/callback")를 유지해야 한다 — 백엔드 application-oauth.yml의
// app.oauth2.redirect-url(=http://localhost:3000/oauth2/callback)과 그대로 맞물려 있다.
//
// 쿼리스트링으로 ?token={accessToken} 이 붙어서 들어온다(ApplicantOAuth2SuccessHandler 참고).
// 토큰을 저장한 뒤, 로그인 시작 시 남겨둔 "next"(sessionStorage) 또는 기본값(/careers)으로 이동한다.
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin, Alert, Button } from "antd";
import {
  applyApctTokenRequest,
  resetApctAuthState,
} from "../../reducers/apct/apctAuthReducer";

const NEXT_KEY = "sberp.careers.postLoginNext";

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("careers");
  const { apctAccessToken, error, loading } = useSelector(
    (state) => state.apctAuth,
  );
  const dispatched = useRef(false);

  useEffect(() => {
    if (!router.isReady || dispatched.current) return;
    const token = router.query.token;
    if (!token) return;
    dispatched.current = true;
    dispatch(applyApctTokenRequest({ token }));
  }, [router.isReady, router.query.token, dispatch]);

  useEffect(() => {
    if (!apctAccessToken) return;
    let next = "/careers";
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem(NEXT_KEY);
      if (saved) {
        next = saved;
        window.sessionStorage.removeItem(NEXT_KEY);
      }
    }
    router.replace(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apctAccessToken]);

  const retry = () => {
    dispatch(resetApctAuthState());
    router.replace("/careers/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        background: "#f7f9f8",
      }}
    >
      {!error && (
        <>
          <Spin size="large" />
          <p style={{ color: "#667", fontSize: 14 }}>
            {t("oauth2.processing")}
          </p>
        </>
      )}
      {error && (
        <div style={{ width: 360 }}>
          <Alert
            type="error"
            showIcon
            message={t("oauth2.loginFailedTitle")}
            description={
              typeof error === "string" ? error : t("oauth2.retryDefaultDescription")
            }
            style={{ marginBottom: 16 }}
          />
          <Button type="primary" block onClick={retry}>
            {t("oauth2.backToLoginBtn")}
          </Button>
        </div>
      )}
      {loading && !error ? null : null}
    </div>
  );
}
