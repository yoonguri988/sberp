// pages/auth/changePass.js
// 최초 로그인(임시 비밀번호=사번) 강제 비밀번호 변경 화면.
// - login.js: 로그인 성공 시 user.pwdChangeRequired가 true면 여기로 이동.
// - components/AppLayout.js: 로그인 상태에서 다른 화면으로 이동을 시도해도 여기로 되돌린다.
// - api/axios.js: 백엔드(JwtAuthenticationFilter)가 403(PWD_CHANGE_REQUIRED)을 내려도 여기로 이동한다.
// 이 페이지는 NO_LAYOUT_PREFIXES(/auth)에 속해 있어 _app.js가 loadUserRequest를 자동으로
// 호출해주지 않으므로, 새로고침/직접 URL 접근에도 정상 동작하도록 마운트 시 직접 호출한다.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Alert, Spin } from "antd";
import {
  SafetyOutlined,
  CheckOutlined,
  CheckCircleFilled,
  LogoutOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  loadUserRequest,
  changePasswordRequest,
  refreshTokenRequest,
  logoutRequest,
  resetUserState,
} from "../../reducers/auth/authReducer";
import LanguageSwitcher from "../../components/LanguageSwitcher";

// 비밀번호 정책: 8자 이상 + 영문/숫자/특수문자 조합 모두 필수 (백엔드 PasswordPolicy와 동일 기준)
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;
const REQ_LIST = [
  { key: "len", test: (pw) => pw.length >= 8 },
  { key: "alpha", test: (pw) => /[a-zA-Z]/.test(pw) },
  { key: "num", test: (pw) => /[0-9]/.test(pw) },
  { key: "special", test: (pw) => SPECIAL_CHAR_REGEX.test(pw) },
];

const LEVELS = [
  { percent: 0, color: "#e5e7eb", key: null },
  { percent: 33, color: "var(--sb-red)", key: "weak" },
  { percent: 66, color: "var(--sb-amber)", key: "medium" },
  { percent: 100, color: "var(--sb-green)", key: "strong" },
];

export default function ChangePassPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("auth");

  const { initialized, accessToken, user, loading, error, success } =
    useSelector((state) => state.auth);

  const [form] = Form.useForm();
  const [pw, setPw] = useState("");
  const [step, setStep] = useState("form"); // 'form' | 'success'
  const prevLoading = useRef(false);

  // 이 페이지는 /auth/** 라서 _app.js가 세션 복원(loadUserRequest)을 자동으로 해주지 않는다.
  // 새로고침/직접 접근에도 accessToken/user를 알 수 있도록 마운트 시 직접 복원한다.
  useEffect(() => {
    dispatch(resetUserState());
    dispatch(loadUserRequest());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 세션 복원이 끝난 뒤 판단: 비로그인 → 로그인 화면 / 변경 불필요 → 메인 화면
  useEffect(() => {
    if (!initialized || step === "success") return;
    if (!accessToken) {
      router.replace("/auth/login");
    } else if (!user?.pwdChangeRequired) {
      router.replace("/");
    }
  }, [initialized, accessToken, user, step, router]);

  useEffect(() => {
    if (prevLoading.current && !loading && !error && success && step === "form") {
      setStep("success");
      // 새 accessToken(=pwdChangeRequired:false 클레임)을 받아온 뒤 메인으로 이동.
      dispatch(refreshTokenRequest());
      setTimeout(() => router.replace("/"), 1500);
    }
    prevLoading.current = loading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const level = useMemo(() => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-zA-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[!@#$%^&*_-]/.test(pw)) s++;
    return Math.min(s <= 1 ? 1 : s <= 2 ? 2 : 3, 3);
  }, [pw]);

  const [localError, setLocalError] = useState("");

  const onFinish = (values) => {
    setLocalError("");
    if (
      values.newPass.length < 8 ||
      !/[a-zA-Z]/.test(values.newPass) ||
      !/[0-9]/.test(values.newPass) ||
      !SPECIAL_CHAR_REGEX.test(values.newPass)
    ) {
      setLocalError(t("changePass.policyError"));
      return;
    }
    if (values.newPass !== values.newPassConfirm) {
      setLocalError(t("changePass.mismatchError"));
      return;
    }
    dispatch(changePasswordRequest({ newPass: values.newPass }));
  };

  const handleLogout = () => {
    dispatch(logoutRequest());
    router.replace("/auth/login");
  };

  // 세션 복원 중 + 이 화면에 계속 머물러야 하는 상태(변경 필요)가 아닐 가능성이 있는 동안은
  // 폼을 보여주지 않는다(다른 화면으로 튕겨나가기 직전 잠깐 폼이 보이는 것 방지).
  const showForm =
    step === "success" || (initialized && accessToken && user?.pwdChangeRequired);

  if (!showForm) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
        background:
          "linear-gradient(150deg, #eff4ff 0%, #f5f6f8 60%, #f0fdf4 100%)",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 16, right: 20, zIndex: 10 }}>
        <LanguageSwitcher />
      </div>
      <div className="rp-wrap">
        <div className="rp-brand">
          <div className="rp-mark">S</div>
          <span className="rp-name">SBerp</span>
        </div>

        <div className="rp-card">
          {step === "form" ? (
            <div id="stepForm">
              <div className="rp-icon-ring">
                <SafetyOutlined />
              </div>
              <h1 className="rp-h">{t("changePass.title")}</h1>
              <p className="rp-sub">
                {t("changePass.subtitle1")}
                <br />
                {t("changePass.subtitle2")}
              </p>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Form.Item
                  label={<span className="fl">{t("changePass.newPasswordLabel")}</span>}
                  name="newPass"
                  rules={[
                    { required: true, message: t("changePass.newPasswordRequired") },
                  ]}
                >
                  <Input.Password
                    className="fi"
                    size="large"
                    placeholder={t("changePass.newPasswordPlaceholder")}
                    autoComplete="new-password"
                    onChange={(e) => setPw(e.target.value)}
                  />
                </Form.Item>

                <div className="pw-bar-wrap">
                  <div
                    className="pw-bar"
                    style={{
                      width: `${LEVELS[level].percent}%`,
                      background: LEVELS[level].color,
                    }}
                  />
                </div>
                <div className="pw-lbl" style={{ color: LEVELS[level].color }}>
                  {LEVELS[level].key ? t(`resetPass.strength.${LEVELS[level].key}`) : ""}
                </div>

                <div className="pw-reqs">
                  {REQ_LIST.map((r) => {
                    const ok = r.test(pw);
                    return (
                      <span key={r.key} className={`pw-req${ok ? " ok" : ""}`}>
                        {ok ? <CheckCircleFilled /> : null}{" "}
                        {t(`resetPass.requirements.${r.key}`)}
                      </span>
                    );
                  })}
                </div>

                <Form.Item
                  label={<span className="fl">{t("changePass.confirmLabel")}</span>}
                  name="newPassConfirm"
                  rules={[
                    {
                      required: true,
                      message: t("changePass.confirmRequired"),
                    },
                  ]}
                >
                  <Input.Password
                    className="fi"
                    size="large"
                    placeholder={t("changePass.confirmPlaceholder")}
                    autoComplete="new-password"
                  />
                </Form.Item>

                {(localError || error) && (
                  <Alert
                    className="a-alert on"
                    type="error"
                    showIcon
                    message={
                      localError ||
                      (typeof error === "string"
                        ? error
                        : t("changePass.genericError"))
                    }
                  />
                )}

                <Button
                  className="a-btn"
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckOutlined />}
                  block
                >
                  {t("changePass.submit")}
                </Button>
              </Form>

              <button
                type="button"
                className="a-link"
                style={{ display: "block", marginTop: 14, textAlign: "center", width: "100%" }}
                onClick={handleLogout}
              >
                <LogoutOutlined /> {t("changePass.logoutBtn")}
              </button>
            </div>
          ) : (
            <div id="stepSuccess" style={{ textAlign: "center" }}>
              <div className="rp-check-ring">
                <CheckOutlined />
              </div>
              <div className="rp-success-h">{t("changePass.successTitle")}</div>
              <div className="rp-success-sub">{t("changePass.successSub")}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
