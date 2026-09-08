// pages/eval/report/my.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import { Card, Table, Tag, Button, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { myReportRequest, resetReportState, } from "../../../reducers/eval/evalReportReducer";

const GRADE_COLOR = { S: "#eb2f96", A: "#52c41a", B: "#1890ff", C: "#fa8c16", D: "#ff4d4f" };

export default function MyReportPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { myReports, loading, error } = useSelector((state) => state.report);

  const SENTIMENT = {
    POSITIVE: { color: "green", label: t("common.sentiment.positive") },
    NEUTRAL: { color: "default", label: t("common.sentiment.neutral") },
    NEGATIVE: { color: "red", label: t("common.sentiment.negative") },
  };

  useEffect(() => {
    dispatch(myReportRequest());

    return () => { dispatch(resetReportState()); }
  }, [dispatch]);

  useEffect(() => {
   if (error) { message.error(error); dispatch(resetReportState()); }
  }, [error]);

  const columns = [
    {
      title: t("report.my.table.period"),
      dataIndex: "periodTitle",
      key: "period",
    },
    {
      title: t("report.my.table.grade"),
      dataIndex: "grade",
      key: "grade",
      width: 70,
      align: "center",
      render: (g) => (
        <span style={{ fontWeight: 700, fontSize: 18, color: GRADE_COLOR[g] }}>{g}</span>
      ),
    },
    {
      title: t("report.my.table.score"),
      dataIndex: "overallScore",
      key: "score",
      width: 100,
      align: "center",
      render: (s) => s?.toFixed(2),
    },
    {
      title: t("report.my.table.sentiment"),
      dataIndex: "sentimentLabel",
      key: "sentiment",
      width: 80,
      render: (s) => {
        const st = SENTIMENT[s];
        return st ? <Tag color={st.color}>{st.label}</Tag> : "—";
      },
    },
    {
      title: t("report.my.table.date"),
      dataIndex: "generatedAt",
      key: "date",
      width: 160,
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, r) => (
        <Link href={{ pathname: "/eval/report/detail", query: { reportId: r.reportId } }}>
          <Button type="text" size="small" icon={<EyeOutlined />} />
        </Link>
      ),
    },
  ];

  //////
  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("common.breadcrumbRoot")} &gt; {t("report.my.breadcrumbCurrent")}</div>
          <h1>{t("report.my.title")}</h1>
          <p>{t("report.my.subtitle")}</p>
        </div>
      </div>

      <Card>
        <Table
          rowKey="reportId"
          columns={columns}
          dataSource={myReports}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t("report.my.emptyMsg") }}
        />
      </Card>
    </div>
  );
}
