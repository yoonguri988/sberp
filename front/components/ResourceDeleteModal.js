// components/ResourceDeleteModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button, Input } from "antd";
import {
  ExclamationCircleFilled,
  InboxOutlined,
  LockOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function ResourceDeleteModal({
  target,
  open,
  loading,
  errorMessage,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation(["res", "common"]);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) setPassword("");
  }, [open, target]);

  if (!target) return null;
  const { resName, resvCount = 0 } = target;
  const blocked = resvCount > 0;

  const handleConfirm = () => {
    if (blocked) return;
    onConfirm(password);
  };

  return (
    <Modal
      title={
        <span
          style={{
            color: "var(--sb-red)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {blocked ? <StopOutlined /> : <ExclamationCircleFilled />}
          {blocked ? t("deleteModal.blockedTitle") : t("deleteModal.title")}
        </span>
      }
      open={open}
      onCancel={onClose}
      width={380}
      footer={
        blocked ? (
          <Button onClick={onClose}>{t("common:button.close")}</Button>
        ) : (
          [
            <Button key="cancel" onClick={onClose} disabled={loading}>
              {t("common:button.cancel")}
            </Button>,
            <Button
              key="confirm"
              type="primary"
              loading={loading}
              danger
              onClick={handleConfirm}
              disabled={!password}
            >
              {t("deleteModal.confirmButton")}
            </Button>,
          ]
        )
      }
    >
      <div
        className="del-modal-icon"
        style={
          blocked
            ? { background: "var(--sb-red-soft)", color: "var(--sb-red)" }
            : { color: "var(--sb-red)" }
        }
      >
        {blocked ? <StopOutlined /> : <InboxOutlined />}
      </div>
      <div className="del-dept-name">{resName}</div>

      {blocked ? (
        <>
          <div className="del-warning">
            {t("deleteModal.blockedWarningPrefix")} <b>{resvCount}</b>
            {t("deleteModal.blockedWarningSuffix")}
          </div>
          <div className="del-warn-box">
            <ExclamationCircleFilled />
            <span>{t("deleteModal.blockedHint")}</span>
          </div>
        </>
      ) : (
        <>
          <div className="del-warning">
            {t("deleteModal.passwordPromptPrefix")}{" "}
            <b>{t("deleteModal.passwordInline")}</b>
            {t("deleteModal.passwordPromptSuffix")}
          </div>
          <div className="mb-2">
            <label className="sb-form-label">
              {t("deleteModal.passwordLabel")}{" "}
              <span style={{ color: "var(--sb-red)" }}>*</span>
            </label>
            <Input.Password
              className="fi"
              prefix={<LockOutlined />}
              placeholder={t("deleteModal.passwordPlaceholder")}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleConfirm}
              status={errorMessage ? "error" : undefined}
            />
            {errorMessage && (
              <div
                style={{ color: "var(--sb-red)", fontSize: 12.5, marginTop: 6 }}
              >
                <ExclamationCircleFilled className="me-1" /> {errorMessage}
              </div>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
