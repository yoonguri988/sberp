// pages/sal/analytics.js
// 급여 분석 대시보드 (ROLE_ADMIN/ROOT 전용)
// - 데이터는 Spring이 아니라 별도 Django 분석 서비스(GET /api/analytics/salary/summary)에서 온다.
//   (자세한 배경은 프로젝트 문서 claude/analytics-dashboard-design.md 참고)
// - 자원·예약 쪽 노쇼 위험도는 아직 데이터가 충분히 쌓이지 않아 이번 1차 구현 범위에서 제외했고,
//   담당 도메인 중 데이터가 가장 최근에 채워진 급여(sal)부터 먼저 붙였다.
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Select, Spin, Empty, Button, Tag } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import Link from "next/link";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

import { fetchSalAnalyticsRequest } from "../../reducers/sal/salAnalyticsReducer";
import { formatWon } from "../../utils/currency";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const STATUS_COLOR = {
  PENDING: "#d97706",
  APPROVED: "#2563eb",
  PAID: "#16a34a",
  REJECTED: "#dc2626",
};

const ITEM_COLORS = [
  "#2563eb", "#16a34a", "#d97706", "#dc2626", "#7c3aed",
  "#0891b2", "#db2777", "#65a30d", "#ea580c", "#4f46e5",
];

export default function SalAnalyticsPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(
    user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ROOT"),
  );

  const [months, setMonths] = useState(6);

  const {
    latestMonth,
    deptAverage,
    monthlyTrend,
    itemBreakdown,
    statusDistribution,
    loading,
    error,
  } = useSelector((state) => state.salAnalytics);

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchSalAnalyticsRequest({ months }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, months]);

  // ── 부서별 평균급여 (기본급 / 실지급액 그룹 막대) ──
  const deptChartData = useMemo(
    () => ({
      labels: deptAverage.map((d) => d.deptName),
      datasets: [
        {
          label: t("analytics.cards.deptAverage.baseSalLegend"),
          data: deptAverage.map((d) => d.avgBaseSal),
          backgroundColor: "#93c5fd",
        },
        {
          label: t("analytics.cards.deptAverage.netPayLegend"),
          data: deptAverage.map((d) => d.avgNetPay),
          backgroundColor: "#2563eb",
        },
      ],
    }),
    [deptAverage, t],
  );

  // ── 월별 지급 총액 추이 ──
  const trendChartData = useMemo(
    () => ({
      labels: monthlyTrend.map((m) => m.payMonth?.slice(0, 7)),
      datasets: [
        {
          label: t("analytics.cards.monthlyTrend.legend"),
          data: monthlyTrend.map((m) => m.totalNetPay),
          backgroundColor: "#16a34a",
        },
      ],
    }),
    [monthlyTrend, t],
  );

  // ── 항목 구성비 도넛 ──
  const itemChartData = useMemo(
    () => ({
      labels: itemBreakdown.map((i) => i.itemLabel),
      datasets: [
        {
          data: itemBreakdown.map((i) => i.totalAmt),
          backgroundColor: itemBreakdown.map((_, idx) => ITEM_COLORS[idx % ITEM_COLORS.length]),
        },
      ],
    }),
    [itemBreakdown],
  );

  const wonTooltip = {
    plugins: {
      legend: { position: "bottom" },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.dataset.label || ctx.label}: ${formatWon(ctx.raw)}` } },
    },
  };

  if (!isAdmin) {
    return (
      <div className="sb-page">
        <div className="sb-page-head" style={{ marginBottom: 16 }}>
          <div className="sb-page-head__txt">
            <div className="sb-breadcrumb">{t("analytics.breadcrumb")}</div>
            <h1>{t("analytics.title")}</h1>
          </div>
        </div>
        <div className="sb-card">
          <div className="sb-empty">
            <ExclamationCircleOutlined style={{ fontSize: 34, opacity: 0.5 }} />
            <p>{t("analytics.accessDenied")}</p>
            <Link href="/">
              <Button className="mt-2">{t("common:backToHome", { defaultValue: "홈으로" })}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-page">
      <div
        className="sb-page-head"
        style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("analytics.breadcrumb")}</div>
          <h1>{t("analytics.title")}</h1>
          <p>{t("analytics.subtitle")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {latestMonth && (
            <Tag color="blue">
              {t("analytics.latestMonthLabel")}: {latestMonth.slice(0, 7)}
            </Tag>
          )}
          <Select
            value={months}
            onChange={setMonths}
            style={{ width: 140 }}
            options={[3, 6, 12].map((m) => ({
              value: m,
              label: `${m}${t("analytics.monthsSuffix")}`,
            }))}
          />
        </div>
      </div>

      <Spin spinning={loading}>
        {error && (
          <div className="sb-card" style={{ marginBottom: 16 }}>
            <Empty description={t("analytics.loadError")} />
          </div>
        )}

        {!error && !loading && deptAverage.length === 0 && monthlyTrend.length === 0 ? (
          <div className="sb-card">
            <Empty description={t("analytics.emptyData")} />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                title={t("analytics.cards.deptAverage.title")}
                extra={<span style={{ color: "#888", fontSize: 12 }}>{t("analytics.cards.deptAverage.subtitle")}</span>}
              >
                {deptAverage.length ? (
                  <Bar data={deptChartData} options={wonTooltip} />
                ) : (
                  <Empty description={t("analytics.emptyData")} />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={t("analytics.cards.monthlyTrend.title")}
                extra={
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {t("analytics.cards.monthlyTrend.subtitle", { months })}
                  </span>
                }
              >
                {monthlyTrend.length ? (
                  <Bar data={trendChartData} options={wonTooltip} />
                ) : (
                  <Empty description={t("analytics.emptyData")} />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={t("analytics.cards.itemBreakdown.title")}
                extra={<span style={{ color: "#888", fontSize: 12 }}>{t("analytics.cards.itemBreakdown.subtitle")}</span>}
              >
                {itemBreakdown.length ? (
                  <div style={{ maxWidth: 340, margin: "0 auto" }}>
                    <Doughnut data={itemChartData} options={wonTooltip} />
                  </div>
                ) : (
                  <Empty description={t("analytics.emptyData")} />
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title={t("analytics.cards.statusDistribution.title")}
                extra={<span style={{ color: "#888", fontSize: 12 }}>{t("analytics.cards.statusDistribution.subtitle")}</span>}
              >
                {statusDistribution.length ? (
                  <Row gutter={[12, 12]}>
                    {statusDistribution.map((s) => (
                      <Col xs={12} key={s.status}>
                        <div
                          style={{
                            border: `1px solid ${STATUS_COLOR[s.status] || "#ccc"}33`,
                            borderRadius: 8,
                            padding: "12px 16px",
                            textAlign: "center",
                          }}
                        >
                          <Tag color={STATUS_COLOR[s.status] || "default"}>
                            {t(`analytics.status.${s.status}`, { defaultValue: s.statusLabel })}
                          </Tag>
                          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 6 }}>
                            {s.count}
                            <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>
                              {t("analytics.cards.statusDistribution.unit")}
                            </span>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description={t("analytics.emptyData")} />
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Spin>
    </div>
  );
}
