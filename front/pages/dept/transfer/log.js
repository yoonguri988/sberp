// pages/dept/transfer/log.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Pagination, Select } from "antd";
import {
  HistoryOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { fetchTransferLogRequest } from "../../../reducers/dept/deptTransferReducer";

const ONE_PAGE_LIST = 10;

export default function DeptTransferLogPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["dept", "common"]);

  const { logs, logTotal, deptOptions } = useSelector(
    (state) => state.deptTransfer,
  );

  const [originDeptId, setOriginDeptId] = useState(undefined);
  const [targetDeptId, setTargetDeptId] = useState(undefined);
  const [aiRecommended, setAiRecommended] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const defaultDateTo = moment().format("YYYY-MM-DD");
    const defaultDateFrom = moment().subtract(30, "days").format("YYYY-MM-DD");
    const resolvedDateFrom = q.dateFrom || defaultDateFrom;
    const resolvedDateTo = q.dateTo || defaultDateTo;

    setOriginDeptId(q.originDeptId || undefined);
    setTargetDeptId(q.targetDeptId || undefined);
    setAiRecommended(q.aiRecommended || "");
    setDateFrom(resolvedDateFrom);
    setDateTo(resolvedDateTo);
    dispatch(
      fetchTransferLogRequest({
        originDeptId: q.originDeptId || "",
        targetDeptId: q.targetDeptId || "",
        aiRecommended: q.aiRecommended || "",
        dateFrom: resolvedDateFrom,
        dateTo: resolvedDateTo,
        pstartno: Number(q.pstartno) || 1,
        onepagelist: ONE_PAGE_LIST,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, router.query]);

  const currentPage = Number(router.query.pstartno) || 1;

  const runSearch = (page = 1) => {
    router.push({
      pathname: "/dept/transfer/log",
      query: {
        ...(originDeptId ? { originDeptId } : {}),
        ...(targetDeptId ? { targetDeptId } : {}),
        ...(aiRecommended ? { aiRecommended } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        pstartno: page,
      },
    });
  };

  const handleReset = () => {
    router.push({ pathname: "/dept/transfer/log" });
  };

  return (
    <div className="sb-content">
      <div className="sb-card mb-3">
        <div className="sb-toolbar">
          <span className="fw-semibold">
            <HistoryOutlined /> {t("transfer.log.title")}
          </span>
        </div>

        {/* 필터 */}
        <div
          className="row align-items-end g-2"
          style={{
            padding: "16px 18px",
            borderTop: "1px solid var(--sb-border)",
            margin: 0,
          }}
        >
          <div className="col-auto" style={{ minWidth: 170 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("transfer.log.filter.originDept")}
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={t("common:label.all")}
              allowClear
              value={originDeptId}
              onChange={setOriginDeptId}
              options={(deptOptions || []).map((d) => ({
                value: String(d.deptId),
                label: d.deptName,
              }))}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 170 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("transfer.log.filter.targetDept")}
            </label>
            <Select
              style={{ width: "100%" }}
              placeholder={t("common:label.all")}
              allowClear
              value={targetDeptId}
              onChange={setTargetDeptId}
              options={(deptOptions || []).map((d) => ({
                value: String(d.deptId),
                label: d.deptName,
              }))}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("transfer.log.filter.aiRecommended")}
            </label>
            <Select
              style={{ width: "100%" }}
              value={aiRecommended || ""}
              onChange={setAiRecommended}
              options={[
                { value: "", label: t("common:label.all") },
                { value: "Y", label: t("transfer.log.filter.aiAccepted") },
                { value: "N", label: t("transfer.log.filter.manual") },
              ]}
            />
          </div>
          <div className="col-auto" style={{ maxWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("transfer.log.filter.dateFrom")}
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={dateFrom ? moment(dateFrom) : null}
              onChange={(d) => setDateFrom(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto" style={{ maxWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("transfer.log.filter.dateTo")}
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={dateTo ? moment(dateTo) : null}
              onChange={(d) => setDateTo(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto d-flex gap-2">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => runSearch(1)}
            >
              {t("common:button.search")}
            </Button>
            <Button onClick={handleReset}>{t("common:button.reset")}</Button>
          </div>
        </div>

        <div
          className="px-3 pt-2"
          style={{ fontSize: 12, color: "var(--sb-ink-faint)" }}
        >
          <InfoCircleOutlined /> {t("transfer.log.infoNotePrefix")}{" "}
          <b>{t("transfer.log.infoNoteBold")}</b> {t("transfer.log.infoNoteSuffix")}
        </div>

        <div className="sb-card__body--flush mt-2">
          {(logs || []).length > 0 ? (
            <table className="sb-table">
              <thead>
                <tr>
                  <th style={{ width: 150 }}>{t("transfer.log.table.processedAt")}</th>
                  <th>{t("transfer.log.table.originDept")}</th>
                  <th>{t("transfer.log.table.targetDept")}</th>
                  <th>{t("transfer.log.table.emp")}</th>
                  <th style={{ width: 110 }}>{t("transfer.log.table.aiSuggested")}</th>
                  <th>{t("transfer.log.table.aiReason")}</th>
                  <th style={{ width: 100 }}>{t("transfer.log.table.processedBy")}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td>{l.createdAt}</td>
                    <td>{l.originDeptName}</td>
                    <td>{l.targetDeptName}</td>
                    <td>
                      {l.empName} ({l.empNo})
                    </td>
                    <td>
                      {l.aiRecommended === "Y" ? (
                        <span className="sb-badge sb-badge--accent">
                          <ThunderboltOutlined /> {t("transfer.log.aiAcceptedBadge")}
                        </span>
                      ) : (
                        <span className="sb-badge sb-badge--gray">
                          {t("transfer.log.manualBadge")}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        maxWidth: 280,
                        fontSize: 12.5,
                        color: "var(--sb-ink-soft)",
                      }}
                    >
                      {l.aiReason || "-"}
                    </td>
                    <td>{l.createdByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sb-empty">
              <HistoryOutlined style={{ fontSize: 30, opacity: 0.5 }} />
              <p>{t("transfer.log.emptyMsg")}</p>
            </div>
          )}

          {/* 페이지네이션 */}
          {logTotal > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
              }}
            >
              <span style={{ color: "var(--sb-ink-faint)", fontSize: 12 }}>
                {t("transfer.log.totalCountPrefix")} <b>{logTotal}</b>
                {t("transfer.log.totalCountSuffix")}
              </span>
              <Pagination
                size="small"
                current={currentPage}
                total={logTotal}
                pageSize={ONE_PAGE_LIST}
                showSizeChanger={false}
                onChange={runSearch}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
