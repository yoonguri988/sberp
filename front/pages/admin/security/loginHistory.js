// pages/admin/security/loginHistory.js
// 로그인 이력 관리 - 시스템 관리자 확인 페이지 (성공/실패 모두 조회)
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Input, Pagination, Select } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useTranslation } from "react-i18next";

import {
  fetchLoginHistoryListRequest,
  fetchLoginHistoryStatsRequest,
} from "../../../reducers/auth/loginHistoryReducer";
import StatTile from "../../../components/StatTile";

const ONE_PAGE_LIST = 10;

function statusBadge(status, t) {
  if (status === "S")
    return (
      <span className="sb-badge sb-badge--green">
        <CheckCircleOutlined /> {t("status.success")}
      </span>
    );
  if (status === "F")
    return (
      <span className="sb-badge sb-badge--red">
        <CloseCircleOutlined /> {t("status.fail")}
      </span>
    );
  return <span className="sb-badge sb-badge--gray">{status}</span>;
}

export default function AdminLoginHistoryPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["loginHistory", "common"]);

  const STATUS_TABS = [
    { value: "", labelKey: "common:label.all" },
    { value: "S", labelKey: "status.success" },
    { value: "F", labelKey: "status.fail" },
  ];

  const { list, totalElements, stats, loading } = useSelector(
    (state) => state.loginHistory,
  );

  const [empEmail, setEmpEmail] = useState("");
  const [startDt, setStartDt] = useState(null);
  const [endDt, setEndDt] = useState(null);

  const status = router.query.status || "";
  const currentPage = Number(router.query.page) || 1;

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;

    const defaultEndDt = moment().format("YYYY-MM-DD");
    const defaultStartDt = moment().subtract(29, "days").format("YYYY-MM-DD");
    const resolvedStartDt = q.startDt || defaultStartDt;
    const resolvedEndDt = q.endDt || defaultEndDt;

    setEmpEmail(q.empEmail || "");
    setStartDt(resolvedStartDt);
    setEndDt(resolvedEndDt);

    const search = {
      empEmail: q.empEmail || "",
      status: q.status || "",
      startDt: resolvedStartDt,
      endDt: resolvedEndDt,
      page: Number(q.page) || 1,
      size: ONE_PAGE_LIST,
    };
    dispatch(fetchLoginHistoryListRequest(search));
    dispatch(fetchLoginHistoryStatsRequest(search));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, router.query]);

  const runSearch = (page = 1) => {
    router.push({
      pathname: "/admin/security/loginHistory",
      query: {
        ...(status ? { status } : {}),
        ...(empEmail ? { empEmail } : {}),
        ...(startDt ? { startDt } : {}),
        ...(endDt ? { endDt } : {}),
        page,
      },
    });
  };

  const goStatus = (v) => {
    router.push({
      pathname: "/admin/security/loginHistory",
      query: {
        ...(empEmail ? { empEmail } : {}),
        ...(startDt ? { startDt } : {}),
        ...(endDt ? { endDt } : {}),
        ...(v ? { status: v } : {}),
      },
    });
  };

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("list.breadcrumbHome")}</Link> <span>&gt;</span>{" "}
            {t("list.breadcrumbCurrent")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-4">
            <StatTile
              icon={<HistoryOutlined />}
              tone="blue"
              label={t("list.statsTotal")}
              value={stats.total}
            />
          </div>
          <div className="col-sm-6 col-lg-4">
            <StatTile
              icon={<CheckCircleOutlined />}
              tone="green"
              label={t("list.statsSuccess")}
              value={stats.successCount}
            />
          </div>
          <div className="col-sm-6 col-lg-4">
            <StatTile
              icon={<SafetyOutlined />}
              tone="red"
              label={t("list.statsFail")}
              value={stats.failCount}
            />
          </div>
        </div>
      )}

      <div className="sb-card">
        <div className="sb-card__head">
          <h2>{t("list.cardTitle")}</h2>
          <div className="right">
            <div className="sb-segment">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={status === tab.value ? "active" : ""}
                  onClick={() => goStatus(tab.value)}
                >
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="row align-items-end g-2"
          style={{
            padding: "16px 18px",
            borderTop: "1px solid var(--sb-border)",
            margin: 0,
          }}
        >
          <div className="col-auto" style={{ minWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("list.filterStartDt")}
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={startDt ? moment(startDt) : null}
              onChange={(d) => setStartDt(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("list.filterEndDt")}
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={endDt ? moment(endDt) : null}
              onChange={(d) => setEndDt(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 220 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("list.filterEmail")}
            </label>
            <Input
              style={{ width: "100%" }}
              placeholder={t("list.filterEmailPlaceholder")}
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
              onPressEnter={() => runSearch(1)}
            />
          </div>
          <div className="col-auto">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => runSearch(1)}
            >
              {t("list.searchButton")}
            </Button>
          </div>
        </div>

        <div className="sb-search-note px-3">
          <InfoCircleOutlined /> {t("list.searchNotePrefix")}
          <b>{t("list.searchNoteEmphasis")}</b>
          {t("list.searchNoteSuffix")}
        </div>

        <div className="sb-card__body--flush">
          {(list || []).length === 0 ? (
            <div className="sb-empty">
              <HistoryOutlined style={{ fontSize: 30, opacity: 0.5 }} />
              <p>{t("list.empty")}</p>
            </div>
          ) : (
            <table className="sb-table">
              <thead>
                <tr>
                  <th style={{ width: 150 }}>{t("list.tableDatetime")}</th>
                  <th>{t("list.tableEmail")}</th>
                  <th style={{ width: 100 }}>{t("list.tableName")}</th>
                  <th style={{ width: 70 }}>{t("list.tableResult")}</th>
                  <th>{t("list.tableFailReason")}</th>
                  <th style={{ width: 130 }}>{t("list.tableIp")}</th>
                  <th>{t("list.tableUserAgent")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((h) => (
                  <tr key={h.loginId}>
                    <td>{moment(h.loginAt).format("YYYY-MM-DD HH:mm:ss")}</td>
                    <td>{h.empEmail}</td>
                    <td>{h.empName || "-"}</td>
                    <td>{statusBadge(h.status, t)}</td>
                    <td className="text-faint" style={{ fontSize: 12.5 }}>
                      {h.failReason || "-"}
                    </td>
                    <td>{h.loginIp || "-"}</td>
                    <td
                      className="text-faint"
                      style={{
                        fontSize: 12,
                        maxWidth: 260,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={h.userAgent}
                    >
                      {h.userAgent || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalElements > 0 && (
            <div
              className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ borderTop: "1px solid var(--sb-border)" }}
            >
              <span className="text-faint" style={{ fontSize: 12.5 }}>
                {t("list.totalCountPrefix")}
                <b>{totalElements}</b>
                {t("list.totalCountSuffix")}
              </span>
              <Pagination
                size="small"
                current={currentPage}
                total={totalElements}
                pageSize={ONE_PAGE_LIST}
                showSizeChanger={false}
                disabled={loading}
                onChange={runSearch}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
