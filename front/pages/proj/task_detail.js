// pages/proj/task_detail.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, message } from "antd";
import { useTranslation } from "react-i18next";
import ProjDeleteModal from "../../components/ProjDeleteModal";

import {
  fetchTaskDetailRequest,
  deleteTaskRequest,
  resetTaskState,
} from "../../reducers/task/taskReducer";

import moment from "moment";

export default function TaskDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("proj");
  const { taskId } = router.query;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const {
    currentTask,
    loading,
    error,
    success,
    deleteSuccess
  } = useSelector((state) => state.task);

  const task = currentTask?.task;
  const parentTask = currentTask?.parentTask;
  const impactTasks = currentTask?.impactTasks || [];
  const isDelayed = currentTask?.isDelayed;
  const proId = currentTask?.proId;
  const proName = task?.proName;

  // 상세 조회
  useEffect(() => {
    if (!router.isReady || !taskId) return;
    dispatch(fetchTaskDetailRequest(taskId));
  }, [router.isReady, taskId, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // 삭제 성공
  useEffect(() => {
    if (deleteSuccess) {
      router.push({
        pathname:"/proj/proj_detail", query:{proId}});
    }
  }, [deleteSuccess, router, proId]);

  // 페이지 나갈 때 상태 초기화
  useEffect(() => {
    return () => {
      dispatch(resetTaskState());
    };
  }, [dispatch]);

  // 상태 뱃지
  const getStatusClass = (status) => {
    if (status === "DONE") {
      return "sb-badge sb-badge--green";
    }
    if (status === "DOING") {
      return "sb-badge sb-badge--blue";
    }
    return "sb-badge sb-badge--gray";
  };

  // 삭제
  const handleDelete = () => {
    dispatch(
      deleteTaskRequest({
        taskId: task.taskId,
        proId: proId,
      })
    );
    setDeleteModalOpen(false);
  };
  if (loading && !task) {
    return (
      <main className="sb-content">
        <div className="sb-card">
          <div className="sb-card__body text-center">
            {t("task.detail.loadingMsg")}
          </div>
        </div>
      </main>
    );
  }
  if (!loading && !task) {
    return (
      <main className="sb-content">
        <div className="sb-card">
          <div className="sb-card__body text-center">
            <p>{t("task.detail.notFoundMsg")}</p>
            {error && (
              <p className="text-danger">
                {t("task.detail.errorPrefix")}{error}
              </p>
            )}
            <p>{t("task.detail.taskIdLabel")}{taskId}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("common.breadcrumbHome")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("common.breadcrumbWork")}
            <i className="bi bi-chevron-right"></i>
            {t("common.breadcrumbProj")}
            <i className="bi bi-chevron-right"></i>
            {t("task.detail.breadcrumbCurrent")}
          </div>
          <h1>{t("task.detail.title")}</h1>
        </div>

        <div className="sb-page-head__actions">
          <Button
            type="default"
            size="small"
            onClick={() => router.back()}
          >
            <i className="bi bi-arrow-left"></i>{" "}
            {t("task.detail.backBtn")}
          </Button>

          <Link href="/proj/proj_list">
            <Button type="default" size="small">
              <i className="bi bi-list"></i>{" "}
              {t("common.listBtn")}
            </Button>
          </Link>

          <Link
            href={`/proj/task_edit?taskId=${task.taskId}&proId=${proId}`}
          >
            <Button type="default" size="small">
              <i className="bi bi-pencil"></i>{" "}
              {t("task.detail.editBtn")}
            </Button>
          </Link>

          <Button
            type="default"
            size="small"
            danger
            onClick={() => setDeleteModalOpen(true)}
          >
            <i className="bi bi-trash3"></i>{" "}
            {t("task.detail.deleteBtn")}
          </Button>
        </div>
      </div>

      <div className="sb-card">
        <div className="sb-card__head">
          <h2>{t("task.detail.cardTitle")}</h2>
        </div>

        <div className="sb-card__body--flush">
          <table className="sb-table">
            <tbody>
              <tr>
                <th style={{ width: "25%" }}>{t("task.detail.projNameLabel")}</th>
                <td className="sb-table__name">
                    <Link href={`/proj/proj_detail?proId=${proId}`}>
                      {task.proName}
                    </Link>
                </td>
              </tr>
              <tr>
                <th style={{ width: "25%" }}>{t("task.detail.taskNameLabel")}</th>
                <td className="sb-table__name">
                  {task.taskName}
                  {isDelayed && (
                    <span className="sb-badge sb-badge--red ms-2">
                      <i className="bi bi-exclamation-triangle-fill"></i>{" "}
                      {t("task.detail.delayedTag")}
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <th>{t("task.detail.descLabel")}</th>
                <td className="sb-table__muted">{task.taskDesc}</td>
              </tr>

              <tr>
                <th>{t("task.detail.statusLabel")}</th>
                <td>
                  <span className={getStatusClass(task.taskStatus)}>
                    <span className="pip"></span>
                    {task.taskStatus}
                  </span>
                </td>
              </tr>

              <tr>
                <th>{t("task.detail.assigneeLabel")}</th>
                <td>{task.pmName}</td>
              </tr>

              <tr>
                <th>{t("task.detail.startDateLabel")}</th>
                <td className="tnum">
                  {task.taskStartDate
                    ? moment(task.taskStartDate).format("YYYY-MM-DD")
                    : ""}
                </td>
              </tr>

              <tr>
                <th>{t("task.detail.endDateLabel")}</th>
                <td className="tnum">
                  {task.taskEndDate
                    ? moment(task.taskEndDate).format("YYYY-MM-DD")
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="sb-card mt-3">
        <div className="sb-card__head">
          <h2>
            <i className="bi bi-diagram-3"></i>{" "}
            {t("task.detail.dependencyTitle")}
          </h2>
        </div>

        <div className="sb-card__body">
          <div className="flow-box">
            <div className="flow-title">{t("task.detail.parentTaskTitle")}</div>

            {parentTask ? (
              <div className="flow-task">
                <Link href={`/proj/task_detail?taskId=${parentTask.taskId}`}>
                  {parentTask.taskName}
                </Link>

                <span className={getStatusClass(parentTask.taskStatus)}>
                  {parentTask.taskStatus}
                </span>
              </div>
            ) : (
              <div className="text-faint">
                {t("task.detail.noParentTaskMsg")}
              </div>
            )}
          </div>

          <div className="flow-arrow">
            <i className="bi bi-arrow-down"></i>
          </div>

          <div className="flow-box current-flow">
            <div className="flow-title">{t("task.detail.currentTaskTitle")}</div>

            <div className="flow-task">
              <b>{task.taskName}</b>

              <span className={getStatusClass(task.taskStatus)}>
                {task.taskStatus}
              </span>
            </div>
          </div>

          {impactTasks.length > 0 && (
            <>
              <div className="flow-arrow">
                <i className="bi bi-arrow-down"></i>
              </div>

              <div className="flow-box">
                <div className="flow-title">
                  {t("task.detail.impactTaskTitle")}
                </div>

                {impactTasks.map((impactTask) => (
                  <div
                    key={impactTask.taskId}
                    className="flow-task"
                    style={{
                      marginLeft: `${(impactTask.depth - 1) * 30}px`,
                    }}
                  >
                    ↳{" "}

                    <Link
                      href={`/proj/task_detail?taskId=${impactTask.taskId}`}
                    >
                      {impactTask.taskName}
                    </Link>

                    <span
                      className={getStatusClass(impactTask.taskStatus)}
                    >
                      {impactTask.taskStatus}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ProjDeleteModal
        itemName={t("common.taskLabel")}
        open={deleteModalOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        loading={loading}
      />
    </main>
  );
}
