// pages/auth/forgotResetPass.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Alert } from "antd";
import {
  SafetyOutlined,
  CheckOutlined,
  CheckCircleFilled,
  LoginOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  updatePassRequest,
  resetUserState,
} from "../../reducers/auth/authReducer";
import LanguageSwitcher from "../../components/LanguageSwitcher";

// 비밀번호 정책: 8자 이상 + 영문/숫자/특수문자 조합 모두 필수 (백엔드 PasswordPolicy와 동일 기준)
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;
// 라벨은 t() 없이 모듈 스코프에 존재하는 배열이므로 key만 보관하고,
// 실제 텍스트는 컴포넌트 내부에서 t(`resetPass.requirements.${key}`)로 렌더링 시점에 resolve한다.
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

export default function ForgotResetPassPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("auth");
  // 이메일로 발송된 재설정 링크의 쿼리스트링(?token=...)에서 resetToken을 읽는다.
  const { token } = router.query;

  const { loading, error, success } = useSelector((state) => state.auth);

  const [form] = Form.useForm();
  const [pw, setPw] = useState("");
  const [done, setDone] = useState(false);
  const prevLoading = useRef(false);

  // confirm 단계에서 남은 success 플래그가 그대로 남아있으면 이 페이지 진입 즉시
  // "완료" 상태로 오인될 수 있으므로 진입 시 한 번 초기화합니다.
  useEffect(() => {
    dispatch(resetUserState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevLoading.current && !loading && !error && success) {
      setDone(true);
      setTimeout(() => router.replace("/auth/login"), 2500);
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
    if (!token) {
      setLocalError(t("resetPass.invalidTokenError"));
      return;
    }
    if (
      values.newPass.length < 8 ||
      !/[a-zA-Z]/.test(values.newPass) ||
      !/[0-9]/.test(values.newPass) ||
      !SPECIAL_CHAR_REGEX.test(values.newPass)
    ) {
      setLocalError(t("resetPass.policyError"));
      return;
    }
    if (values.newPass !== values.newPassConfirm) {
      setLocalError(t("resetPass.mismatchError"));
      return;
    }
    dispatch(
      updatePassRequest({
        resetToken: token,
        newPass: values.newPass,
        newPassConfirm: values.newPassConfirm,
      }),
    );
  };

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
          {!done ? (
            <div id="stepForm">
              <div className="rp-icon-ring">
                <SafetyOutlined />
              </div>
              <h1 className="rp-h">{t("resetPass.title")}</h1>
              <p className="rp-sub">{t("resetPass.subtitle")}</p>

              {token ? (
                <div className="rp-user">
                  <div className="rp-user-av">
                    <SafetyOutlined />
                  </div>
                  <div>
                    <div className="rp-user-name">
                      {t("resetPass.tokenUser.title")}
                    </div>
                    <div className="rp-user-sub">
                      {t("resetPass.tokenUser.subtitle")}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <span className="sb-badge sb-badge--blue">
                      {t("resetPass.verified")}
                    </span>
                  </div>
                </div>
              ) : (
                router.isReady && (
                  <Alert
                    className="a-alert on"
                    type="warning"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    message={t("resetPass.invalidAccessAlert")}
                    style={{ marginBottom: 16 }}
                  />
                )
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Form.Item
                  label={<span className="fl">{t("resetPass.newPasswordLabel")}</span>}
                  name="newPass"
                  rules={[
                    { required: true, message: t("resetPass.newPasswordRequired") },
                  ]}
                >
                  <Input.Password
                    className="fi"
                    size="large"
                    placeholder={t("resetPass.newPasswordPlaceholder")}
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
                  label={<span className="fl">{t("resetPass.confirmLabel")}</span>}
                  name="newPassConfirm"
                  rules={[
                    {
                      required: true,
                      message: t("resetPass.confirmRequired"),
                    },
                  ]}
                >
                  <Input.Password
                    className="fi"
                    size="large"
                    placeholder={t("resetPass.confirmPlaceholder")}
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
                        : t("resetPass.genericError"))
                    }
                  />
                )}

                <Button
                  className="a-btn"
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={router.isReady && !token}
                  icon={<CheckOutlined />}
                  block
                >
                  {t("resetPass.submit")}
                </Button>
              </Form>
            </div>
          ) : (
            <div id="stepSuccess" style={{ textAlign: "center" }}>
              <div className="rp-check-ring">
                <CheckOutlined />
              </div>
              <div className="rp-success-h">{t("resetPass.successTitle")}</div>
              <div className="rp-success-sub">
                {t("resetPass.successSub1")}
                <br />
                {t("resetPass.successSub2")}
              </div>
              <Button
                className="a-btn"
                type="primary"
                icon={<LoginOutlined />}
                block
                onClick={() => router.replace("/auth/login")}
              >
                {t("resetPass.goToLogin")}
              </Button>
              <div className="rp-countdown">{t("resetPass.countdown")}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
