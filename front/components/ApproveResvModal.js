// components/ApproveResvModal.js
import React from "react";
import { Modal, Button } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function ApproveResvModal({
  target,
  open,
  loading,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation(["resv", "common"]);

  if (!target) return null;

  return (
    <Modal
      title={
        <span
          style={{
            color: "var(--sb-accent)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CheckCircleFilled /> {t("approveModal.title")}
        </span>
      }
      open={open}
      onCancel={onClose}
      width={380}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          {t("common:button.close")}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={loading}
          onClick={onConfirm}
        >
          <CheckCircleFilled /> {t("approveModal.confirmButton")}
        </Button>,
      ]}
    >
      <div
        className="sb-confirm-box sb-confirm-box--accent"
        style={{ margin: 0 }}
      >
        <div className="sb-confirm-box__icon">
          <CheckCircleFilled />
        </div>
        <div className="sb-confirm-box__text">
          <p className="sb-confirm-box__title">
            {t("approveModal.confirmTitle")}
          </p>
          <p className="sb-confirm-box__desc">
            {t("approveModal.confirmDesc")}
          </p>
          {target.resName && (
            <p className="sb-confirm-box__desc" style={{ marginTop: 4 }}>
              {t("approveModal.targetResource")} <b>{target.resName}</b>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
