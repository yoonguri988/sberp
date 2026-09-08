// components/ErrorResult.js
// 404 / 500 / 커스텀 에러 페이지가 공통으로 쓰는 결과 화면.
// AppLayout(사이드바/헤더) 밖에서, 로그인 여부와 무관하게 렌더링됩니다.
import React from "react";
import Link from "next/link";
import { Result, Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

// status: antd Result의 status prop과 동일 ("404" | "500" | "error" | ...)
function ErrorResult({ status, title, subTitle }) {
  const { t } = useTranslation("common");

  return (
    <div className="sb-error-wrap">
      <Result
        status={status}
        title={title}
        subTitle={subTitle}
        extra={
          <Link href="/">
            <Button type="primary" icon={<HomeOutlined />}>
              {t("error.backHome")}
            </Button>
          </Link>
        }
      />
    </div>
  );
}

export default ErrorResult;
