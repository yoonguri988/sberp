// pages/eval/report/list.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Table, Tag, Button, Avatar, Input, message, } from "antd";
import { EyeOutlined, ReloadOutlined, CalendarOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  listReportRequest, generateReportRequest, regenerateReportRequest,
  resetReportState,
} from "../../../reducers/eval/evalReportReducer";

const GRADE_COLOR = { S: "#eb2f96", A: "#52c41a", B: "#1890ff", C: "#fa8c16", D: "#ff4d4f" };

export default function EvalReportListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { periodId, keyword, page } = router.query;

  const SENTIMENT = {
    POSITIVE: { color: "green", label: t("common.sentiment.positive") },
    NEUTRAL: { color: "default", label: t("common.sentiment.neutral") },
    NEGATIVE: { color: "red", label: t("common.sentiment.negative") },
  };

  const { reportList, reportPeriod, reportCount, paging, loading, success, error } =
    useSelector((state) => state.report);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    if (!periodId) return;
    dispatch(listReportRequest({ periodId, keyword, page }));

    return () => { dispatch(resetReportState()); };
  }, [dispatch, periodId, keyword, page]);

  useEffect(() => {
    if (success) {
      message.success(t("report.list.processedMsg"));
      dispatch(resetReportState());
      dispatch(listReportRequest({ periodId }));
    }
    if (error) { message.error(error); dispatch(resetReportState()); }
  }, [success, error, dispatch, periodId]);

  const columns = [
    {
      title: t("report.list.table.emp"),
      key: "emp",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small">{r.empName?.charAt(0)}</Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{r.empName}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{r.deptName} · {r.posName}</div>
          </div>
        </div>
      ),
    },
    {
      title: t("report.list.table.grade"),
      dataIndex: "grade",
      key: "grade",
      width: 70,
      align: "center",
      render: (g) => (
        <span style={{ fontWeight: 700, fontSize: 18, color: GRADE_COLOR[g] }}>{g}</span>
      ),
    },
    {
      title: t("report.list.table.score"),
      dataIndex: "overallScore",
      key: "score",
      width: 100,
      align: "center",
      render: (s) => s?.toFixed(2),
    },
    {
      title: t("report.list.table.sentiment"),
      dataIndex: "sentimentLabel",
      key: "sentiment",
      width: 80,
      render: (s) => {
        const st = SENTIMENT[s];
        return st ? <Tag color={st.color}>{st.label}</Tag> : "—";
      },
    },
    {
      title: t("report.list.table.date"),
      dataIndex: "generatedAt",
      key: "date",
      width: 160,
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_, r) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Link href={{ pathname: "/eval/report/detail", query: { reportId: r.reportId } }}>
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Link>
          {isAdmin && (
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              title={t("report.list.regenerateTooltip")}
              onClick={() =>
                dispatch(regenerateReportRequest({ periodId: Number(periodId), empId: r.empId }))
              }
            />
          )}
        </div>
      ),
    },
  ];

  //////
  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("common.breadcrumbRoot")} &gt; {t("report.list.breadcrumbCurrent")}</div>
          <h1>{t("report.list.title")}</h1>
          <p>{t("report.list.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions" style={{ display: "flex", gap: 8 }}>
          {periodId && (
            <Link href="/eval/report/list"><Button>{t("report.list.periodChangeBtn")}</Button></Link>
          )}
          {isAdmin && (
            <Link href="/eval/period/list">
              <Button icon={<CalendarOutlined />}>{t("report.list.periodManageBtn")}</Button>
            </Link>
          )}
        </div>
      </div>

      {/* 회차 미선택 */}
      {!periodId && (
        <Card>
          <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
            <p>{t("report.list.selectPeriodMsg")}</p>
            <Link href="/eval/period/list">
              <Button type="primary">{t("report.list.periodListBtn")}</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 회차 선택됨 */}
      {periodId && (
        <>
          {reportPeriod && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Tag color={reportPeriod.periodStatus === "REPORTED" ? "green" : "default"}>
                    {reportPeriod.periodStatus}
                  </Tag>
                  <span style={{ fontWeight: 650, marginLeft: 8 }}>{reportPeriod.title}</span>
                  <span style={{ color: "#999", marginLeft: 8 }}>{t("report.list.countSuffix", { count: reportCount })}</span>
                </div>
                {isAdmin && (
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => dispatch(generateReportRequest(Number(periodId)))}
                    loading={loading}
                  >
                    {t("report.list.regenerateAllBtn")}
                  </Button>
                )}
              </div>
            </Card>
          )}

          <Card>
            <Table
              rowKey="reportId"
              columns={columns}
              dataSource={reportList}
              loading={loading}
              pagination={paging ? {
                current: paging.current,
                pageSize: paging.onepagelist,
                total: paging.listtotal,
                onChange: (p) => router.push({
                  pathname: "/eval/report/list",
                  query: { ...router.query, page: p },
                }),
              } : false}
              locale={{ emptyText: t("report.list.emptyMsg") }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
