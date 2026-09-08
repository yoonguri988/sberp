// pages/404.js
// 존재하지 않는 경로로 접근했을 때 Next가 자동으로 렌더링하는 정적 페이지.
// (빌드 시 정적 최적화 대상이라 여기서 API 호출/redux 로직은 넣지 않습니다.)
import React from "react";
import { useTranslation } from "react-i18next";
import ErrorResult from "../components/ErrorResult";

function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <ErrorResult
      status="404"
      title={t("error.404.title")}
      subTitle={t("error.404.desc")}
    />
  );
}

export default NotFoundPage;
