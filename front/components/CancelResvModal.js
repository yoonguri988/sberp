// components/CancelResvModal.js
import React from "react";
import { Modal, Button } from "antd";
import { ExclamationCircleFilled, WarningFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function CancelResvModal({
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
            color: "var(--sb-red)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ExclamationCircleFilled /> {t("cancelModal.title")}
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
          danger
          loading={loading}
          onClick={onConfirm}
        >
          {t("cancelModal.confirmButton")}
        </Button>,
      ]}
    >
      <div className="sb-confirm-box" style={{ margin: 0 }}>
        <div className="sb-confirm-box__icon">
          <WarningFilled />
        </div>
        <div className="sb-confirm-box__text">
          <p className="sb-confirm-box__title">{t("cancelModal.confirmTitle")}</p>
          <p className="sb-confirm-box__desc">
            {t("cancelModal.confirmDesc")}
          </p>
          {target.resName && (
            <p className="sb-confirm-box__desc" style={{ marginTop: 4 }}>
              {t("cancelModal.targetResource")} <b>{target.resName}</b>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
