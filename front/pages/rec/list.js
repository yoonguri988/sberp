// pages/rec/list.js
// 채용공고 관리 (ROLE_ADMIN) - GET/POST/PUT/DELETE /api/admin/recruit
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Table, Button, Tag, Modal, Form, Input, InputNumber, Select, DatePicker, Pagination, Empty, message, } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  FileSearchOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import moment from "moment";

import {
  fetchRecruitAdminListRequest,
  createRecruitRequest,
  updateRecruitRequest,
  deleteRecruitRequest,
  resetRecruitState,
  fetchCloneRecruitRequest,
} from "../../reducers/rec/recruitReducer";

const STATUS_TAG_COLOR = {
  OPEN: "success",
  CLOSED: "default",
  CANCELLED: "error",
};

export default function RecruitListPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("rec");
  const [form] = Form.useForm();

  const { list, paging, listLoading, loading, success, error , cloneData} = useSelector(
    (state) => state.recruit,
  );

  const [recStatus, setRecStatus] = useState(undefined);
  const [recTitle, setRecTitle] = useState("");
  const [page, setPage] = useState(1);

  const [formTarget, setFormTarget] = useState(null); // null | "add" | record
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const STATUS_LABEL = {
    OPEN: { text: t("common.statusLabels.open"), color: "green" },
    CLOSED: { text: t("common.statusLabels.closed"), color: "default" },
    CANCELLED: { text: t("common.statusLabels.cancelled"), color: "red" },
  };

  const runSearch = (nextPage = 1) => {
    setPage(nextPage);
    dispatch(
      fetchRecruitAdminListRequest({ recStatus, recTitle: recTitle.trim(), pstartno: nextPage, onepagelist: 10 }),
    );
  };

  useEffect(() => {
    runSearch(1);
    return () => dispatch(resetRecruitState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!(saving || deleting) || loading) return;
    if (success) {
      if (saving) {
        message.success(
          formTarget === "add" ? t("list.messages.createSuccess") : t("list.messages.updateSuccess"),
        );
        closeFormModal();
      }
      if (deleting) {
        message.success(t("list.messages.deleteSuccess"));
        setDeleteTarget(null);
        setDeleting(false);
      }
      dispatch(resetRecruitState());
      runSearch(page);
    } else if (error) {
      message.error(error);
      setSaving(false);
      setDeleting(false);
      dispatch(resetRecruitState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, dispatch]);

  // 등록모달
  const openAddModal = () => {
    setFormTarget("add");
    form.resetFields();
    form.setFieldsValue({ recStatus: "OPEN" });
  };

  // 복제
  useEffect(() => {
    if (cloneData) {
      setFormTarget("add");
      form.setFieldsValue({
        recTitle: cloneData.recTitle,
        recDepartment: cloneData.recDepartment,
        recPosition: cloneData.recPosition,
        recHeadcount: cloneData.recHeadcount,
        recEmploymentType: cloneData.recEmploymentType,
        recDescription: cloneData.recDescription,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneData]);

  // 수정 모달
  const openEditModal = (record) => {
    setFormTarget(record);
    form.setFieldsValue({
      recTitle: record.recTitle,
      recDepartment: record.recDepartment,
      recPosition: record.recPosition,
      recHeadcount: record.recHeadcount,
      recEmploymentType: record.recEmploymentType,
      recDescription: record.recDescription,
      recDateRange: [
        record.recStartDate ? moment(record.recStartDate) : null,
        record.recEndDate ? moment(record.recEndDate) : null,
      ],
      recStatus: record.recStatus,
    });
  };
  const closeFormModal = () => {
    setFormTarget(null);
    setSaving(false);
    form.resetFields();
  };
  const isEditMode = formTarget !== null && formTarget !== "add";

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [start, end] = values.recDateRange || [];
      const payload = {
        recTitle: values.recTitle,
        recDepartment: values.recDepartment,
        recPosition: values.recPosition,
        recHeadcount: values.recHeadcount,
        recEmploymentType: values.recEmploymentType,
        recDescription: values.recDescription,
        recStartDate: start ? start.format("YYYY-MM-DDTHH:mm:ss") : null,
        recEndDate: end ? end.format("YYYY-MM-DDTHH:mm:ss") : null,
        recStatus: values.recStatus,
      };
      setSaving(true);
      if (isEditMode) {
        dispatch(updateRecruitRequest({ recId: formTarget.recId, ...payload }));
      } else {
        dispatch(createRecruitRequest(payload));
      }
    } catch (e) {
      // 폼 자체 검증 실패
    }
  };

  const confirmDelete = () => {
    setDeleting(true);
    dispatch(deleteRecruitRequest(deleteTarget.recId));
  };

  // 채용공고 복제
  const handleClone = (recId) => {
    dispatch(fetchCloneRecruitRequest(recId));
  };


  const columns = [
    {
      title: t("list.table.title"),
      dataIndex: "recTitle",
      key: "recTitle",
      render: (v, record) => (
        <Link href={`/rec/detail?recId=${record.recId}`}>
          <span className="sb-table__name" style={{ cursor: "pointer" }}>
            {v}
          </span>
        </Link>
      ),
    },
    { title: t("list.table.department"), dataIndex: "recDepartment", key: "recDepartment", width: 130 },
    { title: t("list.table.position"), dataIndex: "recPosition", key: "recPosition", width: 130 },
    {
      title: t("list.table.headcount"),
      dataIndex: "recHeadcount",
      key: "recHeadcount",
      width: 70,
      align: "center",
    },
    {
      title: t("list.table.employmentType"),
      dataIndex: "recEmploymentType",
      key: "recEmploymentType",
      width: 100,
    },
    {
      title: t("list.table.manager"),
      dataIndex: "empName",
      key: "empName",
      width: 100,
      render: (v) => v || "-",
    },
    {
      title: t("list.table.applicantCnt"),
      key: "applicantCnt",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Link href={`/apct/list?recId=${record.recId}`}>
          <Button type="text" size="small" icon={<TeamOutlined />}>
            {t("list.applicantCountUnit", { count: record.applicantCnt ?? 0 })}
          </Button>
        </Link>
      ),
    },
    {
      title: t("list.table.status"),
      dataIndex: "recStatus",
      key: "recStatus",
      width: 90,
      align: "center",
      render: (v) => <Tag color={STATUS_TAG_COLOR[v] || "default"}>{STATUS_LABEL[v]?.text || v}</Tag>,
    },
    {
      title: t("list.table.actions"),
      key: "actions",
      width: 170,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Link href={`/apct/resume-search?recId=${record.recId}`}>
            <Button type="text" size="small" icon={<FileSearchOutlined />} title={t("list.actionTooltips.resumeSearch")} />
          </Link>
          <Link href={`/rec/detail?recId=${record.recId}`}>
            <Button type="text" size="small" icon={<EyeOutlined />} title={t("list.actionTooltips.detail")} />
          </Link>
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            title={t("list.actionTooltips.clone")}
            onClick={() => handleClone(record.recId)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            title={t("list.actionTooltips.edit")}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            title={t("list.actionTooltips.delete")}
            onClick={() => setDeleteTarget(record)}
          />
        </div>
      ),
    },
  ];

  const totalCnt = paging?.listtotal ?? 0;
  const currentPage = Number(paging?.current) || page;
  const pageSize = Number(paging?.onepagelist) || 10;

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common.breadcrumbHome")} <i className="bi bi-chevron-right"></i> {t("common.breadcrumbRoot")}{" "}
            <i className="bi bi-chevron-right"></i> {t("list.breadcrumbCurrent")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>

        <div className="sb-page-head__actions my-3">
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            {t("list.addBtn")}
          </Button>
        </div>
      </div>

      <div className="sb-card mb-3">
        <div
          className="sb-toolbar"
          style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{t("list.cardTitle")}</strong>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Input
              style={{ width: 240 }}
              placeholder={t("list.searchPlaceholder")}
              prefix={<SearchOutlined />}
              value={recTitle}
              onChange={(e) => setRecTitle(e.target.value)}
              onPressEnter={() => runSearch(1)}
              allowClear
            />

            <Select
              style={{ width: 160 }}
              placeholder={t("list.statusPlaceholder")}
              allowClear
              value={recStatus}
              onChange={(v) => setRecStatus(v)}
              options={[
                { value: "OPEN", label: t("common.statusLabels.open") },
                { value: "CLOSED", label: t("common.statusLabels.closed") },
                { value: "CANCELLED", label: t("common.statusLabels.cancelled") },
              ]}
            />

            <Button icon={<SearchOutlined />} onClick={() => runSearch(1)}>
              {t("list.searchBtn")}
            </Button>
          </div>
        </div>

        {error && (
          <div style={{ color: "#ff4d4f", padding: "12px 16px" }}>{error}</div>
        )}

        <div className="sb-card__body--flush">
          <Table
            rowKey="recId"
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
          {totalCnt > pageSize && (
            <Pagination
              size="small"
              current={currentPage}
              total={totalCnt}
              pageSize={pageSize}
              showSizeChanger={false}
              onChange={runSearch}
            />
          )}
        </div>
      </div>

      {/* 등록/수정 모달 */}
      <Modal
        title={isEditMode ? t("list.formModal.titleEdit") : t("list.formModal.titleAdd")}
        open={formTarget !== null}
        onCancel={closeFormModal}
        onOk={handleSubmit}
        okText={isEditMode ? t("list.formModal.okEdit") : t("list.formModal.okAdd")}
        okButtonProps={{ loading: saving }}
        cancelText={t("list.formModal.cancelBtn")}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="recTitle"
            label={t("list.formModal.titleLabel")}
            rules={[{ required: true, message: t("list.formModal.titleRequired") }]}
          >
            <Input placeholder={t("list.formModal.titlePlaceholder")} />
          </Form.Item>
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              name="recDepartment"
              label={t("list.formModal.departmentLabel")}
              style={{ flex: 1 }}
              rules={[{ required: true, message: t("list.formModal.departmentRequired") }]}
            >
              <Input placeholder={t("list.formModal.departmentPlaceholder")} />
            </Form.Item>
            <Form.Item
              name="recPosition"
              label={t("list.formModal.positionLabel")}
              style={{ flex: 1 }}
              rules={[{ required: true, message: t("list.formModal.positionRequired") }]}
            >
              <Input placeholder={t("list.formModal.positionPlaceholder")} />
            </Form.Item>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Form.Item
              name="recHeadcount"
              label={t("list.formModal.headcountLabel")}
              style={{ flex: 1 }}
              rules={[{ required: true, message: t("list.formModal.headcountRequired") }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} placeholder={t("list.formModal.headcountPlaceholder")} />
            </Form.Item>
            <Form.Item
              name="recEmploymentType"
              label={t("list.formModal.employmentTypeLabel")}
              style={{ flex: 1 }}
              rules={[{ required: true, message: t("list.formModal.employmentTypeRequired") }]}
            >
              <Select
                placeholder={t("list.formModal.employmentTypePlaceholder")}
                options={[
                  { value: "정규직", label: t("list.formModal.employmentTypeOptions.fulltime") },
                  { value: "계약직", label: t("list.formModal.employmentTypeOptions.contract") },
                  { value: "인턴", label: t("list.formModal.employmentTypeOptions.intern") },
                  { value: "파견직", label: t("list.formModal.employmentTypeOptions.dispatch") },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item
            name="recDateRange"
            label={t("list.formModal.dateRangeLabel")}
            rules={[{ required: true, message: t("list.formModal.dateRangeRequired") }]}
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              allowEmpty={[false, true]}
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item
            name="recStatus"
            label={t("list.formModal.statusLabel")}
            rules={[{ required: true, message: t("list.formModal.statusRequired") }]}
          >
            <Select
              options={[
                { value: "OPEN", label: t("common.statusLabels.open") },
                { value: "CLOSED", label: t("common.statusLabels.closed") },
                { value: "CANCELLED", label: t("common.statusLabels.cancelled") },
              ]}
            />
          </Form.Item>
          <Form.Item name="recDescription" label={t("list.formModal.descriptionLabel")}>
            <Input.TextArea rows={5} placeholder={t("list.formModal.descriptionPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title={t("list.deleteModal.title")}
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
        okText={t("list.deleteModal.okText")}
        okButtonProps={{ danger: true, loading: deleting }}
        cancelText={t("list.deleteModal.cancelText")}
        destroyOnClose
      >
        <p>
          <b>{deleteTarget?.recTitle}</b> {t("list.deleteModal.confirmSuffix")}
        </p>
        <p style={{ color: "#999", fontSize: 13 }}>
          {t("list.deleteModal.hint")}
        </p>
      </Modal>
    </main>
  );
}
