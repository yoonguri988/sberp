// pages/res/detail.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { fetchResourceDetailRequest } from "../../reducers/res/resourceReducer";

export default function ResourceDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["res", "common"]);

  const { detail: res } = useSelector((state) => state.resource);

  const resId = router.query.resId ? String(router.query.resId) : "";

  useEffect(() => {
    if (!router.isReady || !resId) return;
    dispatch(fetchResourceDetailRequest(resId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, resId]);

  if (!res) return null;

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/res/list">{t("shared.title")}</Link> ·{" "}
            {t("detail.breadcrumbCurrent")}
          </div>
          <h1>{res.resName}</h1>
          <p>{t("detail.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/res/list">
            <Button icon={<ArrowLeftOutlined />}>
              {t("shared.backToList")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="sb-card">
        <div className="sb-card__head">
          <h2>{t("detail.sectionTitle")}</h2>
        </div>
        <div className="sb-card__body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="sb-form-label">{t("field.resCode")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {res.resCode}
              </div>
            </div>
            <div className="col-md-6">
              <label className="sb-form-label">{t("field.resName")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {res.resName}
              </div>
            </div>
            <div className="col-md-3">
              <label className="sb-form-label">{t("field.resType")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {t(`enum.resType.${res.resType}`, {
                  defaultValue: res.resType,
                })}
              </div>
            </div>

            <div className="col-md-4">
              <label className="sb-form-label">{t("field.location")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {res.location || "-"}
              </div>
            </div>
            <div className="col-md-2">
              <label className="sb-form-label">{t("field.quantity")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {res.quantity}
              </div>
            </div>
            <div className="col-md-3">
              <label className="sb-form-label">{t("field.capacity")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {res.capacity ?? "-"}
              </div>
            </div>
            <div className="col-md-3">
              <label className="sb-form-label">{t("field.resStatus")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {t(`enum.resStatus.${res.resStatus}`, {
                  defaultValue: res.resStatus,
                })}
              </div>
            </div>

            <div className="col-12">
              <label className="sb-form-label">{t("field.remark")}</label>
              <div
                className="form-control"
                style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
              >
                {res.remark || "-"}
              </div>
            </div>

            <div className="col-12">
              <label className="dd-label">{t("field.manager")}</label>
              <div className="view-val">
                {res.managerEmpId ? (
                  <>
                    <span
                      className="sb-avatar"
                      style={{ width: 22, height: 22, fontSize: 11 }}
                    >
                      {(res.managerEmpName || "").charAt(0)}
                    </span>
                    <span className="ms-1">
                      {res.managerEmpName} {res.managerPosName}
                    </span>
                    <span
                      className="text-faint ms-1"
                      style={{ fontSize: 11.5 }}
                    >
                      #{res.managerEmpNo}
                    </span>
                  </>
                ) : (
                  <span className="view-val-empty">
                    {t("detail.managerEmpty")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
