// pages/careers/detail.js
// 채용 공개 사이트 - 공고 상세 (GET /api/public/recruit/{recId}, 로그인 필요)
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Button, Tag, Skeleton, Alert, Space,Descriptions } from "antd";
import {
  ArrowLeftOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import moment from "moment";

import ApplicantLayout from "../../components/ApplicantLayout";
import { fetchPublicRecruitDetailRequest } from "../../reducers/rec/recruitPublicReducer";

export default function CareersDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("careers");
  const { recId } = router.query;
  const { apctAccessToken } = useSelector((state) => state.apctAuth);
  const { detail, detailLoading, detailError } = useSelector(
    (state) => state.recruitPublic,
  );

  useEffect(() => {
    if (!router.isReady || !recId || !apctAccessToken) return;
    dispatch(fetchPublicRecruitDetailRequest(Number(recId)));
  }, [router.isReady, recId, apctAccessToken, dispatch]);

  const isOpen = detail?.recStatus === "OPEN";

  return (
    <ApplicantLayout>
      <Link href="/careers">
        <Button type="text" icon={<ArrowLeftOutlined />} style={{ paddingLeft: 0, marginBottom: 12 }}>
          {t("detail.backToListBtn")}
        </Button>
      </Link>

      {detailLoading && <Skeleton active paragraph={{ rows: 8 }} />}

      {!detailLoading && detailError && (
        <Alert type="error" showIcon message={t("detail.loadError")} description={detailError} />
      )}

      {!detailLoading && detail && (
        <div style={{ background: "#fff", border: "1px solid #e6ebe8", borderRadius: 12, padding: "28px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#14251f", margin: 0 }}>
              {detail.recTitle}
            </h1>
            <Tag color={isOpen ? "green" : "default"}>
              {isOpen ? t("detail.statusOpen") : detail.recStatus === "CLOSED" ? t("detail.statusClosed") : t("detail.statusCancelled")}
            </Tag>
          </div>

          <Space size={16} wrap style={{ color: "#667", fontSize: 13.5, marginBottom: 20 }}>
            <span>
              <EnvironmentOutlined /> {detail.recDepartment} · {detail.recPosition}
            </span>
            <span>
              <TeamOutlined /> {t("detail.headcountUnit", { count: detail.recHeadcount })}
            </span>
            <Tag color="blue">{detail.recEmploymentType}</Tag>
            <span>
              <ClockCircleOutlined />{" "}
              {detail.recEndDate
                ? t("detail.dateRange", {
                    start: moment(detail.recStartDate).format("YYYY-MM-DD"),
                    end: moment(detail.recEndDate).format("YYYY-MM-DD"),
                  })
                : t("detail.dateRangeOpen", { start: moment(detail.recStartDate).format("YYYY-MM-DD") })}
            </span>
          </Space>

          <div
            style={{
              borderTop: "1px solid #eef2f0",
              paddingTop: 20,
              whiteSpace: "pre-wrap",
              lineHeight: 1.8,
              color: "#333",
              minHeight: 120,
            }}
          >
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

          <div style={{ marginTop: 28, textAlign: "right" }}>
            {isOpen ? (
              <Link href={`/careers/apply?recId=${detail.recId}`}>
                <Button type="primary" size="large" icon={<SendOutlined />}>
                  {t("detail.applyBtn")}
                </Button>
              </Link>
            ) : (
              <Button size="large" disabled>
                {t("detail.cannotApplyBtn")}
              </Button>
            )}
          </div>
        </div>
      )}
    </ApplicantLayout>
  );
}
