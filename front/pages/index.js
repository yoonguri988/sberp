// pages/index.js
// 권한별로 대시보드 페이지가 다르게 구성될 예정이니 index.js는 역할 분기 라우터로 사용한다

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { Spin } from "antd";

export default function Home() {
  const router = useRouter();
  const { user, initialized } = useSelector((s) => s.auth);

  useEffect(() => {
    // 아직 로그인 여부 확인 중이면 대기
    if (!initialized) return;

    // 비로그인 → 로그인 페이지 (AppLayout에서 이미 처리하지만 안전장치)
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // 역할에 따라 대시보드 분기(지금은 관리자/일반 사원만)
    const roles = user.roles || [];

    if (roles.includes("ROLE_ADMIN")) {
      // 회사 관리자 → admin용 대시보드
      router.replace("/dashboard/admin");

    } else {
      // 일반 사원 → 추후 사원용 대시보드 생성 시 경로 변경
      // 아직 없으므로 임시로 admin과 동일하게
      router.replace("/dashboard/member");
    }
  }, [user, initialized, router]);

  // 분기 판별 중 로딩 표시
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <Spin size="large" />
    </div>
  );
}