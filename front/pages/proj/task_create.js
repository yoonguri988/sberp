// pages/proj/task_create.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import { Button, Input, Select, DatePicker, message } from "antd";
import { useTranslation } from "react-i18next";
import { createTaskRequest, createTaskContextRequest,resetTaskState } from "../../reducers/task/taskReducer";

import moment from "moment";

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { label: "TODO", value: "TODO" },
  { label: "DOING", value: "DOING" },
  { label: "DONE", value: "DONE" },
];

export default function TaskCreatePage() {
    const router = useRouter();
    const { proId } = router.query;
    const dispatch = useDispatch();
    const { t } = useTranslation("proj");

    const { loading, error, success, createContext } = useSelector((state) => state.task);
    const { memberList, taskList } = createContext;

    const [taskName, setTaskName] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [taskStatus, setTaskStatus] = useState("");
    const [pmId, setPmId] = useState("");
    const [parentTaskId, setParentTaskId] = useState("");
    const [taskStartDate, setTaskStartDate] = useState("");
    const [taskEndDate, setTaskEndDate] = useState("");

    useEffect(() => {
    return () => {
      dispatch(resetTaskState());
    };
    }, [dispatch]);

    useEffect(() => {
    if (!router.isReady || !proId) return;

    dispatch(createTaskContextRequest(proId));
    }, [router.isReady, proId, dispatch]);

    useEffect(() => {
    if (success) {
        router.push({
          pathname:"/proj/proj_detail", query:{proId}});
    }
    }, [success, router, proId]);

    const handleReset = () => {
        setTaskName("");
        setTaskDesc("");
        setTaskStatus("");
        setPmId("");
        setParentTaskId("");
        setTaskStartDate("");
        setTaskEndDate("");
    };

    const onFinish = () => {
    if (!taskName.trim()) { message.warning(t("task.create.nameRequired")); return; }
    if (!taskDesc.trim()) { message.warning(t("task.create.descRequired")); return; }
    if (!taskStatus) { message.warning(t("task.create.statusRequired")); return; }
    if (!pmId) { message.warning(t("task.create.assigneeRequired")); return; }
    if (!taskStartDate) { message.warning(t("task.create.startDateRequired")); return; }
    if (!taskEndDate) { message.warning(t("task.create.endDateRequired")); return; }
    if (moment(taskStartDate).isAfter(moment(taskEndDate))) { message.warning(t("task.create.dateOrderError")); return; }

    dispatch(
      createTaskRequest({
        taskName: taskName.trim(),
        taskDesc: taskDesc.trim(),
        taskStatus,
        pmId,
        parentTaskId: parentTaskId || null,
        taskStartDate,
        taskEndDate,
        proId,
      })
    );
  };

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("common.breadcrumbHome")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("common.breadcrumbWork")}
            <i className="bi bi-chevron-right"></i>
            {t("common.taskLabel")}
            <i className="bi bi-chevron-right"></i>
            {t("task.create.breadcrumbCurrent")}
          </div>
          <h1>{t("task.create.title")}</h1>
          <p>{t("task.create.subtitle")}</p>
        </div>
      </div>

      <div className="sb-card">
        <div className="sb-card__body">
          <form id="taskCreateForm" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="mb-3">
              <label htmlFor="task_name" className="sb-form-label">
                {t("task.create.nameLabel")}
              </label>
              <Input id="task_name"
                     name="task_name"
                     value={taskName}
                     onChange={(e)=>setTaskName(e.target.value)}
                     placeholder={t("task.create.namePlaceholder")} />
            </div>

            <div className="mb-3">
              <label htmlFor="task_desc" className="sb-form-label">
                {t("task.create.descLabel")}
              </label>
              <TextArea
                id="task_desc"
                name="task_desc"
                value={taskDesc}
                onChange={(e)=>setTaskDesc(e.target.value)}
                placeholder={t("task.create.descPlaceholder")}
                rows={4}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label htmlFor="task_status" className="sb-form-label">
                  {t("task.create.statusLabel")}
                </label>
                <Select
                  id="task_status"
                  value={taskStatus || undefined}
                  onChange={(value) => setTaskStatus(value)}
                  options={STATUS_OPTIONS}
                  placeholder={t("task.create.statusPlaceholder")}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="pm_id_name" className="sb-form-label">
                  {t("task.create.assigneeLabel")}
                </label>
                <Select
                value={pmId || undefined}
                onChange={(value) => setPmId(value)}
                options={memberList.map((m) => ({
                    label: m.empName,
                    value: m.pmId,
                }))}
                placeholder={t("task.create.assigneePlaceholder")}
                style={{ width: "100%" }}
                />
                </div>
                <div className="col-md-4">
                <label htmlFor="reg_date" className="sb-form-label">
                    {t("task.create.regDateLabel")}
                </label>
                <Input
                    id="reg_date"
                    value={moment().format("YYYY-MM-DD")}
                    readOnly
                    style={{ maxWidth: 200, background: "#fafbfc" }}
                />
                </div>
                </div>
                <div className="mb-3">
                <label className="sb-form-label">
                    {t("task.create.parentTaskLabel")}
                    <span
                    className="text-faint"
                    style={{ fontWeight: 400, fontSize: "12px" }}
                    >
                    {t("task.create.parentTaskHint")}
                    </span>
                </label>
                <Select
                    value={parentTaskId || undefined}
                    onChange={(value) => setParentTaskId(value)}
                    placeholder={t("task.create.parentTaskPlaceholder")}
                    allowClear
                    options={taskList.map((tk) => ({
                    label: `[${tk.taskStatus}] ${tk.taskName} (~${moment(
                        tk.taskEndDate
                    ).format("YYYY-MM-DD")})`,
                    value: tk.taskId,
                    }))}
                    style={{ width: "100%" }}
                />
                </div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label htmlFor="task_start_date" className="sb-form-label">
                  {t("task.create.startDateLabel")}
                </label>
                <DatePicker
                id="task_start_date"
                value={ taskStartDate ? moment(taskStartDate, "YYYY-MM-DD") : null }
                onChange={(date) => setTaskStartDate( date ? date.format("YYYY-MM-DD") : "" ) }
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="task_end_date" className="sb-form-label">
                  {t("task.create.endDateLabel")}
                </label>
                <DatePicker
                id="task_end_date"
                value={ taskEndDate ? moment(taskEndDate, "YYYY-MM-DD") : null }
                onChange={(date) => setTaskEndDate( date ? date.format("YYYY-MM-DD") : "" ) }
                format="YYYY-MM-DD"
                style={{ width: "100%" }}
                />
              </div>
            </div>

            {error && <div className="text-danger mb-3">{error}</div>}

            <div className="sb-divider"></div>

            <div className="d-flex justify-content-end gap-2">
              <Button type="default" htmlType="button" onClick={() => router.back()}>
                {t("common.cancelBtn")}
              </Button>

              <Link href="/proj/proj_list">
                <Button>{t("common.listBtn")}</Button>
              </Link>

              <Button type="primary" htmlType="button" loading={loading} onClick={onFinish}>
                {t("task.create.submitBtn")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
