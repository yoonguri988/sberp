// components/Header.js
import React from "react";
import Link from "next/link";
import { Layout, Dropdown, Menu } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { logoutRequest } from "../reducers/auth/authReducer";

import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

const { Header: AntHeader } = Layout;

export default function Header({ onToggleSidebar }) {
  const dispatch = useDispatch();
  // 언어변경설정
  const { t } = useTranslation("header");
  const { user } = useSelector((state) => state.auth);
  const isAuthenticated = Boolean(user);
  const isAdmin =
    user?.roles?.includes("ADMIN") || user?.roles?.includes("ROOT");

  const handleLogout = () => {
    dispatch(logoutRequest());
  };

const userMenu = (
    <Menu className="sb-user-menu">
      <Menu.Item key="userinfo" className="sb-user-menu__info">
        <b style={{ fontSize: 13.5 }}>{user?.empName}</b>
        <br />
        <span className="text-faint" style={{ fontSize: 12 }}>
          {user?.empEmail}
        </span>
      </Menu.Item>
 
      <Menu.Divider />
 
      <Menu.Item key="profile">
        <Link href={`/emp/detail?empId=${user?.empId}`} passHref>
          <a className="sb-dropdown-link">
            <UserOutlined />
            {t("profile")}
          </a>
        </Link>
      </Menu.Item>
 
      {isAdmin && (
        <Menu.Item key="perm">
          <Link href="/perm/list" passHref>
            <a className="sb-dropdown-link">
              <SafetyCertificateOutlined />
              {t("permSettings")}
            </a>
          </Link>
        </Menu.Item>
      )}
 
      <Menu.Divider />
 
      <Menu.Item key="logout" danger onClick={handleLogout}>
        <span className="sb-dropdown-link">
          <LogoutOutlined />
          {t("logout")}
        </span>
      </Menu.Item>
    </Menu>
  );

  return (
    <AntHeader className="sb-header" id="sbHeader">
      <button
        className="sb-iconbtn"
        id="sbToggleSidebar"
        title={t("toggleSidebar")}
        onClick={onToggleSidebar}
      >
        <MenuOutlined />
      </button>

      <div className="sb-header__brand">
        <div
          className="sb-brand__mark"
          style={{ width: 26, height: 26, fontSize: 13 }}
        >
          S
        </div>
        <div className="sb-brand__name" style={{ fontSize: 16 }}>
          SB<b>erp</b>
        </div>
      </div>

      <div className="sb-header__spacer" />

      <div className="sb-header__right">
        <LanguageSwitcher />

        {isAuthenticated && (
          <Dropdown overlay={userMenu} trigger={["click"]} placement="bottomRight">
            <button
              className="sb-iconbtn"
              style={{ width: "auto", padding: "0 4px" }}
            >
              <span className="sb-avatar">
                {user?.empName?.[0]}
              </span>
            </button>
          </Dropdown>
        )}
      </div>
    </AntHeader>
  );
}