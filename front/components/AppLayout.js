// components/AppLayout.js
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { Layout } from "antd";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import useIdleLogout from "../utils/useIdleLogout";
import SalAiChatWidget from "./sal/SalAiChatWidget";
import HrAiChatWidget from "./emp/HrAiChatWidget";

const { Sider, Content } = Layout;
const LS_LAYOUT_KEY = "sberp.layout"; // "standard" | "rail"

function AppLayout({ children }) {
  const router = useRouter();
  const [layoutMode, setLayoutMode] = useState("standard");

  const { user, accessToken, initialized } = useSelector((state) => state.auth);

  // 로그인 유지 시간 제한: 30분 미사용 시 자동 로그아웃 (절대 1시간 만료는 백엔드 refreshToken TTL로 처리)
  useIdleLogout(Boolean(accessToken));

  useEffect(() => {
    const saved = localStorage.getItem(LS_LAYOUT_KEY);
    if (saved === "rail" || saved === "standard") setLayoutMode(saved);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!accessToken) {
      router.replace("/auth/login");
    } else if (user?.pwdChangeRequired) {
      // 임시 비밀번호(사번) 상태로는 어떤 화면도 볼 수 없고 비밀번호 변경 화면으로만 이동 가능.
      // (새로고침/URL 직접 이동으로 이 가드를 우회해도 백엔드 JwtAuthenticationFilter가 API 호출을 막는다.)
      router.replace("/auth/changePass");
    }
  }, [initialized, accessToken, user, router]);

  const toggleLayout = () => {
    setLayoutMode((cur) => {
      const next = cur === "rail" ? "standard" : "rail";
      localStorage.setItem(LS_LAYOUT_KEY, next);
      return next;
    });
  };

  const isRail = layoutMode === "rail";
  // AI 급여 Q&A 챗봇 위젯: /sal/** 경로(급여관리 화면)를 보고 있을 때만 띄운다.
  const showSalAiChat = router.pathname.startsWith("/sal");

  // HR 근무규정 Q&A 챗봇 위젯이 나타나는 경로들(사원, 근태/연차 관리파트)
  const hrAiChatPaths = ["/emp", "/att"];
  const showHrAiChat = hrAiChatPaths.some((p) => router.pathname.startsWith(p));  

  // 아직 loadUser(쿠키 → accessToken 복원)가 끝나지 않았거나(initialized===false),
  // 끝났는데도 accessToken이 없거나(리다이렉트 대상) 비밀번호 변경이 강제된 상태라면
  // 모두 레이아웃을 그리지 않는다(화면이 잠깐이라도 보이는 것을 방지).
  if (!initialized || !accessToken || user?.pwdChangeRequired) {
    return null;
  }

  return (
    <Layout className="sb-app" data-layout={layoutMode}>
      <Sider
        className="sb-sidebar"
        id="sbSidebar"
        theme="light"
        width={248}
        collapsedWidth={72}
        collapsed={isRail}
        trigger={null} // Header의 자체 토글 버튼을 쓰므로 antd 기본 트리거 숨김
      >
        <Sidebar user={user} />
      </Sider>
      <Layout className="sb-main">
        <Header onToggleSidebar={toggleLayout} />
        <Content
          className="sb-content"
          style={{ display: "flex", flexDirection: "column", flex: "1 0 auto" }}
        >
          {children}
        </Content>
        <Footer />
      </Layout>
      {showSalAiChat && <SalAiChatWidget />}
      {showHrAiChat && <HrAiChatWidget />}
    </Layout>
  );
}

export default AppLayout;
