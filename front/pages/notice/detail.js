// pages/notice/detail.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, message } from "antd";
import { useTranslation } from "react-i18next";
import {
  fetchNoticeDetailRequest,
  deleteNoticeRequest,
  resetNoticeState,
} from "../../reducers/notice/noticeReducer";
import api from "../../api/axios";

export default function NoticeDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["notice", "common"]);
  const { bno } = router.query;

  const { currentNotice: notice, loading, error, deleteSuccess } = useSelector(
    (state) => state.notice
  );
  const user = useSelector((state) => state.auth.user);

  const isAdmin = user?.roles?.includes("ROOT") || user?.roles?.includes("ROLE_ADMIN");

  const [fileObjUrl, setFileObjUrl] = useState(null);

  useEffect(() => {
    if (bno) {
      dispatch(fetchNoticeDetailRequest({ bno }));
    }
    return () => {
      dispatch(resetNoticeState());
    };
  }, [dispatch, bno]);

  useEffect(() => {
    if (deleteSuccess) {
      message.success(t("detail.deleteSuccessMsg"));
      dispatch(resetNoticeState());
      router.push("/notice/list");
    }
  }, [deleteSuccess, router, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const [fileName, fileType] = notice?.bfile ? notice.bfile.split("|") : [null, null];
  const attExt = fileName ? fileName.split(".").pop().toLowerCase() : null;
  const isImage = fileType?.startsWith("image/");

  // 첨부파일을 axios로 받아와서(JWT 인증 헤더 포함) object URL로 변환
  useEffect(() => {
    if (!fileName || !bno) {
      setFileObjUrl(null);
      return;
    }

    let objectUrl;
    api
      .get(`/api/notice/${bno}/file`, { responseType: "blob" })
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setFileObjUrl(objectUrl);
      })
      .catch(() => {
        message.error(t("detail.fileLoadError"));
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileName, bno]);

  const handleDelete = () => {
    if (window.confirm(t("detail.deleteConfirm"))) {
      dispatch(deleteNoticeRequest({ bno }));
    }
  };

  let attachmentEl = null;

if (fileObjUrl) {
  if (isImage) {
    attachmentEl = (
      <div>
        <img
          src={fileObjUrl}
          alt={notice.btitle}
          className="img-fluid rounded mb-2"
          style={{ maxWidth: 500 }}
        />

        <div>
          <a
            href={fileObjUrl}
            download={fileName}
            className="btn btn-sb-soft"
          >
            <i className="bi bi-download"></i>
            {" " + t("detail.downloadBtn")}
          </a>
        </div>
      </div>
    );
  } else {
    attachmentEl = (
      <div className="d-flex align-items-center gap-2">
        {/* 파일명 */}
        <span
          title={fileName}
          style={{
            maxWidth: "350px",
            overflow: "hidden",
            minWidth: 0,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <i className="bi bi-paperclip"></i>{" "}
          {fileName}
        </span>

        {/* 다운로드 */}
        <a
          href={fileObjUrl}
          download={fileName}
          className="btn btn-sb-soft"
        >
          <i className="bi bi-download"></i>
          {" " + t("detail.downloadBtn")}
        </a>
      </div>
    );
  }
}

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("detail.breadcrumbHome")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("detail.breadcrumbWork")}
            <i className="bi bi-chevron-right"></i>
            <Link href="/notice/list">{t("detail.breadcrumbList")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("detail.breadcrumbCurrent")}
          </div>
          <h1>{t("detail.title")}</h1>
          <p>{t("detail.subtitle")}</p>
        </div>
      </div>

      <div className="sb-card mb-3">
        <div className="sb-card__body">
          <div className="mb-3">
            <label className="sb-form-label">{t("detail.titleLabel")}</label>
            <input type="text" className="form-control" value={notice?.btitle || ""} readOnly />
          </div>
          <div className="mb-3">
            <label className="sb-form-label">{t("detail.contentLabel")}</label>
            <textarea className="form-control" rows={10} readOnly value={notice?.bcontent || ""} />
          </div>

          {notice?.bfile && (
            <div className="mb-3">
              <label className="sb-form-label">{t("detail.attachmentLabel")}</label>
              <div className="mt-2">{attachmentEl}</div>
            </div>
          )}
        </div>

        <div className="sb-card__footer d-flex justify-content-end gap-2 mb-3 pe-3">
          {isAdmin && (
            <Button type="default" className="btn btn-sb-soft" onClick={() => router.push(`/notice/edit?bno=${bno}`)}>
              <i className="bi bi-pencil-square"></i>
              {t("detail.editBtn")}
            </Button>
          )}
          {isAdmin && (
            <Button type="default" className="btn btn-outline-danger" loading={loading} onClick={handleDelete}>
              <i className="bi bi-trash"></i>
              {t("detail.deleteBtn")}
            </Button>
          )}
          <Button type="default" className="btn btn-sb" onClick={() => router.push("/notice/list")}>
            <i className="bi bi-list"></i>
            {t("detail.listBtn")}
          </Button>
        </div>
      </div>
    </main>
  );
}
