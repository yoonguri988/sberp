// components/LanguageSwitcher.js
import React from "react";
import { Dropdown, Menu } from "antd";
import { GlobalOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { setStoredLanguage } from "../i18n/languageStorage";
import { SUPPORTED_LANGUAGES } from "../i18n";

const LANG_LABEL = { ko: "한국어", en: "English" };
const LANG_SHORT = { ko: "KR", en: "EN" };

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = SUPPORTED_LANGUAGES.includes(i18n.language)
    ? i18n.language
    : "ko";

  const handleSelect = (lang) => {
    if (lang === current) return;
    i18n.changeLanguage(lang);
    setStoredLanguage(lang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  };

  const menu = (
    <Menu
      className="sb-lang-menu"
      selectedKeys={[current]}
      onClick={({ key }) => handleSelect(key)}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <Menu.Item key={lang} className="sb-dropdown-link">
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {lang === current ? (
              <CheckOutlined style={{ fontSize: 11 }} />
            ) : (
              <span style={{ width: 11, display: "inline-block" }} />
            )}
            {LANG_LABEL[lang]}
          </span>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
      <button
        className="sb-iconbtn"
        style={{ width: "auto", padding: "0 10px", fontSize: 12, fontWeight: 700 }}
        title="Language / 언어"
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <GlobalOutlined />
          <span style={{lineHeight: "normal"}}>{LANG_SHORT[current]}</span>
        </span>
      </button>
    </Dropdown>
  );
}