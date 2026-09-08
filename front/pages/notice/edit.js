// pages/notice/edit.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "../../api/axios.js";
import { Button, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  fetchNoticeDetailRequest,
  updateNoticeRequest,
  resetNoticeState,
} from "../../reducers/notice/noticeReducer";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function NoticeEditPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["notice", "common"]);
  const { bno } = router.query;
  const { currentNotice: notice, loading, error, success } = useSelector(
    (state) => state.notice
  );

  const [btitle, setBtitle] = useState("");
  const [bcontent, setBcontent] = useState("");
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (bno) {
      dispatch(fetchNoticeDetailRequest({ bno }));
    }
    return () => {
      dispatch(resetNoticeState());
    };
  }, [dispatch, bno]);

  useEffect(() => {
    if (notice) {
      setBtitle(notice.btitle || "");
      setBcontent(notice.bcontent || "");
    }
  }, [notice]);

  useEffect(() => {
    if (success) {
      message.success(t("edit.successMsg"));
      setFileList([]);
      dispatch(resetNoticeState());
      router.push(`/notice/detail?bno=${bno}`);
    }
  }, [success, router, dispatch, bno]);

  const onFinish = () => {
    if (!btitle.trim()) {
      message.warning(t("edit.titleRequired"));
      return;
    }
    if (!bcontent.trim()) {
      message.warning(t("edit.contentRequired"));
      return;
    }

    const dto = { btitle, bcontent };
    const file = fileList.length > 0 ? fileList[0].originFileObj : null;

    dispatch(updateNoticeRequest({ bno, dto, file }));
  };

  const handleChange = ({ fileList }) => {
    setFileList(fileList);
  };
  const handleFilePreview = async () => {
    try {
      const res = await axios.get(fileUrl, { responseType: "blob" });
      const blobUrl = URL.createObjectURL(res.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      message.error(t("edit.fileLoadError") || "파일을 불러올 수 없습니다.");
    }
  };
const bfileName = notice?.bfile ? notice.bfile.split("|")[0] : null;
const attExt = bfileName ? bfileName.split(".").pop().toLowerCase() : null;
const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(attExt);
const fileUrl = notice?.bfile ? `${API_BASE}/api/notice/${bno}/file` : null;
const [imgSrc, setImgSrc] = useState(null);
useEffect(() => {
  if (isImage && fileUrl) {
    axios.get(fileUrl, { responseType: "blob" })
      .then((res) => setImgSrc(URL.createObjectURL(res.data)))
      .catch(() => setImgSrc(null));
  }
}, [isImage, fileUrl]);
  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("edit.breadcrumbHome")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("edit.breadcrumbWork")}
            <i className="bi bi-chevron-right"></i>
            <Link href="/notice/list">{t("edit.breadcrumbList")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("edit.breadcrumbCurrent")}
          </div>
          <h1>{t("edit.title")}</h1>
          <p>{t("edit.subtitle")}</p>
        </div>
      </div>

      <div className="sb-card mb-3">
        <div className="sb-card__body">
          <form id="noticeEditForm" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="row g-3">
              <div className="col-12">
                <label htmlFor="btitle" className="sb-form-label"> {t("edit.titleLabel")} </label>
                <Input
                  id="btitle"
                  name="btitle"
                  className="form-control"
                  value={btitle}
                  onChange={(e) => setBtitle(e.target.value)}
                  placeholder={t("edit.titlePlaceholder")}
                />
              </div>

              <div className="col-12">
                <label htmlFor="bcontent" className="sb-form-label"> {t("edit.contentLabel")} </label>
                <Input.TextArea
                  id="bcontent"
                  name="bcontent"
                  className="form-control"
                  value={bcontent}
                  onChange={(e) => setBcontent(e.target.value)}
                  rows={8}
                  placeholder={t("edit.contentPlaceholder")}
                />
              </div>

              {notice?.bfile && (
                <div className="col-12">
                  <label className="sb-form-label">{t("edit.existingFileLabel")}</label>
                  <div className="mt-1">
                    {isImage ? (
                      <img
                        src={imgSrc}
                        alt={bfileName}
                        className="img-fluid rounded"
                        style={{ maxWidth: 200 }}
                      />
                  ) : (
                    <Button
                      type="default"
                      className="btn btn-sb-soft btn-sm"
                      icon={<i className="bi bi-paperclip"></i>}
                      onClick={handleFilePreview}
                    >
                      {t("edit.viewFileBtn", { ext: attExt })}
                    </Button>
                  )}
                  </div>
                  <div className="form-text">{t("edit.fileReplaceNote")}</div>
                </div>
              )}

              <div className="col-12">
                <label htmlFor="file" className="sb-form-label"> {t("edit.fileLabel")} </label>
                <Upload
                  beforeUpload={() => false}
                  fileList={fileList}
                  onChange={handleChange}
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>{t("edit.fileSelectBtn")}</Button>
                </Upload>
                <div className="form-text"> {t("edit.fileHint")} </div>
              </div>
            </div>

            <div className="sb-form-actions mt-4 mb-4 pe-2 text-end">
              <Button type="default" className="btn btn-ghost" onClick={() => router.push(`/notice/detail?bno=${bno}`)}>
                {t("edit.cancelBtn")}
              </Button>
              <Button type="default" className="btn btn-sb-soft" onClick={() => router.push("/notice/list")}>
                {t("edit.listBtn")}
              </Button>
              <Button
                type="default"
                className="btn btn-sb"
                htmlType="button"
                loading={loading}
                onClick={onFinish}
              >
                <i className="bi bi-pencil-square"></i>
                {t("edit.submitBtn")}
              </Button>
            </div>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </main>
  );
}
