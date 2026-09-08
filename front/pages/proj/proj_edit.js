// pages/proj/proj_edit.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, Input, Select, DatePicker, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { fetchProjDetailRequest, updateProjRequest, } from "../../reducers/proj/projReducer";

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { label: "TODO", value: "TODO" },
  { label: "DOING", value: "DOING" },
  { label: "DONE", value: "DONE" },
];

export default function ProjEditPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("proj");

  const { currentProject, loading, error, success } = useSelector(
    (state) => state.proj
  );

  const dto = currentProject?.dto;

  const [form, setForm] = useState({
    proId: "",
    proName: "",
    proDesc: "",
    proStatus: "",
    startDate: "",
    endDate: "",
  });

  // 프로젝트 상세 조회
  useEffect(() => {
    if (!router.isReady) return;

    const proId = Number(router.query.proId);
    if (!proId) return;

    dispatch(
      fetchProjDetailRequest({
        proId,
        pstartno: 1,
      })
    );
  }, [router.isReady, router.query.proId, dispatch]);

  // 조회된 프로젝트를 form에 세팅
  useEffect(() => {
    if (!dto) return;

    setForm({
      proId: dto.proId,
      proName: dto.proName || "",
      proDesc: dto.proDesc || "",
      proStatus: dto.proStatus || "",
      startDate: dto.startDate || "",
      endDate: dto.endDate || "",
    });
  }, [dto]);

  // 수정 성공
  useEffect(() => {
    if (!success) return;

    message.success(t("edit.successMsg"));

    router.push({
      pathname: "/proj/proj_detail",
      query: {
        proId: form.proId,
      },
    });
  }, [success, form.proId, router]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.proName.trim()) { message.warning(t("edit.nameRequired")); return; }
    if (!form.proDesc.trim()) { message.warning(t("edit.descRequired")); return; }
    if (!form.proStatus) { message.warning(t("edit.statusRequired")); return; }
    if (!form.startDate) { message.warning(t("edit.startDateRequired")); return; }
    if (!form.endDate) { message.warning(t("edit.endDateRequired")); return; }
    if (moment(form.startDate).isAfter(moment(form.endDate))) { message.warning(t("edit.dateOrderError")); return; }

    dispatch(
      updateProjRequest({
        proId: form.proId,
        dto: {
          proId: form.proId,
          proName: form.proName.trim(),
          proDesc: form.proDesc.trim(),
          proStatus: form.proStatus,
          startDate: form.startDate,
          endDate: form.endDate,
        },
      })
    );
  };

  const handleCancel = () => {
    router.push({
      pathname: "/proj/proj_detail",
      query: {
        proId: form.proId,
      },
    });
  };

  // 조회 중
  if (!dto) {
    return (
      <main className="sb-content">
        <div className="sb-page-head">
          <div className="sb-page-head__txt">
            <div className="sb-breadcrumb">
              {t("common.breadcrumbHome")} <i className="bi bi-chevron-right"></i> {t("common.breadcrumbWork")}{" "}
              <i className="bi bi-chevron-right"></i> {t("common.breadcrumbProj")}{" "}
              <i className="bi bi-chevron-right"></i> {t("edit.breadcrumbCurrent")}
            </div>

            <h1>{t("edit.title")}</h1>
            <p>{t("edit.subtitle")}</p>
          </div>
        </div>

        <div className="sb-card">
          <div className="sb-card__body text-center">
            {loading
              ? t("edit.loadingMsg")
              : t("edit.notFoundMsg")}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="sb-content">
      {/* 페이지 헤더 */}
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common.breadcrumbHome")} <i className="bi bi-chevron-right"></i> {t("common.breadcrumbWork")}{" "}
            <i className="bi bi-chevron-right"></i> {t("common.breadcrumbProj")}{" "}
            <i className="bi bi-chevron-right"></i> {t("edit.breadcrumbCurrent")}
          </div>
          <h1>{t("edit.title")}</h1>
          <p>{t("edit.subtitle")}</p>
        </div>
      </div>
      <div className="sb-card">
        <div className="sb-card__body">
          {error && (
            <div className="text-danger mb-3">
              {error}
            </div>
          )}
          <div className="mb-3">
            <label className="sb-form-label"> {t("edit.nameLabel")} </label>
            <Input
              value={form.proName}
              onChange={(e) =>
                handleChange("proName", e.target.value)
              }
              placeholder={t("edit.namePlaceholder")}
            />
          </div>
          <div className="mb-3">
            <label className="sb-form-label"> {t("edit.descLabel")} </label>
            <TextArea
              rows={4}
              value={form.proDesc}
              onChange={(e) =>
                handleChange("proDesc", e.target.value)
              }
              placeholder={t("edit.descPlaceholder")}
            />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="sb-form-label"> {t("edit.statusLabel")} </label>
              <Select
                value={form.proStatus || undefined}
                options={STATUS_OPTIONS}
                placeholder={t("edit.statusPlaceholder")}
                onChange={(value) =>
                  handleChange("proStatus", value)
                }
                style={{ width: "100%" }}
              />
            </div>
            <div className="col-md-4">
              <label className="sb-form-label"> {t("edit.startDateLabel")} </label>
              <DatePicker
                value={
                  form.startDate
                    ? moment(form.startDate)
                    : null
                }
                onChange={(date) =>
                  handleChange(
                    "startDate",
                    date
                      ? date.format("YYYY-MM-DD")
                      : ""
                  )
                }
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
              />
            </div>
            <div className="col-md-4">
              <label className="sb-form-label"> {t("edit.endDateLabel")} </label>
              <DatePicker
                value={
                  form.endDate
                    ? moment(form.endDate)
                    : null
                }
                onChange={(date) =>
                  handleChange(
                    "endDate",
                    date
                      ? date.format("YYYY-MM-DD")
                      : ""
                  )
                }
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="sb-form-label"> {t("edit.updatedAtLabel")} </label>
            <Input
              value={ dto.updatedAt ? moment(dto.updatedAt).format( "YYYY-MM-DD HH:mm:ss" ) : "-" }
              readOnly
              style={{
                maxWidth: 250,
                background: "#fafbfc",
              }}
            />
          </div>
          <div className="sb-divider"></div>
          <div className="d-flex justify-content-end gap-2">
            <Button onClick={handleCancel}> {t("common.cancelBtn")} </Button>
            <Link href="/proj/proj_list">
              <Button> {t("common.listBtn")} </Button>
            </Link>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSubmit}
            >
              {t("edit.submitBtn")}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
