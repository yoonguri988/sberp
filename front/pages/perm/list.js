// pages/perm/list.js
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { Row, Col, Card, Table, Button, Modal, Form, Input, Badge, Avatar, message, } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  listPermRequest, detailPermRequest, createPermRequest,
  updatePermRequest, deletePermRequest, clearPermDetail,
  resetPermState,
} from "../../reducers/perm/permReducer";

export default function PermListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["perm", "common"]);
  const [form] = Form.useForm();

  const {
    permList, currentPerm, permEmployees,
    loading, success, error,
  } = useSelector((state) => state.perm);

  // 선택된 권한 ID
  const [selectedId, setSelectedId] = useState(null);

  // 등록/수정 모달
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // 삭제 모달
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ─── 페이지 진입 시 목록 조회 ───
  useEffect(() => {
    dispatch(listPermRequest());
    // URL에 autId가 있으면 자동 선택
    if (router.query.autId) {
      const id = Number(router.query.autId);
      setSelectedId(id);
      dispatch(detailPermRequest(id));
    }
    // 페이지 떠날 때 상태 초기화
    return () => {
      dispatch(clearPermDetail());
      dispatch(resetPermState());
    };
  }, [dispatch, router.query.autId]);

  // ─── 등록/수정/삭제 결과 처리 ───
  useEffect(() => {
    if (!(saving || deleting) || loading) return;

    if (success) {
      if (saving) {
        message.success(
          formTarget === "add" ? t("list.addSuccessMsg") : t("list.editSuccessMsg")
        );
        closeFormModal();
        dispatch(listPermRequest());
        // 수정한 권한이 선택 중이면 상세도 갱신
        if (formTarget !== "add" && selectedId) {
          dispatch(detailPermRequest(selectedId));
        }
      }
      if (deleting) {
        message.success(t("list.deleteSuccessMsg"));
        setDeleteTarget(null);
        setDeleting(false);
        setSelectedId(null);
        dispatch(clearPermDetail());
        dispatch(listPermRequest());
      }
      dispatch(resetPermState());
    } else if (error) {
      message.error(error);
      setSaving(false);
      setDeleting(false);
      dispatch(resetPermState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error]);

  // ─── 권한 선택 ───
  const handleSelectRole = (autId) => {
    setSelectedId(autId);
    dispatch(detailPermRequest(autId));
    router.push({ pathname: "/perm/list", query: { autId } }, undefined, {
      shallow: true,
    });
  };

  // ─── 등록/수정 모달 ───
  const openAddModal = () => {
    setFormTarget("add");
    form.resetFields();
  };

  const openEditModal = () => {
    if (!currentPerm) return;
    setFormTarget(currentPerm);
    form.setFieldsValue({ autName: currentPerm.autName });
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
      setSaving(true);
      if (isEditMode) {
        dispatch(updatePermRequest({ autId: formTarget.autId, ...values }));
      } else {
        dispatch(createPermRequest(values));
      }
    } catch (e) {}
  };

  // ─── 삭제 ───
  const confirmDelete = () => {
    setDeleting(true);
    dispatch(deletePermRequest(deleteTarget.autId));
  };

  // ─── 부여된 사원 테이블 컬럼 ───
  const empColumns = [
    {
      title: t("list.empTable.emp"),
      key: "emp",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small">
            {record.empName ? record.empName.charAt(0) : "?"}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{record.empName}</div>
            <div style={{ fontSize: 12, color: "#999" }}>{record.empNo}</div>
          </div>
        </div>
      ),
    },
    { title: t("list.empTable.dept"), dataIndex: "deptName", key: "deptName" },
    { title: t("list.empTable.pos"), dataIndex: "posName", key: "posName" },
  ];

  //////
  return (
    <div className="sb-page">
      {/* 페이지 헤더 */}
      <div
        className="sb-page-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common.breadcrumbOrg")} &gt; {t("list.breadcrumbCurrent")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>
            {t("list.subtitle")}
          </p>
        </div>
        <div className="sb-page-head__actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            {t("list.addBtn")}
          </Button>
        </div>
      </div>

      <Row gutter={16}>
        {/* ── 좌측: 권한 목록 ── */}
        <Col xs={24} lg={8}>
          <Card
            title={t("list.listCardTitle")}
            extra={<span style={{ color: "#999" }}>{t("list.countSuffix", { count: permList.length })}</span>}
          >
            {permList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                <SafetyCertificateOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p>{t("list.emptyMsg")}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {permList.map((item) => (
                  <div
                    key={item.autId}
                    onClick={() => handleSelectRole(item.autId)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      background:
                        selectedId === item.autId ? "#e6f4ff" : "transparent",
                      border:
                        selectedId === item.autId
                          ? "1px solid #91caff"
                          : "1px solid transparent",
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{item.autName}</span>
                    <Badge
                      count={t("list.empCountSuffix", { count: item.autCount || 0 })}
                      style={{ backgroundColor: "#f0f0f0", color: "#666" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* ── 우측: 권한 상세 ── */}
        <Col xs={24} lg={16}>
          <Card>
            {!currentPerm ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
                <SafetyCertificateOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p>{t("list.selectHint")}</p>
                <p>{t("list.selectHint2")}</p>
              </div>
            ) : (
              <>
                {/* 권한 헤더 */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 700 }}>
                    {currentPerm.autName}
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={openEditModal}
                    >
                      {t("common:button.edit")}
                    </Button>
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setDeleteTarget(currentPerm)}
                    >
                      {t("common:button.delete")}
                    </Button>
                  </div>
                </div>

                {/* 부여된 사원 목록 */}
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{t("list.assignedEmpLabel")}</span>
                  <span style={{ color: "#999", marginLeft: 8 }}>
                    {t("list.empCountSuffix", { count: permEmployees.length })}
                  </span>
                </div>
                <Table
                  rowKey="empId"
                  columns={empColumns}
                  dataSource={permEmployees}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total) => t("list.paginationTotal", { total }),
                    showSizeChanger: false,
                  }}
                  size="small"
                  locale={{ emptyText: t("list.empEmptyMsg") }}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* ── 등록/수정 모달 ── */}
      <Modal
        title={isEditMode ? t("list.editModalTitle") : t("list.addModalTitle")}
        open={formTarget !== null}
        onCancel={closeFormModal}
        onOk={handleSubmit}
        okText={isEditMode ? t("common:button.edit") : t("common:button.add")}
        okButtonProps={{ loading: saving }}
        cancelText={t("common:button.cancel")}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="autName"
            label={t("list.nameLabel")}
            rules={[{ required: true, message: t("list.nameRequired") }]}
            extra={t("list.nameExtra")}
          >
            <Input placeholder={t("list.namePlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 삭제 확인 모달 ── */}
      <Modal
        title={t("list.deleteModalTitle")}
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
        okText={t("common:button.delete")}
        okButtonProps={{ danger: true, loading: deleting }}
        cancelText={t("common:button.cancel")}
        destroyOnClose
      >
        <p>
          {t("list.deleteConfirmMsg", { autName: deleteTarget?.autName })}
        </p>
        <p style={{ color: "#999", fontSize: 13 }}>
          {t("list.deleteHint")}
        </p>
      </Modal>
    </div>
  );
}
