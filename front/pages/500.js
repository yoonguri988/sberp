// pages/500.js
// 정적 500 폴백 페이지. (statusCode별 분기가 필요한 동적 에러는 pages/_error.js 담당)
import React from "react";
import { useTranslation } from "react-i18next";
import ErrorResult from "../components/ErrorResult";

function ServerErrorPage() {
  const { t } = useTranslation("common");

  return (
    <ErrorResult
      status="500"
      title={t("error.500.title")}
      subTitle={t("error.500.desc")}
    />
  );
}

export default ServerErrorPage;
