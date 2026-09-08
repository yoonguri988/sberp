// components/AuthLayout.js
import React from "react";
import {
  CheckSquareFilled,
  TeamOutlined,
  ProjectOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AuthLayout({ children }) {
  const { t } = useTranslation("auth");

  return (
    <div className="aw" style={{ background: "#fff", position: "relative" }}>
      <div style={{ position: "absolute", top: 16, right: 20, zIndex: 10 }}>
        <LanguageSwitcher />
      </div>
      <aside className="ab">
        <div className="ab-logo">
          <div className="ab-mark">S</div>
          <span className="ab-name">SBerp</span>
        </div>
        <div className="ab-mid">
          <div className="ab-tagline">
            {t("authLayout.tagline1")}
            <br />
            {t("authLayout.tagline1Sub")}
          </div>
          <div className="ab-tagline-sub">
            {t("authLayout.taglineSub1")}
            <br />
            {t("authLayout.taglineSub2")}
          </div>
          <div className="ab-feats">
            <div className="ab-feat">
              <CheckSquareFilled />
              <span>{t("authLayout.feat1")}</span>
            </div>
            <div className="ab-feat">
              <TeamOutlined />
              <span>{t("authLayout.feat2")}</span>
            </div>
            <div className="ab-feat">
              <ProjectOutlined />
              <span>{t("authLayout.feat3")}</span>
            </div>
            <div className="ab-feat">
              <CalendarOutlined />
              <span>{t("authLayout.feat4")}</span>
            </div>
          </div>
        </div>
        <div className="ab-foot">{t("authLayout.footer")}</div>
      </aside>
      <main className="ap">
        <div className="ap-wrap">{children}</div>
      </main>
    </div>
  );
}
