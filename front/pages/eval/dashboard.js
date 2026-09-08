// pages/eval/dashboard.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Row, Col, Table, Tag, Button, Progress, message } from "antd";
import { CalendarOutlined, EditOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { 
  dashboardEvalRequest, clearEvalDetail, resetEvalState, 
} from "../../reducers/eval/evalReducer";

export default function EvalDashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { periodId } = router.query;

  const STATUS_TAG = {
    DRAFT: { color: "default", label: t("common.evalStatus.draft") },
    SUBMITTED: { color: "green", label: t("common.evalStatus.submitted") },
  };

 const {
    openPeriods, currentPeriod, targets,
    submittedCount, totalCount, loading, error,
  } = useSelector((state) => state.eval);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    dispatch(dashboardEvalRequest(periodId ? Number(periodId) : null));
    return () => dispatch(clearEvalDetail());
  }, [dispatch, periodId]);

  useEffect(() => {
    if (error) { message.error(error); dispatch(resetEvalState()); }
  }, [error]);  

  // 평가 대상 테이블 컬럼
  const columns = [
    {
      title: t("dashboard.table.emp"),
      key: "emp",
      render: (_, r) => (
        <span style={{ fontWeight: 600 }}>{r.targetEmpName}</span>
      ),
    },
    { title: t("dashboard.table.dept"), dataIndex: "targetDeptName", key: "dept" },
    { title: t("dashboard.table.pos"), dataIndex: "targetPosName", key: "pos" },
    {
      title: t("dashboard.table.status"),
      dataIndex: "evalStatus",
      key: "status",
      width: 100,
      render: (s) => {
        const st = STATUS_TAG[s] || { color: "default", label: s || t("common.evalStatus.draft") };
        return <Tag color={st.color}>{st.label}</Tag>;
      },
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, r) => (
        <Link
          href={{
            pathname: r.evalId ? "/eval/detail" : "/eval/write",
            query: r.evalId
              ? { evalId: r.evalId }
              : { periodId, targetEmpId: r.targetEmpId },
          }}
        >
          <Button type="link" size="small" icon={<EditOutlined />}>
            {r.evalId ? t("dashboard.viewBtn") : t("dashboard.writeBtn")}
          </Button>
        </Link>
      ),
    },
  ];

  //////
  return (
    <div className="sb-page">
      {/* 페이지 헤더 */}
      <div
        className="sb-page-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("common.breadcrumbRoot")} &gt; {t("dashboard.breadcrumbCurrent")}</div>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>
        <div
          className="sb-page-head__actions"
          style={{ display: "flex", gap: 8 }}
        >
          {currentPeriod && (
            <Button onClick={() => {
              dispatch(clearEvalDetail());
              router.push("/eval/dashboard");
            }}>
              {t("dashboard.periodChangeBtn")}
            </Button>
          )}
          {isAdmin && (
            <Link href="/eval/period/list">
              <Button icon={<CalendarOutlined />}>{t("dashboard.periodManageBtn")}</Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── 회차 미선택: OPEN 회차 카드 ── */}
      {!currentPeriod && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24, color: "#1890ff" }}>ℹ️</span>
              <div>
                <div style={{ fontWeight: 650 }}>{t("dashboard.selectPeriodTitle")}</div>
                <div style={{ color: "#999", fontSize: 13 }}>
                  {t("dashboard.selectPeriodHint")}
                </div>
              </div>
            </div>
          </Card>

          {openPeriods.length === 0 ? (
            <Card>
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#999",
                }}
              >
                <CalendarOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p>{t("dashboard.noOpenPeriodMsg")}</p>
              </div>
            </Card>
          ) : (
            <Row gutter={16}>
              {openPeriods.map((p) => (
                <Col xs={24} sm={12} lg={8} key={p.periodId}>
                  <Card
                    hoverable
                    onClick={() =>
                      router.push({
                        pathname: "/eval/dashboard",
                        query: { periodId: p.periodId },
                      })
                    }
                    style={{ marginBottom: 16 }}
                  >
                    <Tag color="green" style={{ marginBottom: 8 }}>
                      OPEN
                    </Tag>
                    <h3 style={{ margin: "4px 0" }}>{p.title}</h3>
                    <div style={{ color: "#999", fontSize: 13 }}>
                      {t("dashboard.periodMetaFormat", { year: p.evalYear, term: p.evalTerm, start: p.startDate, end: p.endDate })}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}

      {/* ── 회차 선택됨: 평가 대상 목록 ── */}
      {currentPeriod && (
        <>
          {/* 회차 정보 + 진행률 */}
          <Card style={{ marginBottom: 16 }}>
            <Row align="middle" gutter={24}>
              <Col flex="auto">
                <Tag color="green">OPEN</Tag>
                <span
                  style={{ fontSize: 16, fontWeight: 650, marginLeft: 8 }}
                >
                  {currentPeriod.title}
                </span>
                <div style={{ color: "#999", fontSize: 13, marginTop: 4 }}>
                  {t("dashboard.periodMetaFormat", { year: currentPeriod.evalYear, term: currentPeriod.evalTerm, start: currentPeriod.startDate, end: currentPeriod.endDate })}
                </div>
              </Col>
              <Col>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#999", fontSize: 12 }}>{t("dashboard.submitProgressLabel")}</div>
                  <Progress
                    type="circle"
                    size={64}
                    percent={
                      totalCount > 0
                        ? Math.round((submittedCount / totalCount) * 100)
                        : 0
                    }
                    format={() => `${submittedCount}/${totalCount}`}
                  />
                </div>
              </Col>
            </Row>
          </Card>

          {/* 대상 테이블 */}
          <Card>
            <Table
              rowKey="targetEmpId"
              columns={columns}
              dataSource={targets}
              loading={loading}
              pagination={false}
              locale={{ emptyText: t("dashboard.noTargetMsg") }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
