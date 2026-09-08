// pages/auth/login.js
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Form, Input, Button, Alert, message } from "antd";
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/AuthLayout";
import {
  loginRequest,
  confirmRequest,
  resetUserState,
} from "../../reducers/auth/authReducer";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("auth");
  const { loading, error, success, accessToken, user } = useSelector(
    (state) => state.auth,
  );

  const [section, setSection] = useState("login"); // 'login' | 'forgot'
  const [forgotForm] = Form.useForm();
  // 본인확인 성공 시 즉시 재설정 페이지로 이동하지 않고, 이메일 발송 완료 안내로 전환
  const [emailSent, setEmailSent] = useState(false);

  const prevLoading = useRef(false);

  // accessToken, refreshToken 이 모두 만료된 상태에서 api 호출 시
  // api/axios.js 인터셉터가 "/auth/login?reason=session_expired" 로 강제 이동시킨 경우 안내
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.reason === "session_expired") {
      message.warning(t("login.sessionExpired"));
      // 새로고침 시 메시지가 다시 뜨지 않도록 쿼리스트링 정리
      const { reason, ...rest } = router.query;
      router.replace({ pathname: "/auth/login", query: rest }, undefined, {
        shallow: true,
      });
    } else if (router.query.reason === "idle_timeout") {
      message.warning(t("login.idleTimeout"));
      const { reason, ...rest } = router.query;
      router.replace({ pathname: "/auth/login", query: rest }, undefined, {
        shallow: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.reason]);

  // 로그인 성공(accessToken 발급) → 메인으로 이동
  // 본인 확인 성공(success) → 등록된 이메일로 재설정 링크 발송, 화면엔 안내만 표시
  useEffect(() => {
    if (prevLoading.current && !loading && !error) {
      if (section === "login" && accessToken) {
        // 임시 비밀번호(사번)로 로그인한 첫 로그인 상태라면 바로 메인으로 보내지 않고
        // 비밀번호 변경 화면으로 강제 이동시킨다(백엔드 JwtAuthenticationFilter도 동일하게 가드).
        if (user?.pwdChangeRequired) {
          router.replace("/auth/changePass");
        } else {
          router.replace("/");
        }
      } else if (section === "forgot" && success) {
        setEmailSent(true);
      }
    }
    prevLoading.current = loading;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const switchSection = (next) => {
    dispatch(resetUserState());
    setEmailSent(false);
    setSection(next);
  };

  const onFinishLogin = (values) => {
    dispatch(
      loginRequest({
        empEmail: values.empEmail,
        empPass: values.empPass,
      }),
    );
  };

  const onFinishForgot = (values) => {
    dispatch(
      confirmRequest({
        empNo: values.empNo,
        empEmail: values.empEmail,
        empMobile: values.empMobile,
      }),
    );
  };

  const handleMobileInput = (e) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 7) v = `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7)}`;
    else if (v.length > 3) v = `${v.slice(0, 3)}-${v.slice(3)}`;
    forgotForm.setFieldsValue({ empMobile: v });
  };

  return (
    <AuthLayout>
      {section === "login" && (
        <div className="asec on" id="secLogin">
          <h1 className="a-h">{t("login.greeting")}</h1>
          <p className="a-sub">
            {t("login.subtitle1")}
            <br />
            {t("login.subtitle2")}
          </p>

          <Form layout="vertical" onFinish={onFinishLogin} requiredMark={false}>
            <Form.Item
              label={<span className="fl">{t("login.emailLabel")}</span>}
              name="empEmail"
              rules={[
                { required: true, message: t("login.emailRequired") },
                {
                  pattern: /^[^\s@]+@[^\s@]+$/,
                  message: t("login.emailInvalid"),
                },
              ]}
            >
              <Input
                className="fi"
                size="large"
                placeholder={t("login.emailPlaceholder")}
                prefix={
                  <MailOutlined style={{ color: "var(--sb-ink-faint)" }} />
                }
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              label={<span className="fl">{t("login.passwordLabel")}</span>}
              name="empPass"
              rules={[{ required: true, message: t("login.passwordRequired") }]}
            >
              <Input.Password
                className="fi"
                size="large"
                placeholder={t("login.passwordPlaceholder")}
                prefix={
                  <LockOutlined style={{ color: "var(--sb-ink-faint)" }} />
                }
                autoComplete="current-password"
              />
            </Form.Item>

            {section === "login" && error && (
              <Alert
                className="a-alert on"
                type="error"
                showIcon
                message={
                  typeof error === "string" ? error : t("login.loginError")
                }
              />
            )}

            <button
              type="button"
              className="a-link"
              style={{ display: "block", marginBottom: 14 }}
              onClick={() => switchSection("forgot")}
            >
              {t("login.forgotPassword")}
            </button>

            <Button
              className="a-btn"
              type="primary"
              htmlType="submit"
              loading={section === "login" && loading}
              icon={<LoginOutlined />}
              block
            >
              {t("login.submit")}
            </Button>
          </Form>

          <div className="a-demo">
            <p>
              <InfoCircleOutlined /> {t("login.demo.title")}
              <br />
              {t("login.demo.sysadmin")} <code>a@a</code> / {t("login.demo.password")} <code>1</code>
              <br />
              {t("login.demo.admin")} <code>b@b</code> / {t("login.demo.password")} <code>1</code>
              <br />
              {t("login.demo.user")} <code>c@c</code> / {t("login.demo.password")} <code>1</code>
            </p>
          </div>
        </div>
      )}

      {section === "forgot" && emailSent && (
        <div
          className="asec on"
          id="secForgotSent"
          style={{ textAlign: "center" }}
        >
          <div className="rp-check-ring">
            <CheckCircleFilled />
          </div>
          <h1 className="a-h">{t("forgot.emailSent.title")}</h1>
          <p className="a-sub">
            {t("forgot.emailSent.body1")}
            <br />
            {t("forgot.emailSent.body2")}
            <br />
            {t("forgot.emailSent.validityPrefix")}
            <b>{t("forgot.emailSent.validityEmphasis")}</b>
            {t("forgot.emailSent.validitySuffix")}
          </p>
          <Button
            className="a-btn"
            type="primary"
            icon={<ArrowLeftOutlined />}
            block
            onClick={() => switchSection("login")}
          >
            {t("forgot.backToLogin")}
          </Button>
        </div>
      )}

      {section === "forgot" && !emailSent && (
        <div className="asec on" id="secForgot">
          <button
            type="button"
            className="a-back"
            onClick={() => switchSection("login")}
          >
            <ArrowLeftOutlined /> {t("forgot.backToLogin")}
          </button>
          <h1 className="a-h">{t("forgot.title")}</h1>
          <p className="a-sub">
            {t("forgot.subtitle1")}
            <br />
            {t("forgot.subtitle2")}
          </p>

          <Form
            layout="vertical"
            form={forgotForm}
            onFinish={onFinishForgot}
            requiredMark={false}
          >
            <Form.Item
              label={<span className="fl">{t("forgot.empNoLabel")}</span>}
              name="empNo"
              rules={[{ required: true, message: t("forgot.empNoRequired") }]}
            >
              <Input
                className="fi"
                size="large"
                placeholder={t("forgot.empNoPlaceholder")}
                prefix={
                  <UserOutlined style={{ color: "var(--sb-ink-faint)" }} />
                }
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>

            <Form.Item
              label={<span className="fl">{t("forgot.emailLabel")}</span>}
              name="empEmail"
              rules={[
                { required: true, message: t("forgot.emailRequired") },
                {
                  pattern: /^[^\s@]+@[^\s@]+$/,
                  message: t("forgot.emailInvalid"),
                },
              ]}
            >
              <Input
                className="fi"
                size="large"
                placeholder={t("forgot.emailPlaceholder")}
                prefix={
                  <MailOutlined style={{ color: "var(--sb-ink-faint)" }} />
                }
              />
            </Form.Item>

            <Form.Item
              label={<span className="fl">{t("forgot.mobileLabel")}</span>}
              name="empMobile"
              rules={[{ required: true, message: t("forgot.mobileRequired") }]}
            >
              <Input
                className="fi"
                size="large"
                placeholder={t("forgot.mobilePlaceholder")}
                prefix={
                  <PhoneOutlined style={{ color: "var(--sb-ink-faint)" }} />
                }
                onChange={handleMobileInput}
                maxLength={13}
              />
            </Form.Item>

            {section === "forgot" && error && (
              <Alert
                className="a-alert on"
                type="error"
                showIcon
                message={
                  typeof error === "string" ? error : t("forgot.notFoundError")
                }
              />
            )}

            <Button
              className="a-btn"
              type="primary"
              htmlType="submit"
              loading={section === "forgot" && loading}
              icon={<SafetyCertificateOutlined />}
              block
            >
              {t("forgot.submit")}
            </Button>
          </Form>
        </div>
      )}
    </AuthLayout>
  );
}
