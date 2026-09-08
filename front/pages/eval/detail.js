// pages/eval/detail.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Descriptions, Tag, Button, message } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { 
  detailEvalRequest, clearEvalDetail, resetEvalState, 
} from "../../reducers/eval/evalReducer";

export default function EvalDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { evalId } = router.query;

  const STATUS_TAG = {
    DRAFT: { color: "default", label: t("common.evalStatus.draft") },
    SUBMITTED: { color: "green", label: t("common.evalStatus.submitted") },
  };
  const SCORE_LABELS = {
    scorePerformance: t("common.scoreLabel.performance"),
    scoreExpertise: t("common.scoreLabel.expertise"),
    scoreTeamwork: t("common.scoreLabel.teamwork"),
    scoreAttitude: t("common.scoreLabel.attitude"),
    scoreGrowth: t("common.scoreLabel.growth"),
  };

  const { currentEval, loading, error } = useSelector((state) => state.eval);

  useEffect(() => {
    if (!evalId) return;
    dispatch(detailEvalRequest(Number(evalId)));

    return () => { dispatch(clearEvalDetail()); }
  }, [dispatch, evalId]);

  useEffect(() => {
    if (error) { message.error(error); dispatch(resetEvalState()); }
  }, [error]);

  const e = currentEval;
  const st = STATUS_TAG[e?.evalStatus] || { color: "default", label: e?.evalStatus };

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
          <div className="sb-breadcrumb">{t("common.breadcrumbRoot")} &gt; {t("detail.breadcrumbCurrent")}</div>
          <h1>{t("detail.title")}</h1>
          {e && <p>{t("detail.targetLabel", { name: e.targetEmpName })}</p>}
        </div>
        <div
          className="sb-page-head__actions"
          style={{ display: "flex", gap: 8 }}
        >
          <Link
            href={{
              pathname: "/eval/dashboard",
              query: { periodId: e?.periodId },
            }}
          >
            <Button icon={<ArrowLeftOutlined />}>{t("detail.backToListBtn")}</Button>
          </Link>
          {e?.evalStatus === "DRAFT" && (
            <Link
              href={{
                pathname: "/eval/write",
                query: { evalId: e.evalId, periodId: e.periodId },
              }}
            >
              <Button type="primary" icon={<EditOutlined />}>
                {t("common:button.edit")}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card loading={loading && !e}>
        {e && (
          <>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2 }}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label={t("detail.descTargetLabel")}>
                {e.targetEmpName} ({e.targetDeptName} · {e.targetPosName})
              </Descriptions.Item>
              <Descriptions.Item label={t("detail.statusLabel")}>
                <Tag color={st.color}>{st.label}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t("detail.typeLabel")}>
                {e.evalType}
              </Descriptions.Item>
              <Descriptions.Item label={t("detail.weightedScoreLabel")}>
                {e.weightedScore?.toFixed(2) || "—"}
              </Descriptions.Item>
            </Descriptions>

            {/* 점수 항목 */}
            <Card type="inner" title={t("detail.scoreCardTitle")} style={{ marginBottom: 16 }}>
              <Descriptions column={{ xs: 1, sm: 2, lg: 3 }}>
                {Object.entries(SCORE_LABELS).map(([key, label]) => (
                  <Descriptions.Item key={key} label={label}>
                    <span style={{ fontSize: 18, fontWeight: 600 }}>
                      {e[key] ?? "—"}
                    </span>
                    <span style={{ color: "#999" }}> / 5</span>
                  </Descriptions.Item>
                ))}
              </Descriptions>
            </Card>

            {/* 코멘트 */}
            <Card type="inner" title={t("detail.commentCardTitle")}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>
                  {t("detail.strengthLabel")}
                </div>
                <div style={{ whiteSpace: "pre-line" }}>
                  {e.strengthComment || "—"}
                </div>
              </div>
              <div>
                <div style={{ color: "#999", fontSize: 12, marginBottom: 4 }}>
                  {t("detail.improvementLabel")}
                </div>
                <div style={{ whiteSpace: "pre-line" }}>
                  {e.improvementComment || "—"}
                </div>
              </div>
            </Card>
          </>
        )}
      </Card>
    </div>
  );
}
