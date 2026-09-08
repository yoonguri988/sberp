// pages/eval/report/detail.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Descriptions, Tag, Button, Row, Col, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { detailReportRequest, clearReportDetail, resetReportState, } from "../../../reducers/eval/evalReportReducer";

const GRADE_COLOR = { S: "#eb2f96", A: "#52c41a", B: "#1890ff", C: "#fa8c16", D: "#ff4d4f" };

export default function EvalReportDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { reportId } = router.query;

  const SENTIMENT = {
    POSITIVE: { color: "green", label: t("common.sentiment.positive") },
    NEUTRAL: { color: "default", label: t("common.sentiment.neutral") },
    NEGATIVE: { color: "red", label: t("common.sentiment.negative") },
  };

  const { currentReport, loading, error } = useSelector((state) => state.report);

  useEffect(() => {
    if (!reportId) return;
    dispatch(detailReportRequest(Number(reportId)));

    return () => { dispatch(clearReportDetail()); };
  }, [dispatch, reportId]);

  useEffect(() => {
    if (error) { message.error(error); dispatch(resetReportState()); }
  }, [error]);

  const r = currentReport;
  const sent = SENTIMENT[r?.sentimentLabel];

  //////
  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("common.breadcrumbRoot")} &gt; {t("report.list.breadcrumbCurrent")} &gt; {t("report.detail.breadcrumbCurrent")}</div>
          <h1>{t("report.detail.title")}</h1>
          {r && <p>{r.empName} — {r.periodTitle}</p>}
        </div>
        <div className="sb-page-head__actions">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.back()}>
            {t("report.detail.backBtn")}
          </Button>
        </div>
      </div>

      <Card loading={loading && !r}>
        {r && (
          <>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={6} style={{ textAlign: "center" }}>
                <div style={{ color: "#999", marginBottom: 8 }}>{t("report.detail.overallGradeLabel")}</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: GRADE_COLOR[r.grade] }}>
                  {r.grade}
                </div>
              </Col>
              <Col span={6} style={{ textAlign: "center" }}>
                <div style={{ color: "#999", marginBottom: 8 }}>{t("report.detail.overallScoreLabel")}</div>
                <div style={{ fontSize: 28, fontWeight: 600 }}>
                  {r.overallScore?.toFixed(2)}
                </div>
              </Col>
              <Col span={6} style={{ textAlign: "center" }}>
                <div style={{ color: "#999", marginBottom: 8 }}>{t("report.detail.sentimentLabel")}</div>
                {sent ? (
                  <Tag color={sent.color} style={{ fontSize: 14, padding: "4px 12px" }}>
                    {sent.label}
                  </Tag>
                ) : (
                  <span style={{ color: "#999" }}>—</span>
                )}
              </Col>
              <Col span={6} style={{ textAlign: "center" }}>
                <div style={{ color: "#999", marginBottom: 8 }}>{t("report.detail.modelLabel")}</div>
                <Tag>{r.modelName || "—"}</Tag>
              </Col>
            </Row>

            <Descriptions bordered column={{ xs: 1, sm: 2 }} style={{ marginBottom: 24 }}>
              <Descriptions.Item label={t("report.detail.empLabel")}>{r.empName}</Descriptions.Item>
              <Descriptions.Item label={t("report.detail.deptPosLabel")}>{r.deptName} · {r.posName}</Descriptions.Item>
              <Descriptions.Item label={t("report.detail.periodLabel")}>{r.periodTitle}</Descriptions.Item>
              <Descriptions.Item label={t("report.detail.generatedAtLabel")}>{r.generatedAt}</Descriptions.Item>
            </Descriptions>

            {/* ★ 근태 현황 카드 */}
            {(r.attWorkDays > 0 || r.attLateCount > 0 || r.attAbsentCount > 0) && (
              <Card type="inner" title={t("report.detail.attTitle")} style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]}>
                  <Col span={4} style={{ textAlign: "center" }}>
                    <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>{t("report.detail.attWorkDays")}</div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{r.attWorkDays ?? 0}<span style={{ fontSize: 13, color: "#999" }}>{t("report.detail.attDayUnit")}</span></div>
                  </Col>
                  <Col span={4} style={{ textAlign: "center" }}>
                    <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>{t("report.detail.attLate")}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: r.attLateCount > 0 ? "#fa8c16" : undefined }}>
                      {r.attLateCount ?? 0}<span style={{ fontSize: 13, color: "#999" }}>{t("report.detail.attCountUnit")}</span>
                    </div>
                  </Col>
                  <Col span={4} style={{ textAlign: "center" }}>
                    <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>{t("report.detail.attEarlyLeave")}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: r.attEarlyLeaveCount > 0 ? "#fa8c16" : undefined }}>
                      {r.attEarlyLeaveCount ?? 0}<span style={{ fontSize: 13, color: "#999" }}>{t("report.detail.attCountUnit")}</span>
                    </div>
                  </Col>
                  <Col span={4} style={{ textAlign: "center" }}>
                    <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>{t("report.detail.attAbsent")}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: r.attAbsentCount > 0 ? "#ff4d4f" : undefined }}>
                      {r.attAbsentCount ?? 0}<span style={{ fontSize: 13, color: "#999" }}>{t("report.detail.attCountUnit")}</span>
                    </div>
                  </Col>
                  <Col span={4} style={{ textAlign: "center" }}>
                    <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>{t("report.detail.attAnnual")}</div>
                    <div style={{ fontSize: 22, fontWeight: 600 }}>{r.attAnnualUsed ?? 0}<span style={{ fontSize: 13, color: "#999" }}>{t("report.detail.attDayUnit")}</span></div>
                  </Col>
                  <Col span={4} style={{ textAlign: "center" }}>
                    <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>{t("report.detail.attRate")}</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: r.attRate >= 95 ? "#52c41a" : r.attRate >= 80 ? "#fa8c16" : "#ff4d4f" }}>
                      {r.attRate?.toFixed(1) ?? "0.0"}<span style={{ fontSize: 13, color: "#999" }}>%</span>
                    </div>
                  </Col>
                </Row>
              </Card>
            )}

            <Card type="inner" title={t("report.detail.aiSummaryTitle")} style={{ marginBottom: 16 }}>
              <div style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                {r.aiSummary || t("report.detail.summaryEmptyMsg")}
              </div>
            </Card>

            {r.aiStrength && (
              <Card type="inner" title={t("report.detail.strengthAnalysisTitle")} style={{ marginBottom: 16 }}>
                <div style={{ whiteSpace: "pre-line" }}>{r.aiStrength}</div>
              </Card>
            )}

            {r.aiImprovement && (
              <Card type="inner" title={t("report.detail.improvementTitle")}>
                <div style={{ whiteSpace: "pre-line" }}>{r.aiImprovement}</div>
              </Card>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
