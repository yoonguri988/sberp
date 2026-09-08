// pages/apct/detail.js
// 지원자 상세 (ROLE_ADMIN) - GET /api/admin/applicant/{apctId} + 이력서 GET /api/resume/applicants/{apctId}?recId=
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
  Button,
  Descriptions,
  Tag,
  Select,
  Skeleton,
  Empty,
  message,
} from "antd";
import { ArrowLeftOutlined, FilePdfOutlined,EditOutlined, } from "@ant-design/icons";
import moment from "moment";

import {
  fetchApplicantDetailRequest,
  updateApplicantStatusRequest,
  resetApplicantState,
} from "../../reducers/apct/applicantReducer";
import { fetchAdminResumeRequest } from "../../reducers/rsm/resumeReducer";

const API_ORIGIN = "http://localhost:8080";
export default function ApplicantDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("apct");
  const { apctId } = router.query;

  const { detail, detailLoading, detailError, statusLoading, statusSuccess, statusError } =
    useSelector((state) => state.applicant);
  const { adminResume, adminResumeLoading } = useSelector((state) => state.resume);

  // apct/dashboard.js 차트 색상과 맞춰 SCREENING(파랑)·INTERVIEW(주황) 조합을 사용한다 —
  // 원래 INTERVIEW를 보라로 뒀더니 색각이상 시뮬레이션에서 파랑과 잘 구분되지 않아 교체함.
  const STATUS_LABEL = {
    RECEIVED: { text: t("common.statusLabels.received"), color: "default" },
    SCREENING: { text: t("common.statusLabels.screening"), color: "blue" },
    INTERVIEW: { text: t("common.statusLabels.interview"), color: "orange" },
    HIRED: { text: t("common.statusLabels.hired"), color: "green" },
    REJECTED: { text: t("common.statusLabels.rejected"), color: "red" },
  };
  const STATUS_OPTIONS = Object.entries(STATUS_LABEL).map(([value, { text }]) => ({
    value,
    label: text,
  }));

  useEffect(() => {
    if (!router.isReady || !apctId) return;
    dispatch(fetchApplicantDetailRequest(Number(apctId)));
  }, [router.isReady, apctId, dispatch]);

  useEffect(() => {
    if (!detail?.recId || !apctId) return;
    dispatch(fetchAdminResumeRequest({ apctId: Number(apctId), recId: detail.recId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.recId, apctId]);

  useEffect(() => {
    if (statusLoading) return;
    if (statusSuccess) {
      message.success(t("detail.messages.statusChangeSuccess"));
      dispatch(resetApplicantState());
    } else if (statusError) {
      message.error(statusError);
      dispatch(resetApplicantState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusLoading, statusSuccess, statusError]);

  const handleStatusChange = (newStatus) => {
    dispatch(updateApplicantStatusRequest({ apctId: Number(apctId), newStatus }));
  };

  return (
      <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("detail.breadcrumbHome")}</Link> <i className="bi bi-chevron-right"></i> {t("detail.breadcrumbRoot")}{" "}
            <i className="bi bi-chevron-right"></i>{" "}
            <Link href="/apct/list">{t("detail.breadcrumbList")}</Link>{" "}
            <i className="bi bi-chevron-right"></i> {t("detail.breadcrumbCurrent")}
          </div>
          <h1>{t("detail.title")}</h1>
          <p>{t("detail.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/apct/list">
            <Button size="small" icon={<ArrowLeftOutlined />}>{t("detail.backToListBtn")}</Button>
          </Link>
          <Link href="/apct/list">
            <Button size="small" className="btn-sb" icon={<EditOutlined />}>{t("detail.editFromListBtn")}</Button>
          </Link>
        </div>
      </div>
      {detailLoading && (
        <div className="sb-card">
          <div className="sb-card__body">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      )}

      {!detailLoading && detailError && (
        <div className="sb-card">
          <div className="sb-card__body">
            <Empty description={detailError} />
          </div>
        </div>
      )}

      {!detailLoading && detail && (
        <>
          <div className="sb-card mb-3">
            <div className="sb-card__head">
              <h2>
                {detail.apctName}{" "}
                <Tag color={(STATUS_LABEL[detail.apctStatus] || {}).color}>
                  {(STATUS_LABEL[detail.apctStatus] || {}).text || detail.apctStatus}
                </Tag>
              </h2>
              <div className="right">
                <Select
                  style={{ width: 140 }}
                  value={detail.apctStatus}
                  options={STATUS_OPTIONS}
                  loading={statusLoading}
                  onChange={handleStatusChange}
                />
              </div>
            </div>
            <div className="sb-card__body">
              <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label={t("detail.labels.recTitle")}>{detail.recTitle || "-"}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.email")}>{detail.apctEmail}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.phone")}>{detail.apctPhone}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.appliedAt")}>
                  {detail.apctDate ? moment(detail.apctDate).format("YYYY-MM-DD HH:mm") : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.createdAt")}>
                  {detail.createdAt ? moment(detail.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.updatedAt")}>
                  {detail.updatedAt ? moment(detail.updatedAt).format("YYYY-MM-DD HH:mm") : "-"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          <div className="sb-card">
            <div className="sb-card__head">
              <h2>{t("detail.resumeCardTitle")}</h2>
            </div>
            <div className="sb-card__body">
              {adminResumeLoading && <Skeleton active paragraph={{ rows: 3 }} />}
              {!adminResumeLoading && !adminResume && (
                <Empty description={t("detail.resumeEmpty")} />
              )}
              {!adminResumeLoading && adminResume && (
                <Descriptions bordered column={2} size="middle">
                  <Descriptions.Item label={t("detail.resumeLabels.fileName")} span={2}>
                    {adminResume.rsmFileUrl ? (
                      <a href={`${API_ORIGIN}${adminResume.rsmFileUrl}`} target="_blank" rel="noreferrer">
                        <FilePdfOutlined /> {adminResume.rsmFileName}
                      </a>
                    ) : (
                      adminResume.rsmFileName || "-"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("detail.resumeLabels.analysisStatus")}>
                    <Tag
                      color={
                        adminResume.rsmStatus === "COMPLETED"
                          ? "green"
                          : adminResume.rsmStatus === "FAILED"
                          ? "red"
                          : "orange"
                      }
                    >
                      {adminResume.rsmStatus}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t("detail.resumeLabels.fitScore")}>
                    {adminResume.rsmFitScore ?? "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("detail.resumeLabels.uploadedAt")}>
                    {adminResume.rsmUploadedAt
                      ? moment(adminResume.rsmUploadedAt).format("YYYY-MM-DD HH:mm")
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("detail.resumeLabels.analyzedAt")}>
                    {adminResume.rsmAnalyzedAt
                      ? moment(adminResume.rsmAnalyzedAt).format("YYYY-MM-DD HH:mm")
                      : "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("detail.resumeLabels.aiSummary")} span={2}>
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {adminResume.rsmAiSummary || "-"}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
