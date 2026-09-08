// components/ApplicantLayout.js
// 채용 공개 사이트(/careers/**)의 공용 헤더 + 로그인 가드.
// 사내 AppLayout(사이드바형)과 달리 지원자 사이트는 상단 네비게이션 1줄짜리 심플한 구조로 간다
// (지원자는 메뉴가 "공고보기 / 내 지원현황" 둘 뿐이라 사이드바가 과함).
//
// requireAuth=true(기본)인 페이지는 apctAccessToken이 없으면 /careers/login으로 보낸다.
// 공고 목록/상세처럼 로그인 여부와 무관하게 항상 보호가 필요한 화면에서 사용.
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Button, Dropdown, Menu, Avatar } from "antd";
import { UserOutlined, LogoutOutlined, DownOutlined } from "@ant-design/icons";
import Link from "next/link";
import { apctLogout } from "../reducers/apct/apctAuthReducer";
import LanguageSwitcher from "./LanguageSwitcher";

export default function ApplicantLayout({ children, requireAuth = true }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("careers");
  const { apctUser, apctAccessToken, initialized } = useSelector(
    (state) => state.apctAuth,
  );

  useEffect(() => {
    if (!initialized || !requireAuth) return;
    if (!apctAccessToken) {
      const next = encodeURIComponent(router.asPath);
      router.replace(`/careers/login?next=${next}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, apctAccessToken, requireAuth]);

  const handleLogout = () => {
    dispatch(apctLogout());
    router.replace("/careers/login");
  };

  // 로그인 필요 화면인데 아직 세션 확인 전이거나 비로그인 → 리다이렉트 대상이므로 빈 화면
  if (requireAuth && (!initialized || !apctAccessToken)) {
    return null;
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="my">
        <Link href="/careers/my" passHref>
          <a>{t("layout.myApplicationsLink")}</a>
        </Link>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        {t("layout.logoutMenuItem")}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="cshell">
      <header className="cshell-hd">
        <div className="cshell-hd-inner">
          {/* next/link(구버전 API)는 자식을 정확히 1개만 허용하고, className 등은
              Link가 아니라 실제로 렌더되는 <a>에 직접 줘야 한다(Sidebar.js와 동일한 패턴).
              로고처럼 자식이 여러 개(span 2개)면 반드시 <a> 하나로 감싸야 한다. */}
          <Link href="/careers" passHref>
            <a className="cshell-logo">
              <span className="cshell-logo-mark">S</span>
              <span>SBerp Careers</span>
            </a>
          </Link>
          <nav className="cshell-nav">
            <Link href="/careers" passHref>
              <a className={router.pathname === "/careers" ? "on" : ""}>{t("layout.jobListLink")}</a>
            </Link>
            {apctAccessToken && (
              <Link href="/careers/my" passHref>
                <a className={router.pathname === "/careers/my" ? "on" : ""}>
                  {t("layout.myApplicationsLink")}
                </a>
              </Link>
            )}
          </nav>
          <div className="cshell-hd-right">
            <LanguageSwitcher />
            {apctAccessToken && apctUser ? (
              <Dropdown overlay={userMenu} trigger={["click"]}>
                <button type="button" className="cshell-user">
                  <Avatar size={26} icon={<UserOutlined />} />
                  <span className="cshell-user-email">
                    {apctUser.email || apctUser.provider}
                  </span>
                  <DownOutlined style={{ fontSize: 10 }} />
                </button>
              </Dropdown>
            ) : (
              <Button
                type="primary"
                size="small"
                onClick={() => router.push("/careers/login")}
              >
                {t("layout.loginBtn")}
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="cshell-main">{children}</main>
      <footer className="cshell-ft">{t("common.footer")}</footer>
    </div>
  );
}
