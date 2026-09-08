// pages/careers/login.js
// 지원자 전용 로그인 화면. 이메일/비밀번호 폼이 없고 소셜 로그인 버튼만 있다.
// 사내 직원 로그인(/auth/login)과는 완전히 다른 인증경로(OAuth2)를 쓰므로
// 별도 axios/쿠키/리듀서(apctAuth)를 통째로 분리해 관리한다.
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ApplicantAuthLayout from "../../components/ApplicantAuthLayout";

const NEXT_KEY = "sberp.careers.postLoginNext";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const PROVIDER_KEYS = [
  { key: "kakao", className: "kakao" },
  { key: "naver", className: "naver" },
  { key: "google", className: "google" },
];

export default function ApplicantLoginPage() {
  const router = useRouter();
  const { t } = useTranslation("careers");
  const { apctAccessToken, initialized } = useSelector(
    (state) => state.apctAuth,
  );

  // 이미 로그인된 상태로 로그인 화면에 들어오면 바로 튕겨준다.
  useEffect(() => {
    if (initialized && apctAccessToken) {
      const next =
        typeof router.query.next === "string" ? router.query.next : "/careers";
      router.replace(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, apctAccessToken]);

  const handleSocialLogin = (provider) => {
    if (typeof window !== "undefined") {
      const next =
        typeof router.query.next === "string" ? router.query.next : "/careers";
      window.sessionStorage.setItem(NEXT_KEY, next);
      window.location.href = `${API_BASE_URL}/oauth2/authorization/${provider}`;
    }
  };

  return (
    <ApplicantAuthLayout>
      <div className="asec on">
        <h1 className="a-h">{t("login.heading")}</h1>
        <p className="a-sub" dangerouslySetInnerHTML={{ __html: t("login.subtitle") }} />

        <div style={{ marginTop: 28 }}>
          {PROVIDER_KEYS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`csoc-btn ${p.className}`}
              onClick={() => handleSocialLogin(p.key)}
            >
              {t(`login.providers.${p.key}`)}
            </button>
          ))}
        </div>

        <p style={{ marginTop: 20, fontSize: 12, color: "#99a", lineHeight: 1.6 }}>
          <span dangerouslySetInnerHTML={{ __html: t("login.noteLine") }} />
          <a href="/auth/login" style={{ color: "#047857" }}>
            {t("login.adminLoginLink")}
          </a>
        </p>
      </div>
    </ApplicantAuthLayout>
  );
}
