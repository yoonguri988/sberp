// pages/eval/period/detail.js
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Descriptions, Tag, Button, Progress, Space, Modal, message, } from "antd";
import { ArrowLeftOutlined, EditOutlined, PlayCircleOutlined, StopOutlined, RobotOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  detailPeriodRequest, openPeriodRequest, closePeriodRequest,
  reportPeriodRequest, reportStatusRequest, resetPeriodState,
  clearPeriodDetail,
} from "../../../reducers/eval/evalPeriodReducer";

export default function EvalPeriodDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { periodId } = router.query;
  const pollingRef = useRef(null);

  const STATUS_CONFIG = {
    READY: { color: "orange", label: t("common.periodStatus.ready") },
    OPEN: { color: "green", label: t("common.periodStatus.open") },
    CLOSED: { color: "blue", label: t("common.periodStatus.closed") },
    REPORTING: { color: "purple", label: t("common.periodStatus.reporting") },
    REPORTED: { color: "cyan", label: t("common.periodStatus.reported") },
    REPORTING_FAILED: { color: "red", label: t("common.periodStatus.reportingFailed") },
  };

  const {
    currentPeriod, evalCount, reportCount,
    reportProgress, loading, success, error,
  } = useSelector((state) => state.period);

  // 데이터 로드
  useEffect(() => {
    if (!periodId) return;
    dispatch(detailPeriodRequest(Number(periodId)));

    return () => {
      dispatch(clearPeriodDetail());
      dispatch(resetPeriodState());
      if (pollingRef.current) clearInterval(pollingRef.current);
    };

  }, [dispatch, periodId]);

  // REPORTING 상태이면 폴링 시작
  useEffect(() => {
    if (currentPeriod?.periodStatus === "REPORTING") {
      pollingRef.current = setInterval(() => {
        dispatch(reportStatusRequest(Number(periodId)));
      }, 3000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [currentPeriod?.periodStatus, dispatch, periodId]);

  // 상태 전환 결과
  useEffect(() => {
    if (success) {
      message.success(t("period.detail.statusChangedMsg"));
      dispatch(resetPeriodState());
      dispatch(detailPeriodRequest(Number(periodId)));
    }
    if (error) {
      message.error(error);
      dispatch(resetPeriodState());
    }
  }, [success, error, dispatch, periodId]);

  const handleOpen = () => {
    Modal.confirm({
      title: t("period.detail.openConfirmTitle"),
      content: t("period.detail.openConfirmContent"),
      onOk: () => { dispatch(openPeriodRequest(Number(periodId))); },
    });
  };
  const handleClose = () => {
    Modal.confirm({
      title: t("period.detail.closeConfirmTitle"),
      content: t("period.detail.closeConfirmContent"),
      onOk: () => { dispatch(closePeriodRequest(Number(periodId))); },
    });
  };
  const handleReport = () => {
    Modal.confirm({
      title: t("period.detail.startAiConfirmTitle"),
      content: t("period.detail.startAiConfirmContent"),
      onOk: () => { dispatch(reportPeriodRequest(Number(periodId))); },
    });
  };

  const p = currentPeriod;
  const sc = STATUS_CONFIG[p?.periodStatus] || {};

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
          <div className="sb-breadcrumb">
            {t("common.breadcrumbRoot")} &gt; {t("period.list.breadcrumbCurrent")} &gt; {t("period.detail.breadcrumbCurrent")}
          </div>
          <h1>{p?.title || t("period.detail.namePlaceholder")}</h1>
          {p && (
            <p>
              {t("period.detail.periodMetaFormat", { year: p.evalYear, term: p.evalTerm })}
            </p>
          )}
        </div>
        <div className="sb-page-head__actions">
          <Link href="/eval/period/list">
            <Button icon={<ArrowLeftOutlined />}>{t("period.detail.backToListBtn")}</Button>
          </Link>
        </div>
      </div>

      <Card loading={loading && !p} style={{ marginBottom: 16 }}>
        {p && (
          <Descriptions bordered column={{ xs: 1, sm: 2 }}>
            <Descriptions.Item label={t("period.detail.statusLabel")}>
              <Tag color={sc.color}>{sc.label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("period.detail.periodRangeLabel")}>
              {p.startDate} ~ {p.endDate}
            </Descriptions.Item>
            <Descriptions.Item label={t("period.detail.evalCountLabel")}>
              {t("period.detail.countSuffix", { count: evalCount })}
            </Descriptions.Item>
            <Descriptions.Item label={t("period.detail.reportCountLabel")}>
              {t("period.detail.countSuffix", { count: reportCount })}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>

      {/* REPORTING 진행률 */}
      {p?.periodStatus === "REPORTING" && reportProgress && (
        <Card title={t("period.detail.aiProgressTitle")} style={{ marginBottom: 16 }}>
          <Progress
            percent={
              reportProgress.total > 0
                ? Math.round(
                    (reportProgress.completed / reportProgress.total) * 100
                  )
                : 0
            }
            format={() =>
              `${reportProgress.completed} / ${reportProgress.total}`
            }
          />
        </Card>
      )}

      {/* 상태 전환 버튼 */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {p?.periodStatus === "READY" && (
          <>
            <Link
              href={{
                pathname: "/eval/period/form",
                query: { periodId },
              }}
            >
              <Button icon={<EditOutlined />}>{t("period.detail.editBtn")}</Button>
            </Link>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleOpen}
            >
              {t("period.detail.openBtn")}
            </Button>
          </>
        )}
        {p?.periodStatus === "OPEN" && (
          <Button icon={<StopOutlined />} danger onClick={handleClose}>
            {t("period.detail.closeBtn")}
          </Button>
        )}
        {(p?.periodStatus === "CLOSED" ||
          p?.periodStatus === "REPORTING_FAILED") && (
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={handleReport}
          >
            {t("period.detail.startAiBtn")}
          </Button>
        )}
        {p?.periodStatus === "REPORTED" && (
          <Link
            href={{
              pathname: "/eval/report/list",
              query: { periodId },
            }}
          >
            <Button type="primary">{t("period.detail.viewReportBtn")}</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
