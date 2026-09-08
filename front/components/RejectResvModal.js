// components/RejectResvModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button, Input } from "antd";
import {
  CloseCircleFilled,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function RejectResvModal({
  target,
  open,
  loading,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation(["resv", "common"]);
  const [rejectReason, setRejectReason] = useState("");
  const [showErr, setShowErr] = useState(false);

  useEffect(() => {
    if (open) {
      setRejectReason("");
      setShowErr(false);
    }
  }, [open, target]);

  if (!target) return null;

  const handleChange = (e) => {
    setRejectReason(e.target.value);
    if (e.target.value.trim()) setShowErr(false);
  };

  const handleConfirm = () => {
    if (!rejectReason.trim()) {
      setShowErr(true);
      return;
    }
    onConfirm(rejectReason.trim());
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
          <CloseCircleFilled /> {t("rejectModal.title")}
        </span>
      }
      open={open}
      onCancel={onClose}
      width={420}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={loading}>
          {t("common:button.close")}
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          loading={loading}
          onClick={handleConfirm}
        >
          <CloseCircleFilled /> {t("rejectModal.confirmButton")}
        </Button>,
      ]}
    >
      {target.resName && (
        <div className="mb-2" style={{ fontSize: 13 }}>
          {t("rejectModal.targetResource")} <b>{target.resName}</b>
        </div>
      )}
      <label className="sb-form-label">{t("rejectModal.reasonLabel")}</label>
      <Input.TextArea
        rows={3}
        value={rejectReason}
        onChange={handleChange}
        status={showErr ? "error" : undefined}
      />
      {showErr && (
        <span className="sb-field-msg text-danger" style={{ display: "flex" }}>
          <ExclamationCircleOutlined /> {t("rejectModal.reasonRequired")}
        </span>
      )}
    </Modal>
  );
}
