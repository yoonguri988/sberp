// pages/notice/write.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, Input, Upload, Form, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { createNoticeRequest, resetNoticeState } from "../../reducers/notice/noticeReducer";

export default function NoticeWritePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["notice", "common"]);

  const { loading, error, success } = useSelector((state) => state.notice);

  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    dispatch(resetNoticeState());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      message.success(t("write.successMsg"));
      setFileList([]);
      dispatch(resetNoticeState());
      router.push("/notice/list");
    }
  }, [success, router, dispatch]);

  const onFinish = (values) => {
    const dto = {
      btitle: values.btitle,
      bcontent: values.bcontent,
    };
    const file = fileList.length > 0
      ? fileList[0].originFileObj
      : null;

    dispatch(createNoticeRequest({ dto, file }));
  };

  // 파일 선택 변경
  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };
  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("write.breadcrumbHome")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("write.breadcrumbWork")}
            <i className="bi bi-chevron-right"></i>
            <Link href="/notice/list">{t("write.breadcrumbList")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("write.breadcrumbCurrent")}
          </div>
          <h1>{t("write.title")}</h1>
          <p>{t("write.subtitle")}</p>
        </div>
      </div>
      <div className="sb-card mb-3">
        <div className="sb-card__body">
          <form id="noticeWriteForm" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="btitle" className="sb-form-label"> {t("write.titleLabel")} </label>
                <Input
                  id="btitle"
                  name="btitle"
                  className="form-control"
                  placeholder={t("write.titlePlaceholder")}
                />
              </div>
              <div className="col-12">
                <label htmlFor="bcontent" className="sb-form-label"> {t("write.contentLabel")} </label>
                <Input.TextArea
                  id="bcontent"
                  name="bcontent"
                  className="form-control"
                  rows={8}
                  placeholder={t("write.contentPlaceholder")}
                />
              </div>
              <div className="col-12">
                <label htmlFor="file" className="sb-form-label"> {t("write.fileLabel")} </label>
                <Upload
                  beforeUpload={() => false}
                  fileList={fileList}
                  onChange={handleChange}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>
                    {t("write.fileSelectBtn")}
                  </Button>
                </Upload>
                <div className="form-text"> {t("write.fileHint")} </div>
              </div>
            </div>
            <div className="sb-form-actions mt-4 mb-4 pe-2 text-end">
              <Button
                type="default"
                className="btn btn-ghost"
                onClick={() => router.push("/notice/list")}
              >
                {t("write.cancelBtn")}
              </Button>
              <Button
                type="default"
                className="btn btn-sb-soft"
                onClick={() => router.push("/notice/list")}
              >
                {t("write.listBtn")}
              </Button>
              <Button
                type="default"
                className="btn btn-sb"
                htmlType="button"
                loading={loading}
                onClick={() => {
                  const btitle = document.getElementById("btitle").value;
                  const bcontent = document.getElementById("bcontent").value;

                  if (!btitle.trim()) {
                    message.warning(t("write.titleRequired"));
                    return;
                  }

                  if (!bcontent.trim()) {
                    message.warning(t("write.contentRequired"));
                    return;
                  }

                  onFinish({ btitle, bcontent });
                }}
              >
                <i className="bi bi-megaphone"></i>
                {t("write.submitBtn")}
              </Button>
            </div>
          </form>
          {error && (<p style={{ color: "red" }}> {error} </p>)}
        </div>
      </div>
    </main>
  );
}
