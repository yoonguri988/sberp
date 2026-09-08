// pages/proj/task_edit.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, Input, Select, DatePicker, message } from "antd";
import { useTranslation } from "react-i18next";
import {
  updateTaskRequest,
  updateTaskContextRequest,
} from "../../reducers/task/taskReducer";

import moment from "moment";

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { label: "TODO", value: "TODO" },
  { label: "DOING", value: "DOING" },
  { label: "DONE", value: "DONE" },
];

export default function TaskEditPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("proj");

  const { taskId, proId } = router.query;

  const {
    loading,
    error,
    success,
    editContext,
  } = useSelector((state) => state.task);

  const {
    task,
    memberList = [],
    taskList = [],
  } = editContext;

  const [form, setForm] = useState({
    taskId: "",
    proId: "",
    taskName: "",
    taskDesc: "",
    taskStatus: "",
    pmId: "",
    parentTaskId: "",
    taskStartDate: "",
    taskEndDate: "",
  });

  // 수정 폼 참고 데이터 조회
  useEffect(() => {
    if (!router.isReady || !taskId || !proId) return;

    dispatch(
      updateTaskContextRequest({
        taskId: Number(taskId),
        projectProId: Number(proId),
      })
    );
  }, [router.isReady, taskId, proId, dispatch]);

  // 조회된 태스크를 form에 세팅
  useEffect(() => {
    if (!task) return;

    setForm({
      taskId: task.taskId,
      proId: Number(proId),
      taskName: task.taskName || "",
      taskDesc: task.taskDesc || "",
      taskStatus: task.taskStatus || "",
      pmId: task.pmId || "",
      parentTaskId: task.parentTaskId || "",
      taskStartDate: task.taskStartDate || "",
      taskEndDate: task.taskEndDate || "",
    });
  }, [task, proId]);

  // 수정 성공
  useEffect(() => {
    if (!success) return;

    message.success(t("task.edit.successMsg"));

    router.push({
      pathname: "/proj/task_detail",
      query: { taskId: form.taskId },
    });
  }, [success, router, form.taskId]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.taskName.trim()) {
      message.warning(t("task.edit.nameRequired"));
      return;
    }

    if (!form.taskDesc.trim()) {
      message.warning(t("task.edit.descRequired"));
      return;
    }

    if (!form.taskStatus) {
      message.warning(t("task.edit.statusRequired"));
      return;
    }

    if (!form.pmId) {
      message.warning(t("task.edit.assigneeRequired"));
      return;
    }

    if (!form.taskStartDate) {
      message.warning(t("task.edit.startDateRequired"));
      return;
    }

    if (!form.taskEndDate) {
      message.warning(t("task.edit.endDateRequired"));
      return;
    }

    if (moment(form.taskStartDate).isAfter(moment(form.taskEndDate))) {
      message.warning(t("task.edit.dateOrderError"));
      return;
    }

    dispatch(
      updateTaskRequest({
        taskId: form.taskId,
        dto: {
          taskId: form.taskId,
          proId: form.proId,
          taskName: form.taskName.trim(),
          taskDesc: form.taskDesc.trim(),
          taskStatus: form.taskStatus,
          pmId: form.pmId,
          parentTaskId: form.parentTaskId || null,
          taskStartDate: form.taskStartDate,
          taskEndDate: form.taskEndDate,
        },
      })
    );
  };

  if (!task) {
    return (
      <main className="sb-content">
        <div className="sb-card">
          <div className="sb-card__body text-center">
            {loading
              ? t("task.edit.loadingMsg")
              : t("task.edit.notFoundMsg")}
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
            {t("common.breadcrumbHome")} <i className="bi bi-chevron-right"></i> {t("common.breadcrumbWork")}{" "}
            <i className="bi bi-chevron-right"></i> {t("common.breadcrumbProj")}{" "}
            <i className="bi bi-chevron-right"></i> {t("task.edit.breadcrumbCurrent")}
          </div>
          <h1>{t("task.edit.title")}</h1>
          <p>{t("task.edit.subtitle")}</p>
        </div>
      </div>

      <div className="sb-card">
        <div className="sb-card__body">
          {error && (
            <div className="text-danger mb-3">
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="sb-form-label">{t("task.edit.nameLabel")}</label>
            <Input
              value={form.taskName}
              onChange={(e) =>
                handleChange("taskName", e.target.value)
              }
              placeholder={t("task.edit.namePlaceholder")}
            />
          </div>

          <div className="mb-3">
            <label className="sb-form-label">{t("task.edit.descLabel")}</label>
            <TextArea
              rows={4}
              value={form.taskDesc}
              onChange={(e) =>
                handleChange("taskDesc", e.target.value)
              }
              placeholder={t("task.edit.descPlaceholder")}
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="sb-form-label">{t("task.edit.statusLabel")}</label>
              <Select
                value={form.taskStatus || undefined}
                options={STATUS_OPTIONS}
                placeholder={t("task.edit.statusPlaceholder")}
                onChange={(value) =>
                  handleChange("taskStatus", value)
                }
                style={{ width: "100%" }}
              />
            </div>

            <div className="col-md-4">
              <label className="sb-form-label">{t("task.edit.assigneeLabel")}</label>
              <Select
                value={form.pmId || undefined}
                options={memberList.map((m) => ({
                  label: m.empName,
                  value: m.pmId,
                }))}
                placeholder={t("task.edit.assigneePlaceholder")}
                onChange={(value) =>
                  handleChange("pmId", value)
                }
                style={{ width: "100%" }}
              />
            </div>

            <div className="col-md-4">
              <label className="sb-form-label">{t("task.edit.updatedAtLabel")}</label>
              <Input
                value={moment().format("YYYY-MM-DD")}
                readOnly
                style={{ background: "#fafbfc" }}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="sb-form-label">
              {t("task.edit.parentTaskLabel")}
              <span
                className="text-faint"
                style={{ fontWeight: 400, fontSize: "12px" }}
              >
                {t("task.edit.parentTaskHint")}
              </span>
            </label>

            <Select
              value={form.parentTaskId || undefined}
              allowClear
              placeholder={t("task.edit.parentTaskPlaceholder")}
              options={taskList
                .filter((tk) => tk.taskId !== form.taskId)
                .map((tk) => ({
                  label: `[${tk.taskStatus}] ${tk.taskName} (~${moment(
                    tk.taskEndDate
                  ).format("YYYY-MM-DD")})`,
                  value: tk.taskId,
                }))}
              onChange={(value) =>
                handleChange("parentTaskId", value || "")
              }
              style={{ width: "100%" }}
            />
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="sb-form-label">{t("task.edit.startDateLabel")}</label>
              <DatePicker
                value={
                  form.taskStartDate
                    ? moment(form.taskStartDate)
                    : null
                }
                onChange={(date) =>
                  handleChange(
                    "taskStartDate",
                    date ? date.format("YYYY-MM-DD") : ""
                  )
                }
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
              />
            </div>

            <div className="col-md-6">
              <label className="sb-form-label">{t("task.edit.endDateLabel")}</label>
              <DatePicker
                value={
                  form.taskEndDate
                    ? moment(form.taskEndDate)
                    : null
                }
                onChange={(date) =>
                  handleChange(
                    "taskEndDate",
                    date ? date.format("YYYY-MM-DD") : ""
                  )
                }
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="sb-divider"></div>

          <div className="d-flex justify-content-end gap-2">
            <Button onClick={() => router.back()}>
              {t("common.cancelBtn")}
            </Button>

            <Link href="/proj/proj_list">
              <Button>{t("common.listBtn")}</Button>
            </Link>

            <Button
              type="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              {t("task.edit.submitBtn")}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
