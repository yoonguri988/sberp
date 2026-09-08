// pages/rec/detail.js
// 채용공고 상세 (ROLE_ADMIN) - GET /api/admin/recruit/{recId}
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Descriptions, Tag, Button, Skeleton, Empty, Space } from "antd";
import {
  ArrowLeftOutlined,
  TeamOutlined,
  FileSearchOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  EditOutlined,
} from "@ant-design/icons";
import moment from "moment";

import { fetchRecruitDetailRequest } from "../../reducers/rec/recruitReducer";

export default function RecruitDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("rec");
  const { recId } = router.query;

  const { detail, detailLoading, detailError } = useSelector(
    (state) => state.recruit,
  );

  useEffect(() => {
    if (!router.isReady || !recId) return;
    dispatch(fetchRecruitDetailRequest(Number(recId)));
  }, [router.isReady, recId, dispatch]);

  const STATUS_LABEL = {
    OPEN: { text: t("common.statusLabels.open"), color: "green" },
    CLOSED: { text: t("common.statusLabels.closed"), color: "default" },
    CANCELLED: { text: t("common.statusLabels.cancelled"), color: "red" },
  };

  const statusMeta = detail
    ? STATUS_LABEL[detail.recStatus] || { text: detail.recStatus, color: "default" }
    : null;

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("common.breadcrumbHome")}</Link> <i className="bi bi-chevron-right"></i> {t("common.breadcrumbRoot")}{" "}
            <i className="bi bi-chevron-right"></i>{" "}
            <Link href="/rec/list">{t("detail.breadcrumbList")}</Link>{" "}
            <i className="bi bi-chevron-right"></i> {t("detail.breadcrumbCurrent")}
          </div>
          <h1>{t("detail.title")}</h1>
          <p>{t("detail.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/rec/list">
            <Button size="small" icon={<ArrowLeftOutlined />}>{t("detail.backToListBtn")}</Button>
          </Link>
          <Link href="/rec/list">
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
                {detail.recTitle}{" "}
                {statusMeta && <Tag color={statusMeta.color}>{statusMeta.text}</Tag>}
              </h2>
            </div>
            <div className="sb-card__body">
              <Descriptions bordered column={2} size="middle">
                <Descriptions.Item label={t("detail.labels.department")}>{detail.recDepartment}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.position")}>{detail.recPosition}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.headcount")}>{t("detail.headcountUnit", { count: detail.recHeadcount })}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.employmentType")}>{detail.recEmploymentType}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.manager")}>{detail.empName || "-"}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.applicantCount")}>{t("detail.headcountUnit", { count: detail.applicantCnt ?? 0 })}</Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.startDate")}>
                  {detail.recStartDate ? moment(detail.recStartDate).format("YYYY-MM-DD HH:mm") : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.endDate")}>
                  {detail.recEndDate ? moment(detail.recEndDate).format("YYYY-MM-DD HH:mm") : t("detail.alwaysOpen")}
                </Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.createdAt")}>
                  {detail.createdAt ? moment(detail.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.updatedAt")}>
                  {detail.updatedAt ? moment(detail.updatedAt).format("YYYY-MM-DD HH:mm") : "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("detail.labels.description")} span={2}>
                  <div style={{ whiteSpace: "pre-wrap" }}>{detail.recDescription || "-"}</div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          <div className="sb-card">
            <div className="sb-card__head">
              <h2>{t("detail.shortcuts.title")}</h2>
            </div>
            <div className="sb-card__body">
              <Space wrap size={12}>
                <Link href={`/apct/list?recId=${detail.recId}`}>
                  <Button icon={<TeamOutlined />}>{t("detail.shortcuts.applicantList")}</Button>
                </Link>
                <Link href={`/apct/kanban?recId=${detail.recId}`}>
                  <Button icon={<AppstoreOutlined />}>{t("detail.shortcuts.kanban")}</Button>
                </Link>
                <Link href={`/apct/rank?recId=${detail.recId}`}>
                  <Button icon={<TrophyOutlined />}>{t("detail.shortcuts.rank")}</Button>
                </Link>
                <Link href={`/apct/resume-search?recId=${detail.recId}`}>
                  <Button icon={<FileSearchOutlined />}>{t("detail.shortcuts.resumeSearch")}</Button>
                </Link>
              </Space>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
