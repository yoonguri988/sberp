// pages/apct/dashboard.js
// 지원자 대시보드 (ROLE_ADMIN) - GET /api/admin/applicant/dashboard (상태별 집계)
// chart.js(react-chartjs-2)로 도넛(단계별 분포) + 막대(단계별 인원) 차트를 그린다.
// 상단 헤드라인 카드는 이 프로젝트의 기존 대시보드 컴포넌트(.sb-stat / .tone-*, styles/global.css)를
// 그대로 재사용해 다른 대시보드(pages/dashboard/*.html 목업)와 톤을 맞췄다.
import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Card, Row, Col, Button, Empty, Skeleton } from "antd";
import {
  ArrowLeftOutlined,
  TeamOutlined,
  HourglassOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import { fetchApplicantDashboardRequest } from "../../reducers/apct/applicantReducer";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// 데이터가 없는 상태도 0건으로 항상 노출(전형 파이프라인 순서 고정)
const STATUS_ORDER = ["RECEIVED", "SCREENING", "INTERVIEW", "HIRED", "REJECTED"];

export default function ApplicantDashboardPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("apct");
  const { dashboard, dashboardLoading, dashboardError } = useSelector(
    (state) => state.applicant,
  );

  useEffect(() => {
    dispatch(fetchApplicantDashboardRequest());
  }, [dispatch]);

  // 이 프로젝트 디자인 토큰(styles/global.css :root)의 실제 hex를 그대로 사용한다 —
  // antd Tag 프리셋 색상과 시각적으로 거의 같지만, 사이트 전체 대시보드(.tone-*)와는
  // 정확히 같은 색이어야 "같은 시스템"으로 읽힌다.
  // dataviz 팔레트 검증 스크립트(validate_palette.js) 통과 조합 — 기존에 SCREENING(파랑)과
  // INTERVIEW(보라)를 나란히 썼더니 색각이상 시뮬레이션에서 거의 구분이 안 돼(ΔE 12.4, 기준 15
  // 미만) INTERVIEW를 amber로 바꿨다. RECEIVED(회색)·HIRED/REJECTED(초록/빨강) 조합은 "상태
  // 팔레트"로 항상 텍스트 라벨과 함께 쓰이므로 예외로 허용(디자인 스킬 가이드 기준).
  const STATUS_META = {
    RECEIVED: { text: t("common.statusLabels.received"), color: "#8a93a3" },
    SCREENING: { text: t("common.statusLabels.screening"), color: "#2563eb" },
    INTERVIEW: { text: t("common.statusLabels.interview"), color: "#d97706" },
    HIRED: { text: t("common.statusLabels.hired"), color: "#16a34a" },
    REJECTED: { text: t("common.statusLabels.rejected"), color: "#dc2626" },
  };

  const countMap = useMemo(() => {
    const map = {};
    (dashboard || []).forEach((row) => {
      map[row.apctStatus] = row.count;
    });
    return map;
  }, [dashboard]);

  const total = STATUS_ORDER.reduce((sum, key) => sum + (countMap[key] || 0), 0);
  const hiredCnt = countMap.HIRED || 0;
  const inProgressCnt =
    (countMap.RECEIVED || 0) + (countMap.SCREENING || 0) + (countMap.INTERVIEW || 0);
  const hireRate = total > 0 ? Math.round((hiredCnt / total) * 1000) / 10 : 0;

  const labels = STATUS_ORDER.map((k) => STATUS_META[k].text);
  const colors = STATUS_ORDER.map((k) => STATUS_META[k].color);
  const values = STATUS_ORDER.map((k) => countMap[k] || 0);

  const doughnutData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };
  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { boxWidth: 10, padding: 16, font: { size: 12.5 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.raw || 0;
            const pct = total > 0 ? Math.round((v / total) * 1000) / 10 : 0;
            return t("dashboard.doughnutTooltip", { label: ctx.label, count: v, pct });
          },
        },
      },
    },
  };

  const barData = {
    labels,
    datasets: [
      {
        label: t("dashboard.barDatasetLabel"),
        data: values,
        backgroundColor: colors,
        borderRadius: 4,
        maxBarThickness: 46,
      },
    ],
  };
  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => t("dashboard.barTooltip", { count: ctx.raw }) } },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: "#f0f0f0" },
      },
    },
  };

  return (
    <div className="sb-page">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <Link href="/apct/list">
            <Button type="text" className="sb-page-back" icon={<ArrowLeftOutlined />}>
              {t("dashboard.backBtn")}
            </Button>
          </Link>
          <div className="sb-breadcrumb">{t("dashboard.breadcrumb")}</div>
          <h1>{t("dashboard.title")}</h1>
          <p>{t("dashboard.subtitle")}</p>
        </div>
      </div>

      {dashboardLoading && (
        <Card>
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      )}

      {!dashboardLoading && dashboardError && (
        <Card>
          <Empty description={dashboardError} />
        </Card>
      )}

      {!dashboardLoading && !dashboardError && (
        <>
          {/* 헤드라인 숫자 3개 - 기존 사내 대시보드(pages/dashboard/*.html)와 동일한
              .sb-stat / .tone-* 컴포넌트를 그대로 사용 */}
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <div className="sb-stat">
                <div className="sb-stat__top">
                  <span className="sb-stat__ico tone-violet">
                    <TeamOutlined />
                  </span>
                  <span className="sb-stat__label">{t("dashboard.stats.total")}</span>
                </div>
                <div className="sb-stat__val">
                  {total}
                  <span style={{ fontSize: 14, fontWeight: 650 }}>{t("dashboard.unitPerson")}</span>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="sb-stat">
                <div className="sb-stat__top">
                  <span className="sb-stat__ico tone-blue">
                    <HourglassOutlined />
                  </span>
                  <span className="sb-stat__label">{t("dashboard.stats.inProgress")}</span>
                </div>
                <div className="sb-stat__val">
                  {inProgressCnt}
                  <span style={{ fontSize: 14, fontWeight: 650 }}>{t("dashboard.unitPerson")}</span>
                </div>
                <span className="sb-stat__delta flat">
                  {t("dashboard.inProgressDetail", {
                    received: countMap.RECEIVED || 0,
                    screening: countMap.SCREENING || 0,
                    interview: countMap.INTERVIEW || 0,
                  })}
                </span>
              </div>
            </Col>
            <Col span={8}>
              <div className="sb-stat">
                <div className="sb-stat__top">
                  <span className="sb-stat__ico tone-green">
                    <TrophyOutlined />
                  </span>
                  <span className="sb-stat__label">{t("dashboard.stats.hireRate")}</span>
                </div>
                <div className="sb-stat__val">
                  {hireRate}
                  <span style={{ fontSize: 14, fontWeight: 650 }}>%</span>
                </div>
                <span className="sb-stat__delta flat">
                  {t("dashboard.hireRateDetail", { hired: hiredCnt, total })}
                </span>
              </div>
            </Col>
          </Row>

          {total === 0 ? (
            <Card>
              <Empty description={t("dashboard.emptyData")} />
            </Card>
          ) : (
            <Row gutter={16}>
              <Col span={10}>
                <Card title={t("dashboard.charts.distribution")} bodyStyle={{ height: 300 }}>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </Card>
              </Col>
              <Col span={14}>
                <Card title={t("dashboard.charts.byStatus")} bodyStyle={{ height: 300 }}>
                  <Bar data={barData} options={barOptions} />
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </div>
  );
}
