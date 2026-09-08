// pages/proj/task_list.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "../../api/axios";
import { Table, Segmented, Button, Pagination, Empty, Tag, } from "antd";

import {
  FilePdfOutlined,
  UnorderedListOutlined,
  LockOutlined,
  WarningOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { fetchMyTasksRequest } from "../../reducers/task/taskReducer";
import { checkMyReportRequest, createMyReportRequest , resetWeekState} from "../../reducers/week/weekReducer"

// 상태값에 따른 태그 색상
const STATUS_TAG_COLOR = {
  TODO: "default",
  DOING: "processing",
  DONE: "success",
};

export default function TaskListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("proj");

  // 상태 필터 버튼에 쓰일 옵션
  const STATUS_OPTIONS = [
    { label: t("common.statusAll"), value: "" },
    { label: "TODO", value: "TODO" },
    { label: "DOING", value: "DOING" },
    { label: "DONE", value: "DONE" },
  ];

  const {
    myTasks = [],
    myTasksPaging,
    myTasksTotalCnt = 0,
    loading,
    error,
  } = useSelector((state) => state.task);

  const [taskStatus, setTaskStatus] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // URL 쿼리(주소창)가 바뀔 때마다 그 조건으로 내 태스크 목록을 다시 조회
  useEffect(() => {
    if (!router.isReady) return;

    const status = Array.isArray(router.query.taskStatus)
      ? router.query.taskStatus[0]
      : router.query.taskStatus || "";

    const pstartno = Number(router.query.pstartno) || 1;
    const onepagelist = Number(router.query.onepagelist) || 10;

    setTaskStatus(status);

    dispatch(
      fetchMyTasksRequest({
        taskStatus: status,
        pstartno,
        onepagelist,
      })
    );
  }, [router.isReady, router.query, dispatch]);

  // 검색/필터/페이지 조건이 바뀔 때마다 이 함수로 URL 쿼리를 갱신
  // → 위 useEffect가 그 변화를 감지해서 다시 조회함
  const updateQuery = (next) => {
    router.push({
      pathname: "/proj/task_list",
      query: {
        ...router.query,
        ...next,
      },
    });
  };

  // 상태 필터(전체/TODO/DOING/DONE) 변경
  const handleStatusChange = (value) => {
    setTaskStatus(value);
    updateQuery({ taskStatus: value, pstartno: 1 });
  };

  // 페이지 번호 변경
  const handlePageChange = (page) => {
    updateQuery({ pstartno: page });
  };

  // 페이지당 표시 개수 변경
  const handlePageSizeChange = (current, size) => {
    updateQuery({ pstartno: 1, onepagelist: size });
  };

  // "내 주간보고서" 버튼 클릭 시 실행
  const handleWeeklyReport = async () => {
    if (reportLoading) return;

    try {
      setReportLoading(true);
      // 1) 주간보고서 생성 가능 여부 체크
      const checkResponse = await api.get("/api/week/my-report/check");
      const canCreate = checkResponse.data;

      if (!canCreate) {
        alert(t("task.list.reportNoDataAlert"));
        return;
      }
      // 2) pdf 생성
      const response = await api.get("/api/week/my-report", { responseType: "blob" });

      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "MyWeeklyReport.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      alert(t("task.list.reportErrorAlert"));
    } finally {
      setReportLoading(false);
    }
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      title: t("task.list.table.projName"),
      dataIndex: "proName",
      key: "proName",
      render: (name, record) => (
        <Link
          href={{
            pathname: "/proj/proj_detail",
            query: { proId: record.proId },
          }}
        >
          <span
            className="sb-table__name"
            style={{ cursor: "pointer" }}
          >
            {name || "-"}
          </span>
        </Link>
      ),
    },
    {
      title: t("task.list.table.taskName"),
      dataIndex: "taskName",
      key: "taskName",
      render: (name, record) => (
        <Link href={{ pathname: "/proj/task_detail", query: { taskId: record.taskId } }}>
          <span className="sb-table__name" style={{ cursor: "pointer" }}>
            {name}
          </span>
        </Link>
      ),
    },
    {
      title: t("task.list.table.desc"),
      dataIndex: "taskDesc",
      key: "taskDesc",
      ellipsis: true,
      render: (desc) => <span className="sb-table__muted">{desc || "-"}</span>,
    },
    {
      title: t("task.list.table.status"),
      dataIndex: "taskStatus",
      key: "taskStatus",
      width: 100,
      align: "center",
      render: (status) => (
        <Tag color={STATUS_TAG_COLOR[status] || "default"}>{status || "-"}</Tag>
      ),
    },
    {
      title: t("task.list.table.remark"),
      key: "remark",
      width: 110,
      align: "center",
      render: (_, record) => {
        const isWaiting =
          record.parentTaskId != null && record.parentTaskStatus !== "DONE";

        const isDelayed =
          record.delayed &&
          (record.parentTaskId == null || record.parentTaskStatus === "DONE");

        if (isWaiting) {
          return <Tag icon={<LockOutlined />}>{t("task.list.table.waitingTag")}</Tag>;
        }

        if (isDelayed) {
          return (
            <Tag icon={<WarningOutlined />} color="error">
              {t("task.list.table.delayedTag")}
            </Tag>
          );
        }

        return "-";
      },
    },
    {
      title: t("task.list.table.period"),
      key: "period",
      width: 220,
      render: (_, record) => (
        <span className="sb-hr-cell tnum">
          {record.taskStartDate ? dayjs(record.taskStartDate).format("YYYY-MM-DD") : "-"}
          {" ~ "}
          {record.taskEndDate ? dayjs(record.taskEndDate).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },
    {
      title: t("task.list.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "-"),
    },
  ];

  const totalCnt = myTasksTotalCnt || myTasksPaging?.listtotal || myTasks.length;

  const currentPage =
    Number(myTasksPaging?.current) || Number(router.query.pstartno) || 1;

  const pageSize = Number(router.query.onepagelist) || 10;

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common.breadcrumbHome")} <i className="bi bi-chevron-right"></i> {t("common.breadcrumbWork")}{" "}
            <i className="bi bi-chevron-right"></i> {t("task.list.breadcrumbCurrent")}
          </div>
          <h1>{t("task.list.title")}</h1>
          <p>{t("task.list.subtitle")}</p>
        </div>
      </div>

      <div className="sb-card mb-3">
        <div
          className="sb-toolbar"
          style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{t("task.list.cardTitle")}</strong>
            <span className="sb-badge sb-badge--gray ms-2">{t("task.list.resultCount", { count: totalCnt })}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Segmented
              value={taskStatus}
              onChange={handleStatusChange}
              options={STATUS_OPTIONS}
            />

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {reportLoading && (
                <span>
                  <span className="spinner-border spinner-border-sm text-primary me-1"></span>
                  {t("task.list.reportGeneratingMsg")}
                </span>
              )}

              <Button
                type="primary"
                size="small"
                icon={<FilePdfOutlined />}
                loading={reportLoading}
                onClick={handleWeeklyReport}
              >
                {t("task.list.reportBtn")}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ color: "#ff4d4f", padding: "12px 16px" }}>{error}</div>
        )}

        <div className="sb-card__body--flush">
          <Table
            rowKey="taskId"
            columns={columns}
            dataSource={myTasks}
            loading={loading}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={<UnorderedListOutlined style={{ fontSize: 32 }} />}
                  description={t("task.list.emptyMsg")}
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
          {t("task.list.totalCountPrefix")}<b>{totalCnt}</b>{t("task.list.totalCountSuffix")}
          </span>
        {totalCnt > 0 && (
          <Pagination
          size="small"
          current={currentPage}
          total={totalCnt}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={handlePageChange}
          />
        )}
        </div>
      </div>
    </main>
  );
}
