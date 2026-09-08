// pages/_error.js
// SSR/CSR 중 예상 못한 예외(getInitialProps에서 던진 에러, 렌더링 중 예외 등)를
// 잡아주는 Next의 커스텀 에러 페이지. statusCode에 따라 문구만 분기합니다.
// (정적으로 알려진 404/500은 각각 pages/404.js, pages/500.js가 우선 사용됩니다.)
import React from "react";
import { useTranslation } from "react-i18next";
import ErrorResult from "../components/ErrorResult";

function ErrorPage({ statusCode }) {
  const { t } = useTranslation("common");

  if (statusCode === 404) {
    return (
      <ErrorResult
        status="404"
        title={t("error.404.title")}
        subTitle={t("error.404.desc")}
      />
    );
  }

  if (statusCode >= 500) {
    return (
      <ErrorResult
        status="500"
        title={t("error.500.title")}
        subTitle={t("error.500.desc")}
      />
    );
  }

  return (
    <ErrorResult
      status="error"
      title={t("error.generic.title", { code: statusCode || "?" })}
      subTitle={t("error.generic.desc")}
    />
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
