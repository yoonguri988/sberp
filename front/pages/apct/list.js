// pages/apct/list.js
// 지원자 관리 (ROLE_ADMIN) - GET /api/admin/applicant (recId?, apctStatus?, page, size)
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Table, Select, Button, Tag, Pagination, Empty, message } from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DashboardOutlined,
  TrophyOutlined,
  AppstoreOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import moment from "moment";

import {
  fetchApplicantAdminListRequest,
  updateApplicantStatusRequest,
  resetApplicantState,
} from "../../reducers/apct/applicantReducer";
import { fetchRecruitAdminListRequest } from "../../reducers/rec/recruitReducer";

export default function ApplicantListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("apct");

  const { list, paging, listLoading, statusLoading, statusSuccess, statusError } =
    useSelector((state) => state.applicant);
  const { list: recruitOptions } = useSelector((state) => state.recruit);

  const [recId, setRecId] = useState(undefined);
  const [apctStatus, setApctStatus] = useState(undefined);
  const [page, setPage] = useState(1);
  const [statusEditingId, setStatusEditingId] = useState(null);

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
    dispatch(fetchRecruitAdminListRequest({ onepagelist: 100, pstartno: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.recId) setRecId(Number(router.query.recId));
  }, [router.isReady, router.query.recId]);

  const runSearch = (nextPage = 1) => {
    setPage(nextPage);
    dispatch(
      fetchApplicantAdminListRequest({ recId, apctStatus, page: nextPage - 1, size: 10 }),
    );
  };

  useEffect(() => {
    if (!router.isReady) return;
    runSearch(1);
    return () => dispatch(resetApplicantState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, recId, apctStatus, dispatch]);

  useEffect(() => {
    if (statusLoading) return;
    if (statusSuccess && statusEditingId) {
      message.success(t("list.messages.statusChangeSuccess"));
      setStatusEditingId(null);
      dispatch(resetApplicantState());
    } else if (statusError) {
      message.error(statusError);
      setStatusEditingId(null);
      dispatch(resetApplicantState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusLoading, statusSuccess, statusError]);

  const handleStatusChange = (apctId, newStatus) => {
    setStatusEditingId(apctId);
    dispatch(updateApplicantStatusRequest({ apctId, newStatus }));
  };

  const columns = [
    {
      title: t("list.table.name"),
      dataIndex: "apctName",
      key: "apctName",
      render: (v, record) => (
        <Link href={`/apct/detail?apctId=${record.apctId}`}>
          <span className="sb-table__name" style={{ cursor: "pointer" }}>
            {v}
          </span>
        </Link>
      ),
    },
    {
      title: t("list.table.recTitle"),
      dataIndex: "recTitle",
      key: "recTitle",
      ellipsis: true,
      render: (v) => <span className="sb-table__muted">{v || "-"}</span>,
    },
    { title: t("list.table.email"), dataIndex: "apctEmail", key: "apctEmail", width: 190 },
    { title: t("list.table.phone"), dataIndex: "apctPhone", key: "apctPhone", width: 130 },
    {
      title: t("list.table.resume"),
      dataIndex: "resumeCnt",
      key: "resumeCnt",
      width: 80,
      align: "center",
      render: (v) => (v > 0 ? <Tag color="cyan">{t("list.resumeSubmitted")}</Tag> : <Tag>{t("list.resumeNotSubmitted")}</Tag>),
    },
    {
      title: t("list.table.appliedDate"),
      dataIndex: "apctDate",
      key: "apctDate",
      width: 110,
      align: "center",
      render: (v) => (
        <span className="sb-hr-cell tnum">{v ? moment(v).format("YYYY-MM-DD") : "-"}</span>
      ),
    },
    {
      title: t("list.table.status"),
      dataIndex: "apctStatus",
      key: "apctStatus",
      width: 150,
      align: "center",
      render: (v, record) => (
        <Select
          size="small"
          style={{ width: 130 }}
          value={v}
          loading={statusLoading && statusEditingId === record.apctId}
          options={STATUS_OPTIONS}
          onChange={(next) => handleStatusChange(record.apctId, next)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      align: "center",
      render: (_, record) => (
        <Link href={`/apct/detail?apctId=${record.apctId}`}>
          <Button type="text" size="small" icon={<EyeOutlined />} title={t("list.detailTooltip")} />
        </Link>
      ),
    },
  ];

  const totalCnt = paging?.totalElements ?? 0;
  const pageSize = Number(paging?.size) || 10;

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("list.breadcrumbHome")} <i className="bi bi-chevron-right"></i> {t("list.breadcrumbRoot")}{" "}
            <i className="bi bi-chevron-right"></i> {t("list.breadcrumbCurrent")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>

        <div className="sb-page-head__actions my-3" style={{ display: "flex", gap: 8 }}>
          <Link href="/apct/dashboard">
            <Button icon={<DashboardOutlined />}>{t("list.dashboardBtn")}</Button>
          </Link>
          {recId && (
            <Link href={`/apct/kanban?recId=${recId}`}>
              <Button icon={<AppstoreOutlined />}>{t("list.kanbanBtn")}</Button>
            </Link>
          )}
          {recId && (
            <Link href={`/apct/rank?recId=${recId}`}>
              <Button icon={<TrophyOutlined />}>{t("list.rankBtn")}</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="sb-card mb-3">
        <div
          className="sb-toolbar"
          style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{t("list.cardTitle")}</strong>
            <span className="sb-badge sb-badge--gray ms-2">{t("list.totalBadge", { count: totalCnt })}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Select
              style={{ width: 260 }}
              placeholder={t("list.recruitPlaceholder")}
              allowClear
              showSearch
              optionFilterProp="label"
              value={recId}
              onChange={(v) => setRecId(v)}
              options={(recruitOptions || []).map((r) => ({
                value: r.recId,
                label: r.recTitle,
              }))}
            />
            <Select
              style={{ width: 160 }}
              placeholder={t("list.statusPlaceholder")}
              allowClear
              value={apctStatus}
              onChange={(v) => setApctStatus(v)}
              options={STATUS_OPTIONS}
            />
            <Button icon={<SearchOutlined />} onClick={() => runSearch(1)}>
              {t("list.searchBtn")}
            </Button>
          </div>
        </div>

        <div className="sb-card__body--flush">
          <Table
            rowKey="apctId"
            columns={columns}
            dataSource={list}
            loading={listLoading}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={<FolderOpenOutlined style={{ fontSize: 32 }} />}
                  description={t("list.emptyDescription")}
                />
              ),
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderTop: "1px solid var(--sb-border)",
          }}
        >
          <span style={{ color: "#999", fontSize: 12.5 }}>
            {t("list.totalCountPrefix")}<b>{totalCnt}</b>{t("list.totalCountSuffix")}
          </span>
          <Pagination
            size="small"
            current={page}
            total={totalCnt}
            pageSize={pageSize}
            showSizeChanger={false}
            onChange={runSearch}
          />
        </div>
      </div>
    </main>
  );
}
