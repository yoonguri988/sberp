// components/Footer.js
import React from "react";
import { Layout } from "antd";
import { useTranslation } from "react-i18next";

const { Footer: AntFooter } = Layout;

export default function Footer() {
  const { t } = useTranslation("footer");
  
  return (
    <AntFooter className="sb-footer" id="sbFooter">
      <span>{t("copyright")}</span>
      <span className="d-none d-md-inline">{t("version")}</span>
      <a href="#" className="d-none d-md-inline">
        {t("terms")}
      </a>
      <a href="#" className="d-none d-md-inline">
        {t("privacy")}
      </a>
      <span className="ms-auto d-inline-flex align-items-center gap-2">
        <span className="sb-dot" style={{ background: "var(--sb-green)" }} />
        {t("systemNormal")}
      </span>
    </AntFooter>
  );
}
