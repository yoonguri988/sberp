// pages/sal/std/list.js
// 급여기준 관리 (ROLE_ADMIN) - GET/POST/PUT/DELETE /api/salstd
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Card,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Pagination,
  message,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";

import {
  listSalStdRequest,
  createSalStdRequest,
  updateSalStdRequest,
  deleteSalStdRequest,
  resetSalStdState,
} from "../../reducers/sal/salStdReducer";
import EmployeePicker from "../../components/EmployeePicker";
import { formatWon, wonFormatter, wonParser } from "../../utils/currency";

export default function SalStdListPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const [form] = Form.useForm();

  const { stdList, paging, loading, success, error } = useSelector(
    (state) => state.salStd,
  );

  const [filters, setFilters] = useState({
    empName: "",
    department: "",
    position: "",
  });
  const [page, setPage] = useState(1);

  const [formTarget, setFormTarget] = useState(null); // null | "add" | record
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const runSearch = (nextPage = 1) => {
    setPage(nextPage);
    dispatch(listSalStdRequest({ ...filters, page: nextPage - 1, size: 10 }));
  };

  useEffect(() => {
    runSearch(1);
    return () => dispatch(resetSalStdState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!(saving || deleting) || loading) return;
    if (success) {
      if (saving) {
        message.success(
          formTarget === "add"
            ? t("std.createSuccessMsg")
            : t("std.updateSuccessMsg"),
        );
        closeFormModal();
      }
      if (deleting) {
        message.success(t("std.deleteSuccessMsg"));
        setDeleteTarget(null);
        setDeleting(false);
      }
      dispatch(resetSalStdState());
      runSearch(page);
    } else if (error) {
      message.error(error);
      setSaving(false);
      setDeleting(false);
      dispatch(resetSalStdState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, dispatch]);

  const openAddModal = () => {
    setFormTarget("add");
    form.resetFields();
  };
  const openEditModal = (record) => {
    setFormTarget(record);
    form.setFieldsValue({
      baseSal: record.baseSal,
      annuSal: record.annuSal,
      startDate: record.startDate ? moment(record.startDate) : null,
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
      const payload = {
        ...values,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : null,
      };
      if (!isEditMode && !payload.empId) {
        message.warning(t("std.empSelectWarning"));
        return;
      }
      setSaving(true);
      if (isEditMode) {
        dispatch(updateSalStdRequest({ stdId: formTarget.stdId, ...payload }));
      } else {
        dispatch(createSalStdRequest(payload));
      }
    } catch (e) {
      // 폼 자체 검증 실패
    }
  };

  const confirmDelete = () => {
    setDeleting(true);
    dispatch(deleteSalStdRequest(deleteTarget.stdId));
  };

  const columns = [
    {
      title: t("std.columns.empName"),
      dataIndex: "empName",
      key: "empName",
      width: 140,
      render: (v) => <b>{v}</b>,
    },
    {
      title: t("std.columns.baseSal"),
      dataIndex: "baseSal",
      key: "baseSal",
      width: 140,
      align: "right",
      render: (v) => formatWon(v),
    },
    {
      title: t("std.columns.annuSal"),
      dataIndex: "annuSal",
      key: "annuSal",
      width: 140,
      align: "right",
      render: (v) => formatWon(v),
    },
    {
      title: t("std.columns.startDate"),
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
    },
    {
      title: t("std.columns.endDate"),
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (v) => v || "-",
    },
    {
      title: t("std.columns.status"),
      dataIndex: "actv",
      key: "actv",
      width: 90,
      align: "center",
      render: (v) => (v ? <Tag color="green">{t("std.statusActive")}</Tag> : <Tag>{t("std.statusEnded")}</Tag>),
    },
    {
      title: t("std.columns.actions"),
      key: "actions",
      width: 110,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            title={t("std.editTitle")}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            title={t("std.deleteTitle")}
            onClick={() => setDeleteTarget(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="sb-page">
      <div
        className="sb-page-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("std.breadcrumb")}</div>
          <h1>{t("std.title")}</h1>
          <p>{t("std.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            {t("std.registerBtn")}
          </Button>
        </div>
      </div>

      <Card>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Input
            style={{ width: 180 }}
            placeholder={t("std.searchEmpNamePlaceholder")}
            value={filters.empName}
            onChange={(e) =>
              setFilters((f) => ({ ...f, empName: e.target.value }))
            }
            onPressEnter={() => runSearch(1)}
          />
          <Input
            style={{ width: 160 }}
            placeholder={t("std.searchDeptPlaceholder")}
            value={filters.department}
            onChange={(e) =>
              setFilters((f) => ({ ...f, department: e.target.value }))
            }
            onPressEnter={() => runSearch(1)}
          />
          <Input
            style={{ width: 140 }}
            placeholder={t("std.searchPosPlaceholder")}
            value={filters.position}
            onChange={(e) =>
              setFilters((f) => ({ ...f, position: e.target.value }))
            }
            onPressEnter={() => runSearch(1)}
          />
          <Button icon={<SearchOutlined />} onClick={() => runSearch(1)}>
            {t("std.searchBtn")}
          </Button>
        </div>

        <Table
          rowKey="stdId"
          columns={columns}
          dataSource={stdList}
          loading={loading && !saving && !deleting}
          pagination={false}
          locale={{ emptyText: t("std.emptyText") }}
        />

        {paging && paging.totalElements > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
            }}
          >
            <span style={{ color: "#999", fontSize: 12.5 }}>
              {t("std.totalCount", { count: paging.totalElements })}
            </span>
            <Pagination
              size="small"
              current={page}
              total={paging.totalElements}
              pageSize={paging.size || 10}
              showSizeChanger={false}
              onChange={runSearch}
            />
          </div>
        )}
      </Card>

      {/* 등록/수정 모달 */}
      <Modal
        title={isEditMode ? t("std.modalEditTitle") : t("std.modalAddTitle")}
        open={formTarget !== null}
        onCancel={closeFormModal}
        onOk={handleSubmit}
        okText={isEditMode ? t("std.okTextEdit") : t("std.okTextAdd")}
        okButtonProps={{ loading: saving }}
        cancelText={t("std.cancelText")}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {!isEditMode && (
            <Form.Item
              name="empId"
              label={t("std.empFieldLabel")}
              rules={[{ required: true, message: t("std.empFieldRequired") }]}
            >
              <EmployeePicker />
            </Form.Item>
          )}
          {isEditMode && (
            <Descriptions
              size="small"
              column={1}
              bordered
              style={{ marginBottom: 16 }}
            >
              <Descriptions.Item label={t("std.empFieldLabel")}>
                {formTarget.empName}
              </Descriptions.Item>
            </Descriptions>
          )}
          <Form.Item
            name="baseSal"
            label={t("std.baseSalFieldLabel")}
            rules={[{ required: true, message: t("std.baseSalFieldRequired") }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              step={10000}
              formatter={wonFormatter}
              parser={wonParser}
              placeholder={t("std.baseSalPlaceholder")}
              addonAfter={t("std.wonSuffix")}
            />
          </Form.Item>
          <Form.Item name="annuSal" label={t("std.annuSalFieldLabel")}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={100000}
              formatter={wonFormatter}
              parser={wonParser}
              placeholder={t("std.annuSalPlaceholder")}
              addonAfter={t("std.wonSuffix")}
            />
          </Form.Item>
          <Form.Item
            name="startDate"
            label={t("std.startDateFieldLabel")}
            rules={[{ required: true, message: t("std.startDateFieldRequired") }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title={t("std.deleteModalTitle")}
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
        okText={t("std.okTextDelete")}
        okButtonProps={{ danger: true, loading: deleting }}
        cancelText={t("std.cancelText")}
        destroyOnClose
      >
        <p>
          {t("std.deleteConfirmText", { empName: deleteTarget?.empName })}
        </p>
        <p style={{ color: "#999", fontSize: 13 }}>
          {t("std.deleteWarningText")}
        </p>
      </Modal>
    </div>
  );
}
