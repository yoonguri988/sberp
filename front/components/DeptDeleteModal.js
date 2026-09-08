// components/DeptDeleteModal.js
import React from "react";
import { Modal, Button } from "antd";
import {
  StopOutlined,
  TeamOutlined,
  ApartmentOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function DeptDeleteModal({
  target,
  open,
  loading,
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation(["dept", "common"]);

  if (!target) return null;
  const { deptName, deptCode, empCount = 0, childCount = 0 } = target;
  const hasChild = childCount > 0;

  let mode = "delete"; // delete | transfer | blocked
  if (hasChild) mode = "blocked";
  else if (empCount > 0) mode = "transfer";

  const HEADER = {
    blocked: {
      color: "var(--sb-red)",
      icon: <StopOutlined />,
      text: t("deleteModal.header.blocked"),
    },
    transfer: {
      color: "var(--sb-amber)",
      icon: <TeamOutlined />,
      text: t("deleteModal.header.transfer"),
    },
    delete: {
      color: "var(--sb-red)",
      icon: <WarningFilled />,
      text: t("deleteModal.header.delete"),
    },
  }[mode];

  const ICON_BOX = {
    blocked: {
      bg: "var(--sb-red-soft)",
      color: "var(--sb-red)",
      icon: <StopOutlined />,
    },
    transfer: {
      bg: "var(--sb-amber-soft)",
      color: "var(--sb-amber)",
      icon: <TeamOutlined />,
    },
    delete: {
      bg: "var(--sb-red-soft)",
      color: "var(--sb-red)",
      icon: <ApartmentOutlined />,
    },
  }[mode];

  return (
    <Modal
      title={
        <span
          style={{
            color: HEADER.color,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {HEADER.icon} {HEADER.text}
        </span>
      }
      open={open}
      onCancel={onClose}
      width={380}
      footer={
        mode === "blocked" ? (
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
              icon={
                mode === "transfer" ? (
                  <ArrowRightOutlined />
                ) : (
                  <DeleteOutlined />
                )
              }
              style={
                mode === "transfer"
                  ? {
                      background: "var(--sb-amber)",
                      borderColor: "var(--sb-amber)",
                    }
                  : {
                      background: "var(--sb-red)",
                      borderColor: "var(--sb-red)",
                    }
              }
              onClick={onConfirm}
            >
              {mode === "transfer" ? t("deleteModal.transferBtn") : t("deleteModal.deleteBtn")}
            </Button>,
          ]
        )
      }
    >
      <div
        className="del-modal-icon"
        style={{ background: ICON_BOX.bg, color: ICON_BOX.color }}
      >
        {ICON_BOX.icon}
      </div>
      <div className="del-dept-name">
        {deptName}{" "}
        {deptCode && <span className="dept-code-chip ms-1">{deptCode}</span>}
      </div>

      {mode === "blocked" && (
        <>
          <div className="del-warning">
            {t("deleteModal.blocked.warningPrefix")} <b>{childCount}</b>
            {t("deleteModal.blocked.warningSuffix")}
            <br />
            {t("deleteModal.blocked.hint")}
          </div>
          <div className="del-warn-box">
            <WarningFilled />
            <span>{t("deleteModal.blocked.warnBox")}</span>
          </div>
        </>
      )}

      {mode === "transfer" && (
        <>
          <div className="del-warning">
            {t("deleteModal.transfer.warningPrefix")}{" "}
            <b>{t("deleteModal.transfer.warningStatus")}</b>
            {t("deleteModal.transfer.warningSuffix")}
            <br />
            {t("deleteModal.transfer.warningLine2")}
          </div>
          <div className="del-warn-box">
            <TeamOutlined />
            <span>
              {t("deleteModal.transfer.warnBoxPrefix")} <b>{empCount}</b>
              {t("deleteModal.transfer.warnBoxSuffix")}
            </span>
          </div>
        </>
      )}

      {mode === "delete" && (
        <div className="del-warning">
          {t("deleteModal.delete.warningLine1")}
          <br />
          {t("deleteModal.delete.warningLine2")}
        </div>
      )}
    </Modal>
  );
}
