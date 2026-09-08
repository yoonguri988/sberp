// pages/eval/period/list.js
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Row, Col, Table, Tag, Button, Statistic, message } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  listPeriodRequest,
  resetPeriodState,
} from "../../../reducers/eval/evalPeriodReducer";

export default function EvalPeriodListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);

  const STATUS_CONFIG = {
    READY: { color: "orange", label: t("common.periodStatus.ready") },
    OPEN: { color: "green", label: t("common.periodStatus.open") },
    CLOSED: { color: "blue", label: t("common.periodStatus.closed") },
    REPORTING: { color: "purple", label: t("common.periodStatus.reporting") },
    REPORTED: { color: "cyan", label: t("common.periodStatus.reported") },
    REPORTING_FAILED: { color: "red", label: t("common.periodStatus.reportingFailed") },
  };

  const { periodList, stats, loading, success, error } = useSelector(
    (state) => state.period
  );

  useEffect(() => {
    dispatch(listPeriodRequest());

    return () => { dispatch(resetPeriodState()); };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(resetPeriodState());
      dispatch(listPeriodRequest());
    }
    if (error) {
      message.error(error);
      dispatch(resetPeriodState());
    }
  }, [success, error, dispatch]);

  const columns = [
    {
      title: t("period.list.table.status"),
      dataIndex: "periodStatus",
      key: "status",
      width: 100,
      render: (s) => {
        const c = STATUS_CONFIG[s] || { color: "default", label: s };
        return <Tag color={c.color}>{c.label}</Tag>;
      },
    },
    {
      title: t("period.list.table.title"),
      dataIndex: "title",
      key: "title",
      render: (title, r) => (
        <Link
          href={{
            pathname: "/eval/period/detail",
            query: { periodId: r.periodId },
          }}
        >
          <a style={{ fontWeight: 600 }}>{title}</a>
        </Link>
      ),
    },
    {
      title: t("period.list.table.year"),
      dataIndex: "evalYear",
      key: "year",
      width: 80,
      align: "center",
    },
    { title: t("period.list.table.term"), dataIndex: "evalTerm", key: "term", width: 100 },
    {
      title: t("period.list.table.period"),
      key: "range",
      width: 200,
      render: (_, r) => `${r.startDate} ~ ${r.endDate}`,
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_, r) => (
        <Link
          href={{
            pathname: "/eval/period/detail",
            query: { periodId: r.periodId },
          }}
        >
          <Button type="text" size="small" icon={<EyeOutlined />} />
        </Link>
      ),
    },
  ];

  //////
  return (
    <div className="sb-page">
      <div
        className="sb-page-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("common.breadcrumbRoot")} &gt; {t("period.list.breadcrumbCurrent")}</div>
          <h1>{t("period.list.title")}</h1>
          <p>{t("period.list.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/eval/period/form">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("period.list.addBtn")}
            </Button>
          </Link>
        </div>
      </div>

      {/* 상태별 통계 */}
      {stats && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <Col xs={12} lg={4} key={key}>
              <Card size="small">
                <Statistic
                  title={cfg.label}
                  value={stats[key] || 0}
                  valueStyle={{ color: undefined }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* 목록 */}
      <Card>
        <Table
          rowKey="periodId"
          columns={columns}
          dataSource={periodList}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t("period.list.emptyMsg") }}
        />
      </Card>
    </div>
  );
}
