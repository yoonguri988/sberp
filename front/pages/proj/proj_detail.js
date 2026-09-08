// pages/proj/proj_detail.js

import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import api from "../../api/axios";
import { Row, Col, Table, Button, Modal, Tag, Pagination, message } from "antd";
import { StarOutlined, UnorderedListOutlined, EditOutlined, DeleteOutlined, TeamOutlined, CheckSquareOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import ProjDeleteModal from "../../components/ProjDeleteModal";
import moment from "moment";

import { fetchProjDetailRequest, deleteProjRequest, resetProjState, analyzeProjRequest, } from "../../reducers/proj/projReducer";
import { fetchGanttRequest, fetchCriticalPathRequest } from "../../reducers/task/taskReducer";

const STATUS_TAG_COLOR = { TODO: "default", DOING: "processing", DONE: "success" };
const RISK_TAG_COLOR = { HIGH: "red", MEDIUM: "blue", LOW: "green" };

export default function ProjDetailPage(){
  
    const router = useRouter();
    const dispatch = useDispatch();
    const { t } = useTranslation("proj");
    const {proId} = router.query;
    const user = useSelector((state) => state.auth.user);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const isAdmin =
    user?.roles?.includes("ROOT") ||
    user?.roles?.includes("ROLE_ADMIN");

    // 프로젝트
    const {
      currentProject,
      loading,
      success,
      deleteSuccess,
      error,
      analysis
    } = useSelector((state) => state.proj);

    // 간트차트
    const { ganttTasks = [],criticalPathTasks = [], loading: ganttLoading, } = useSelector((state) => state.task);

    // 태스크 페이징
    const {
      dto: detail,
      taskList = [],
      taskPaging,
      memberList = []
    } = currentProject;

const isCreator = String(detail?.empId) === String(user?.empId);
const isProjectMember = memberList.some( (member) => String(member.empId) === String(user?.empId) );
const canCreateTask = isAdmin || isCreator || isProjectMember;

    const [taskPage, setTaskPage] = useState(1);
    const taskPageSize = 10;

    useEffect(() => {
      if (!router.isReady || !proId) return;

      dispatch(
        fetchProjDetailRequest({
          proId,
          pstartno: taskPage,
        })
      );
    }, [router.isReady, proId, taskPage, dispatch]);
    useEffect(() => {
    if (!router.isReady || !proId) return;

    dispatch(fetchGanttRequest({ proId }));
    dispatch(fetchCriticalPathRequest({ proId }));
    }, [router.isReady, proId, dispatch]);

    useEffect(() => {
      if (deleteSuccess) {
        router.push("/proj/proj_list");
      }
    }, [deleteSuccess, router]);

    useEffect(()=>{
      return()=>{
        dispatch(resetProjState());
      };
    },[dispatch]);

    const handleDelete=()=>{
      dispatch(deleteProjRequest(proId));
      setDeleteModalOpen(false);
    }

    const handleTaskPageChange = (page) => {
      setTaskPage(page);
    };

    const taskColumns = [
    {
      title: t("detail.taskTable.no"),
      key: "no",
      width: 56,
      align: "center",
      render: (_, __, idx) => (taskPage - 1) * taskPageSize + idx + 1,
    },
    {
      title: t("detail.taskTable.name"),
      dataIndex: "taskName",
      key: "taskName",
      render: (name, record) => (
        <Link href={{ pathname: "/proj/task_detail", query: { taskId: record.taskId } }}>
          <span className="sb-table__name" style={{ cursor: "pointer" }}>
            {name}
            {criticalPathTasks.some((t) => t.taskId === record.taskId) && (
              <Tag color="red" style={{ marginLeft: 12 }}>⚠ 병목</Tag>
            )}
          </span>
        </Link>
      ),
    },
    {
      title: t("detail.taskTable.status"),
      dataIndex: "taskStatus",
      key: "taskStatus",
      width: 90,
      align: "center",
      render: (status) => <Tag color={STATUS_TAG_COLOR[status] || "default"}>{status || "-"}</Tag>,
    },
    {
      title: t("detail.taskTable.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      align: "center",
      render: (value) => (value ? moment(value).format("YYYY-MM-DD") : "-"),
    },
  ];

  // Ai 분석
  const [aiOpen, setAiOpen] = useState(false);
  const riskMatch = analysis?.match(/위험도:\s*(HIGH|MEDIUM|LOW)/);
  const riskLevel = riskMatch?.[1];
  const handleAiAnalyze = () => {
  setAiOpen(true);
  dispatch(analyzeProjRequest(proId));
  };

  // 간트 차트
  const ganttWrapperRef = useRef(null);
  const ganttInstanceRef = useRef(null);

 useEffect(() => {
  if (!ganttWrapperRef.current || !ganttTasks.length) return;

  let cancelled = false;

  (async () => {
    const { default: Gantt } = await import("frappe-gantt");
    if (cancelled || !ganttWrapperRef.current) return;

    // 이전 렌더 내용을 완전히 비우고 새 svg를 수동으로 생성
    ganttWrapperRef.current.innerHTML = "";
    const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ganttWrapperRef.current.appendChild(svgEl);

    const bottleneckIds = new Set(criticalPathTasks.map((t) => String(t.taskId))); // 병목

    const tasks = ganttTasks.map((task) => ({
      id: String(task.taskId),
      name:
        task.taskName?.length > 18
          ? task.taskName.substring(0, 18) + "..."
          : task.taskName,
      fullName: task.taskName,
      start: task.taskStartDate,
      end: task.taskEndDate,
      dependencies: task.parentTaskId ? String(task.parentTaskId) : "",
      progress: task.taskStatus === "DONE" ? 100 : task.taskStatus === "DOING" ? 50 : 0,
    }));

    ganttInstanceRef.current = new Gantt(svgEl, tasks, {
      view_mode: "Week",
      date_format: "YYYY-MM-DD",
      language: "ko",
      custom_popup_html: (task) => `
        <div class="details-container">
          <h5>${task.fullName}</h5>
          <p>${task.start} ~ ${task.end}</p>
        </div>
      `,
    });
  })();

  return () => {
    cancelled = true;
    // 수동 정리
    if (ganttWrapperRef.current) {
        ganttWrapperRef.current.innerHTML = "";
      }
    };
  }, [ganttTasks, criticalPathTasks]);
  return(
    <main className="sb-content">
      {/* 페이지 헤더 */}
     <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("common.breadcrumbHome")}</Link> <i className="bi bi-chevron-right"></i> {t("common.breadcrumbWork")}{" "}
            <i className="bi bi-chevron-right"></i>{" "}
            <Link href="/proj/proj_list">{t("common.breadcrumbProj")}</Link>{" "}
            <i className="bi bi-chevron-right"></i> {t("detail.breadcrumbCurrent")}
          </div>
          <h1>{t("detail.title")}</h1>
          <p>{t("detail.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Button size="small" className="btn-sb" icon={<StarOutlined />} onClick={handleAiAnalyze}>
            {t("detail.aiAnalyzeBtn")}
          </Button>
          <Link href="/proj/proj_list">
            <Button size="small" icon={<UnorderedListOutlined />}>{t("common.listBtn")}</Button>
          </Link>
          {(isAdmin || isCreator) && (
            <Link href={{ pathname: "/proj/proj_edit", query: { proId } }}>
              <Button size="small" icon={<EditOutlined />}>{t("detail.editBtn")}</Button>
            </Link>
          )}
          {(isAdmin || isCreator) && (
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => setDeleteModalOpen(true)}>
              {t("detail.deleteBtn")}
            </Button>
          )}
        </div>
      </div>
      <Row gutter={16}>
        {/* 기본정보 */}
        <Col md={14}>
          <div className="sb-card">
            <div className="sb-card__head"><h2>{t("detail.basicInfoTitle")}</h2></div>
            <div className="sb-card__body--flush">
              <table className="sb-table">
                <tbody>
                  <tr><th style={{ width: "30%" }}>{t("detail.nameLabel")}</th><td className="sb-table__name">{detail?.proName}</td></tr>
                  <tr><th>{t("detail.descLabel")}</th><td className="sb-table__muted">{detail?.proDesc}</td></tr>
                  <tr>
                    <th>{t("detail.statusLabel")}</th>
                    <td><Tag color={STATUS_TAG_COLOR[detail?.proStatus] || "default"}>{detail?.proStatus}</Tag></td>
                  </tr>
                  <tr><th>{t("detail.creatorLabel")}</th><td>{detail?.empName}</td></tr>
                  <tr><th>{t("detail.startDateLabel")}</th><td className="tnum">{detail?.startDate ? moment(detail.startDate).format("YYYY-MM-DD") : "-"}</td></tr>
                  <tr><th>{t("detail.endDateLabel")}</th><td className="tnum">{detail?.endDate ? moment(detail.endDate).format("YYYY-MM-DD") : "-"}</td></tr>
                  <tr><th>{t("detail.createdAtLabel")}</th><td className="tnum">{detail?.createdAt ? moment(detail.createdAt).format("YYYY-MM-DD") : "-"}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </Col>
        {/* 태스크목록 */}
        <Col md={10}>
          <div className="sb-card">
            <div className="sb-card__head">
              <h2>{t("detail.taskListTitle")}</h2>
              <div className="right">
              {canCreateTask && (
                <Link href={{ pathname: "/proj/task_create", query: { proId } }}>
                  <Button
                    size="small"
                    className="btn-sb"
                    icon={<CheckSquareOutlined />}
                  >
                    {t("detail.addTaskBtn")}
                  </Button>
                </Link>
              )}
              </div>
            </div>
            <div className="sb-card__body--flush">
              <Table
                rowKey="taskId"
                columns={taskColumns}
                dataSource={taskList}
                loading={loading}
                pagination={false}
                locale={{ emptyText: t("detail.taskEmptyMsg") }}
              />
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
                  {t("detail.taskTotalPrefix")}<b>{taskPaging?.listtotal ?? 0}</b>{t("detail.taskTotalSuffix")}
                </span>
                {(taskPaging?.listtotal ?? 0) > taskPageSize && (
                  <Pagination
                    size="small"
                    current={taskPage}
                    total={taskPaging?.listtotal ?? 0}
                    pageSize={taskPageSize}
                    showSizeChanger={false}
                    onChange={handleTaskPageChange}
                  />
                )}
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {/* 참여인원 */}
      <div className="sb-card mt-3">
        <div className="sb-card__head">
          <h2>{t("detail.memberTitle")}</h2>
          <div className="right">
            {(isAdmin || detail?.empId === user?.empId) && (
              <Link href={{ pathname: "/proj/proj_member", query: { proId } }}>
                <Button
                  size="small"
                  className="btn-sb"
                  icon={<TeamOutlined />}
                >
                  {t("detail.memberManageBtn")}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="sb-card__body">
          <div className="sb-avstack mb-2">
            {memberList.map((m) => (
              <span
                key={m.empId}
                className="sb-avatar"
                title={m.empName}
              >
                {m.empName?.charAt(0)}
              </span>
            ))}
          </div>
          <span
            className="text-faint"
            style={{ fontSize: 13 }}
          >
            {memberList.length > 0
              ? memberList.map((m) => m.empName).join(", ")
              : t("detail.memberEmptyMsg")}
          </span>
        </div>
      </div>

      {/* 태스크 진행 현황-간트차트+병목 */}
      <div className="sb-card mt-3">
        <div className="sb-card__head">
          <h2>{t("detail.ganttTitle")}</h2>
          {criticalPathTasks.length > 0 && (
            <Tag color="red" style={{ marginLeft: 8 }}>
              {t("detail.bottleneckListLabel", { names: criticalPathTasks.map((t) => t.taskName).join(", ") })}            </Tag>
          )}
        </div>
        <div className="sb-card__body">
          <div id="gantt-wrapper" ref={ganttWrapperRef}></div>
        </div>
      </div>

      {/* AI 리스크 분석 결과 */}
      {aiOpen && (
        <div className="sb-card mt-3">
          <div className="sb-card__head">
            <h2>
              <StarOutlined /> {t("detail.aiResultTitle")}
               {riskLevel && (
                <Tag color={RISK_TAG_COLOR[riskLevel] || "default"} style={{ marginLeft: 8 }}>
                  {riskLevel}
                </Tag>
              )}
            </h2>
          </div>

          <div className="sb-card__body">
            {loading ? (
              <div className="text-faint">
                {t("detail.aiLoadingMsg")}
              </div>
            ) : (
              <div
                style={{
                  whiteSpace: "pre-line",
                  lineHeight: 1.6,
                }}
              >
                {analysis || t("detail.aiEmptyMsg")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 프로젝트 삭제 모달 */}
      <ProjDeleteModal
        itemName={t("common.projLabel")}
        open={deleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        loading={loading}
      />
    </main>
  );

}
