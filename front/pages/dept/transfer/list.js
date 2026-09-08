// pages/dept/transfer/list.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Select, message } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  WarningFilled,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  fetchImpactRequest,
  executeTransferRequest,
  cancelTransferRequest,
  resetDeptTransferState,
} from "../../../reducers/dept/deptTransferReducer";

export default function DeptTransferListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["dept", "common"]);

  const { impact, loading, error, success } = useSelector(
    (state) => state.deptTransfer,
  );

  const deptId = router.query.deptId ? String(router.query.deptId) : "";

  const [targets, setTargets] = useState({}); // { [empId]: deptId }
  const [bulkTarget, setBulkTarget] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const prevLoading = useRef(false);

  useEffect(() => {
    if (!router.isReady || !deptId) return;
    dispatch(fetchImpactRequest(deptId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, deptId]);

  useEffect(() => {
    if (!submitting) return;
    if (success) {
      message.success(t("transfer.list.completeSuccessMsg"));
      setSubmitting(false);
      dispatch(resetDeptTransferState());
      router.push(
        "/dept/list" + (impact?.comId ? `?comId=${impact.comId}` : ""),
      );
    } else if (error) {
      message.error(error);
      setSubmitting(false);
      dispatch(resetDeptTransferState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, submitting]);

  useEffect(() => {
    if (!canceling) return;
    if (success) {
      message.success(t("transfer.list.cancelSuccessMsg"));
      setCanceling(false);
      dispatch(resetDeptTransferState());
      router.push("/dept/transfer/pending");
    } else if (error) {
      message.error(error);
      setCanceling(false);
      dispatch(resetDeptTransferState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, canceling]);

  const employees = impact?.employees || [];
  const candidates = useMemo(
    () =>
      (impact?.candidates || []).map((c) => ({
        value: String(c.deptId),
        label: c.deptName,
      })),
    [impact],
  );

  const allFilled =
    employees.length === 0 || employees.every((e) => targets[e.empId]);

  const applyToAll = (deptIdValue) => {
    if (!deptIdValue) return;
    const next = {};
    employees.forEach((e) => {
      next[e.empId] = deptIdValue;
    });
    setTargets(next);
  };

  const handleApplyAi = () => {
    if (!impact?.aiRecom) return;
    setBulkTarget(String(impact.aiRecom.targetDeptId));
    applyToAll(String(impact.aiRecom.targetDeptId));
  };

  const handleCancelTransfer = () => {
    Modal.confirm({
      title: t("transfer.list.cancelModal.title"),
      content: t("transfer.list.cancelModal.content"),
      okText: t("transfer.list.cancelModal.okText"),
      okButtonProps: { danger: true },
      cancelText: t("transfer.list.cancelModal.cancelText"),
      onOk: () => {
        setCanceling(true);
        dispatch(cancelTransferRequest(deptId));
      },
    });
  };

  const handleSubmit = () => {
    if (!allFilled) return;
    const aiTargetId = impact?.aiRecom
      ? String(impact.aiRecom.targetDeptId)
      : null;
    const items = employees
      .filter((e) => targets[e.empId])
      .map((e) => ({
        empId: e.empId,
        newDeptId: targets[e.empId],
        aiRecommended:
          aiTargetId && targets[e.empId] === aiTargetId ? "Y" : "N",
      }));
    setSubmitting(true);
    dispatch(
      executeTransferRequest({
        deptId,
        items,
        aiReason: impact?.aiRecom?.reason || "",
        snapshotText: impact?.snapshotText || "",
      }),
    );
  };

  if (!impact) return null;

  return (
    <div className="sb-content">
      {/* 상단 안내 배너 */}
      <div className="sb-card mb-3">
        <div
          className="my-dept-banner"
          style={{
            background: "var(--sb-amber-soft)",
            borderColor: "var(--sb-amber)",
            color: "var(--sb-amber)",
          }}
        >
          <WarningFilled />
          <span>
            <b>{impact.deptName}</b>{" "}
            <span className="dept-code-chip">{impact.deptCode}</span>{" "}
            {t("transfer.list.bannerPart1")}{" "}
            <b>{t("transfer.list.bannerStatus")}</b>{" "}
            {t("transfer.list.bannerPart2")}
          </span>
        </div>
      </div>

      {/* AI 추천 카드 */}
      {impact.aiRecom && (
        <div
          className="sb-card mb-3"
          style={{ borderLeft: "4px solid var(--sb-accent)" }}
        >
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <ThunderboltOutlined
              style={{ fontSize: 20, color: "var(--sb-accent)" }}
            />
            <div style={{ flex: 1 }}>
              <div className="fw-semibold mb-1">
                {t("transfer.list.aiRecomTitle", {
                  targetDeptName: impact.aiRecom.targetDeptName,
                })}
              </div>
              <div style={{ fontSize: 13, color: "var(--sb-ink-soft)" }}>
                {impact.aiRecom.reason}
              </div>
              <Button
                size="small"
                className="mt-2"
                icon={<ThunderboltOutlined />}
                onClick={handleApplyAi}
              >
                {t("transfer.list.aiApplyBtn")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 영향도 요약 */}
      <div className="sb-card mb-3">
        <div className="d-flex flex-wrap gap-3 p-3">
          <div className="depth-info-box">
            <TeamOutlined style={{ color: "var(--sb-accent)" }} />
            {t("transfer.list.summary.empCountLabel")}{" "}
            <span className="depth-val">{impact.employeeCount}</span>
            {t("transfer.list.summary.empCountUnit")}
          </div>
          <div className="depth-info-box">
            <CalendarOutlined style={{ color: "var(--sb-cyan)" }} />
            {t("transfer.list.summary.reservationCountLabel")}{" "}
            <span className="depth-val">{impact.reservationCount}</span>
            {t("transfer.list.summary.reservationCountUnit")}
          </div>
          <div className="depth-info-box">
            <FileTextOutlined style={{ color: "var(--sb-violet)" }} />
            {t("transfer.list.summary.apprLineCountLabel")}{" "}
            <span className="depth-val">{impact.apprLineCount}</span>
            {t("transfer.list.summary.apprLineCountUnit")}
          </div>
          <div className="depth-info-box">
            <FileTextOutlined style={{ color: "var(--sb-green)" }} />
            {t("transfer.list.summary.apprDocCountLabel")}{" "}
            <span className="depth-val">{impact.apprDocCount}</span>
            {t("transfer.list.summary.apprDocCountUnit")}
          </div>
        </div>
        <div
          className="px-3 pb-3"
          style={{ fontSize: 12, color: "var(--sb-ink-faint)" }}
        >
          <InfoCircleOutlined /> {t("transfer.list.summary.infoNote")}
        </div>
      </div>

      {/* 이관 폼 */}
      <div className="sb-card">
        <div className="sb-toolbar">
          <span className="fw-semibold">{t("transfer.list.form.header")}</span>
          <div className="grow" />
          <Select
            style={{ minWidth: 220 }}
            placeholder={t("transfer.list.form.bulkPlaceholder")}
            options={candidates}
            value={bulkTarget}
            onChange={setBulkTarget}
          />
          <Button size="small" onClick={() => applyToAll(bulkTarget)}>
            {t("transfer.list.form.applyAllBtn")}
          </Button>
        </div>

        <div className="sb-card__body--flush">
          {employees.length > 0 ? (
            <table className="sb-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>{t("transfer.list.form.table.no")}</th>
                  <th style={{ width: 120 }}>{t("transfer.list.form.table.empNo")}</th>
                  <th style={{ minWidth: 120 }}>{t("transfer.list.form.table.empName")}</th>
                  <th style={{ width: 120 }}>{t("transfer.list.form.table.position")}</th>
                  <th style={{ minWidth: 220 }}>{t("transfer.list.form.table.targetDept")}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr key={emp.empId}>
                    <td className="tnum">{idx + 1}</td>
                    <td>
                      <span className="dept-code-chip">{emp.empNo}</span>
                    </td>
                    <td>{emp.empName}</td>
                    <td>{emp.posName}</td>
                    <td>
                      <Select
                        style={{ width: "100%" }}
                        placeholder={t("transfer.list.form.rowPlaceholder")}
                        options={candidates}
                        value={targets[emp.empId]}
                        onChange={(value) =>
                          setTargets((prev) => ({
                            ...prev,
                            [emp.empId]: value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sb-empty">
              <TeamOutlined style={{ fontSize: 30, opacity: 0.5 }} />
              <p>{t("transfer.list.form.emptyMsg")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button
          icon={<CloseCircleOutlined />}
          onClick={handleCancelTransfer}
          loading={canceling && loading}
        >
          {t("transfer.list.cancelBtn")}
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          disabled={!allFilled}
          loading={submitting && loading}
          onClick={handleSubmit}
        >
          {t("transfer.list.completeBtn")}
        </Button>
      </div>

      {/* 참고용 상세 : 미처리 예약 */}
      {impact.reservationCount > 0 && (
        <div className="sb-card mt-3">
          <div className="sb-toolbar">
            <span className="fw-semibold">{t("transfer.list.reservations.title")}</span>
          </div>
          <div className="sb-card__body--flush">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>{t("transfer.list.reservations.table.emp")}</th>
                  <th>{t("transfer.list.reservations.table.resource")}</th>
                  <th>{t("transfer.list.reservations.table.status")}</th>
                  <th>{t("transfer.list.reservations.table.startDt")}</th>
                  <th>{t("transfer.list.reservations.table.endDt")}</th>
                </tr>
              </thead>
              <tbody>
                {(impact.reservations || []).map((r, i) => (
                  <tr key={i}>
                    <td>{r.empName}</td>
                    <td>{r.resName}</td>
                    <td>
                      <span className="sb-badge sb-badge--amber">
                        {r.status}
                      </span>
                    </td>
                    <td>{r.startDt}</td>
                    <td>{r.endDt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 참고용 상세 : 결재 대기 라인 */}
      {impact.apprLineCount > 0 && (
        <div className="sb-card mt-3">
          <div className="sb-toolbar">
            <span className="fw-semibold">{t("transfer.list.apprLines.title")}</span>
          </div>
          <div className="sb-card__body--flush">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>{t("transfer.list.apprLines.table.emp")}</th>
                  <th>{t("transfer.list.apprLines.table.docTitle")}</th>
                  <th>{t("transfer.list.apprLines.table.linOrder")}</th>
                  <th>{t("transfer.list.apprLines.table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {(impact.apprLines || []).map((l, i) => (
                  <tr key={i}>
                    <td>{l.empName}</td>
                    <td>{l.docTitle}</td>
                    <td>{l.linOrder}</td>
                    <td>
                      <span className="sb-badge sb-badge--violet">
                        {l.linStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 참고용 상세 : 상신 진행중 결재문서 */}
      {impact.apprDocCount > 0 && (
        <div className="sb-card mt-3">
          <div className="sb-toolbar">
            <span className="fw-semibold">{t("transfer.list.apprDocs.title")}</span>
          </div>
          <div className="sb-card__body--flush">
            <table className="sb-table">
              <thead>
                <tr>
                  <th>{t("transfer.list.apprDocs.table.emp")}</th>
                  <th>{t("transfer.list.apprDocs.table.docTitle")}</th>
                  <th>{t("transfer.list.apprDocs.table.status")}</th>
                </tr>
              </thead>
              <tbody>
                {(impact.apprDocs || []).map((d, i) => (
                  <tr key={i}>
                    <td>{d.empName}</td>
                    <td>{d.docTitle}</td>
                    <td>
                      <span className="sb-badge sb-badge--green">
                        {d.docStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
