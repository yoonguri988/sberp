// pages/proj/proj_create.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, Input, Select, DatePicker, message } from "antd";
import { useTranslation } from "react-i18next";
import { createProjRequest } from "../../reducers/proj/projReducer";

import moment from "moment";

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { label: "TODO", value: "TODO" },
  { label: "DOING", value: "DOING" },
  { label: "DONE", value: "DONE" },
];

export default function ProjCreatePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("proj");

  const { loading, error, success } = useSelector((state) => state.proj);

  const [proStatus, setProStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (success) {
      router.push("/proj/proj_list");
    }
  }, [success, router]);

  const handleReset = () => {
    document.getElementById("pro_name").value = "";
    document.getElementById("pro_desc").value = "";
    setProStatus("");
    setStartDate("");
    setEndDate("");
  };

  const onFinish = () => {
    const proName = document.getElementById("pro_name").value;
    const proDesc = document.getElementById("pro_desc").value;

    if (!proName.trim()) { message.warning(t("create.nameRequired")); return; }
    if (!proDesc.trim()) { message.warning(t("create.descRequired")); return; }
    if (!proStatus) { message.warning(t("create.statusRequired")); return; }
    if (!startDate) { message.warning(t("create.startDateRequired")); return; }
    if (!endDate) { message.warning(t("create.endDateRequired")); return; }
    if (moment(startDate).isAfter(moment(endDate))) { message.warning(t("create.dateOrderError")); return; }

    dispatch( createProjRequest({ proName: proName.trim(), proDesc: proDesc.trim(), proStatus, startDate, endDate, }) );
  };

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("common.breadcrumbHome")}</Link>
            <i className="bi bi-chevron-right"></i> {t("common.breadcrumbWork")}
            <i className="bi bi-chevron-right"></i> {t("common.breadcrumbProj")}
            <i className="bi bi-chevron-right"></i> {t("create.breadcrumbCurrent")}
          </div>
          <h1>{t("create.title")}</h1>
          <p>{t("create.subtitle")}</p>
        </div>
      </div>

      <div className="sb-card">
        <div className="sb-card__body">
          <form id="projCreateForm" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="mb-3">
              <label htmlFor="pro_name" className="sb-form-label"> {t("create.nameLabel")} </label>
              <Input id="pro_name" name="pro_name" placeholder={t("create.namePlaceholder")} />
            </div>

            <div className="mb-3">
              <label htmlFor="pro_desc" className="sb-form-label"> {t("create.descLabel")} </label>
              <TextArea
                id="pro_desc"
                name="pro_desc"
                placeholder={t("create.descPlaceholder")}
                rows={4}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="pro_status" className="sb-form-label"> {t("create.statusLabel")} </label>
                <Select
                  id="pro_status"
                  value={proStatus || undefined}
                  onChange={(value) => setProStatus(value)}
                  options={STATUS_OPTIONS}
                  placeholder={t("create.statusPlaceholder")}
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="start_date" className="sb-form-label"> {t("create.startDateLabel")} </label>
                <DatePicker
                  id="start_date"
                  value={startDate ? moment(startDate, "YYYY-MM-DD") : null}
                  onChange={(date) => setStartDate(date ? date.format("YYYY-MM-DD") : "")}
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-4">
                <label htmlFor="end_date" className="sb-form-label"> {t("create.endDateLabel")} </label>
                <DatePicker
                  id="end_date"
                  value={endDate ? moment(endDate, "YYYY-MM-DD") : null}
                  onChange={(date) => setEndDate(date ? date.format("YYYY-MM-DD") : "")}
                  format="YYYY-MM-DD"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="reg_date" className="sb-form-label"> {t("create.regDateLabel")} </label>
              <Input
                id="reg_date"
                value={moment().format("YYYY-MM-DD")}
                readOnly
                style={{ maxWidth: 200, background: "#fafbfc" }}
              />
            </div>

            {error && <div className="text-danger mb-3">{error}</div>}
            <div className="sb-divider"></div>
              <div className="d-flex justify-content-end gap-2">
                <Button type="default" htmlType="button" onClick={handleReset}> {t("common.cancelBtn")} </Button>
                  <Link href="/proj/proj_list">
                  <Button>{t("common.listBtn")}</Button>
                  </Link>
                <Button type="primary" htmlType="button" loading={loading} onClick={onFinish}> {t("create.submitBtn")} </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
