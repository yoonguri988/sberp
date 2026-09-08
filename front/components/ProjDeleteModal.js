// components/ConfirmDeleteModal.js

import { Modal } from "antd";
import { useTranslation } from "react-i18next";

export default function ProjDeleteModal({
  itemName,
  open,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const { t } = useTranslation("proj");

  return (
    <Modal
      title={t("deleteModal.title")}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={t("deleteModal.okText")}
      cancelText={t("deleteModal.cancelText")}
      okButtonProps={{ danger: true, loading }}
    >
      <p style={{ textAlign: "center" }}>
        {t("deleteModal.bodyLine1", { itemName })}
        <br />
        {t("deleteModal.bodyLine2")}
        <br />
        {t("deleteModal.bodyLine3")}
      </p>
    </Modal>
  );
}
