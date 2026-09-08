// components/ResvDetailView.js
import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
const RES_TYPE_LABEL = { ROOM: "회의실", EQUIPMENT: "장비", VEHICLE: "차량" };
const DATETIME_FORMAT = "YYYY-MM-DD HH:mm:ss";

// 서버(LocalDateTime)가 "2026-08-19T11:41:21.766415" 같은 마이크로초 포함 ISO 문자열을 그대로
// 내려주므로, 화면에는 항상 이 포맷으로 통일해서 보여준다. 값이 없으면 그대로 반환(placeholder는 호출부에서 처리).
function formatDt(dt) {
  if (!dt) return dt;
  const m = moment(dt);
  return m.isValid() ? m.format(DATETIME_FORMAT) : dt;
}

function statusBadge(status, t) {
  if (status === "WAI")
    return <span className="sb-badge sb-badge--amber">{t("status.waiting")}</span>;
  if (status === "APP")
    return <span className="sb-badge sb-badge--green">{t("status.approved")}</span>;
  if (status === "REJ")
    return <span className="sb-badge sb-badge--red">{t("status.rejected")}</span>;
  if (status === "NORET")
    return <span className="sb-badge sb-badge--red">{t("status.notReturned")}</span>;
  return <span className="sb-badge sb-badge--gray">{status}</span>;
}

function returnCell(r, t) {
  if (r.returnDt)  
    return (
      <span
        className="sb-badge sb-badge--green"
        style={{ whiteSpace: "nowrap" }}
      >
        {formatDt(r.returnDt)}
      </span>
    );
  if (r.status === "APP" || r.status === "NORET" && !r.returnDt)
    return <span className="sb-badge sb-badge--amber">{t("returnStatus.notReturned")}</span>;
  return <span className="view-val-empty">{t("returnStatus.notApplicable")}</span>;
}

export default function ResvDetailView({ resv }) {
  const { t } = useTranslation(["resv", "common"]);
  const resTypeLabel =
    { ROOM: t("resType.room"), EQUIPMENT: t("resType.equipment"), VEHICLE: t("resType.vehicle") }[
      resv.resType
    ] || resv.resType;

  return (
    <div className="row g-3 align-items-stretch">
      <div className="col-lg-7">
        <div className="sb-card mb-3">
          <div className="sb-card__head">
            <h2>{t("detailView.resourceInfoTitle")}</h2>
          </div>
          <div className="sb-card__body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="sb-form-label">{t("detailView.resName")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  <span>{resv.resName}</span>
                </div>
              </div>
              <div className="col-md-3">
                <label className="sb-form-label">{t("detailView.resCode")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  {resv.resCode}
                </div>
              </div>
              <div className="col-md-3">
                <label className="sb-form-label">{t("detailView.type")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  <span className="sb-badge sb-badge--gray">{resTypeLabel}</span>
                </div>
              </div>
              <div className="col-md-8">
                <label className="sb-form-label">{t("detailView.location")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  {resv.location || "-"}
                </div>
              </div>
              <div className="col-md-4">
                <label className="sb-form-label">{t("detailView.capacityQuantity")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  {resv.capacity
                    ? t("detailView.capacityValuePrefix", { capacity: resv.capacity })
                    : ""}
                  {resv.resQuantity ?? "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sb-card">
          <div className="sb-card__head">
            <h2>{t("detailView.reservationInfoTitle")}</h2>
          </div>
          <div className="sb-card__body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="sb-form-label">{t("detailView.startDt")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  {formatDt(resv.startDt)}
                </div>
              </div>
              <div className="col-md-3">
                <label className="sb-form-label">{t("detailView.endDt")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  {formatDt(resv.endDt)}
                </div>
              </div>
              <div className="col-md-2">
                <label className="sb-form-label">{t("detailView.quantity")}</label>
                <div className="form-control" style={{ background: "#fafbfc" }}>
                  {resv.quantity}
                </div>
              </div>
              <div className="col-md-4">
                <label className="sb-form-label">{t("detailView.returnDt")}</label>
                <div 
                className="form-control" 
                style={{
                    background: "#fafbfc",
                    overflow: "visible",
                    whiteSpace: "nowrap",
                  }}
                  >
                  {returnCell(resv, t)}
                </div>
              </div>
              <div className="col-12">
                <label className="dd-label">{t("detailView.remarkLabel")}</label>
                <div
                  className="view-val"
                  style={{
                    maxHeight: 120,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {resv.remark || (
                    <span className="view-val-empty">
                      {t("detailView.remarkEmpty")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-lg-5">
        <div className="sb-card h-100">
          <div className="sb-card__head">
            <h2>{t("detailView.applicantTitle")}</h2>
          </div>
          <div className="sb-card__body">
            <div className="sb-rowuser mb-2">
              <span className="sb-avatar">
                {(resv.empName || "").charAt(0)}
              </span>
              <div>
                <div className="fw-semibold">{resv.empName}</div>
                <div className="text-faint" style={{ fontSize: 12 }}>
                  {resv.deptName}
                </div>
              </div>
            </div>
            <label className="dd-label">{t("detailView.appliedAt")}</label>
            <div className="view-val">{formatDt(resv.createdAt)}</div>

            <div className="sb-divider" style={{ margin: "16px 0" }} />

            <h3 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>
              {t("detailView.processStatusTitle")}
            </h3>

            {resv.status === "WAI" && (
              <div className="sb-empty" style={{ padding: "16px 0" }}>
                <p style={{ fontSize: 12.5 }}>{t("detailView.waitingNote")}</p>
              </div>
            )}
            {resv.status === "APP" && (
              <>
                <label className="dd-label">{t("detailView.approverLabel")}</label>
                <div className="view-val">{resv.approvedEmpName}</div>
                <label className="dd-label mt-2">{t("detailView.approvedAtLabel")}</label>
                <div className="view-val">{formatDt(resv.approvedAt)}</div>
              </>
            )}
            {resv.status === "REJ" && (
              <>
                <label className="dd-label">{t("detailView.rejectorLabel")}</label>
                <div className="view-val">{resv.approvedEmpName}</div>
                <label className="dd-label mt-2">{t("detailView.rejectedAtLabel")}</label>
                <div className="view-val">{formatDt(resv.approvedAt)}</div>
                <label className="dd-label mt-2">{t("detailView.rejectReasonLabel")}</label>
                <div
                  className="view-val"
                  style={{
                    maxHeight: 100,
                    overflowY: "auto",
                    color: "var(--sb-red)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {resv.rejectReason}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { statusBadge };