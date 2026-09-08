// pages/pos/list.js
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { Card, Table, Button, Tag, Modal, Form, Input, InputNumber, message, } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  listPosRequest, createPosRequest, updatePosRequest,
  deletePosRequest, checkCodeRequest, clearCodeCheck,
  resetPosState,
} from "../../reducers/pos/posReducer";

export default function PosListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["pos", "common"]);
  const [form] = Form.useForm();

  // Redux state
  const { posList, codeCheck, loading, success, error } = useSelector(
    (state) => state.pos
  );

  // 모달 상태: null=닫힘, "add"=등록, {posId,...}=수정 대상
  const [formTarget, setFormTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // 삭제 모달
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ─── 페이지 진입 시 목록 조회 ───
  useEffect(() => {
    dispatch(listPosRequest());

    return () => {
      dispatch(resetPosState());
      dispatch(clearCodeCheck());
    };
  }, [dispatch]);

  // ─── 등록/수정/삭제 결과 처리 ───
  useEffect(() => {
    if (!(saving || deleting) || loading) return;

    if (success) {
      if (saving) {
        message.success(
          formTarget === "add" ? t("list.addSuccessMsg") : t("list.editSuccessMsg")
        );
        closeFormModal();
        dispatch(listPosRequest()); // 목록 새로고침
      }
      if (deleting) {
        message.success(t("list.deleteSuccessMsg"));
        setDeleteTarget(null);
        setDeleting(false);
      }
      dispatch(resetPosState());
    } else if (error) {
      message.error(error);
      setSaving(false);
      setDeleting(false);
      dispatch(resetPosState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error]);

  // ─── 등록/수정 모달 ───
  const openAddModal = () => {
    setFormTarget("add");
    dispatch(clearCodeCheck());
    form.resetFields();
  };

  const openEditModal = (record) => {
    setFormTarget(record);
    dispatch(clearCodeCheck());
    form.setFieldsValue({
      posCode: record.posCode,
      posName: record.posName,
      posOrder: record.posOrder,
    });
  };

  const closeFormModal = () => {
    setFormTarget(null);
    setSaving(false);
    dispatch(clearCodeCheck());
    form.resetFields();
  };

  const isEditMode = formTarget !== null && formTarget !== "add";
  const formTitle = isEditMode ? t("list.editModalTitle") : t("list.addModalTitle");

  // 코드 중복검사 (blur 시)
  const handleCodeBlur = (e) => {
    const value = e.target.value.trim();
    if (!value) return;

    // 수정 모드에서 원래 코드와 같으면 검사 스킵
    if (isEditMode && value === formTarget.posCode) {
      dispatch(clearCodeCheck());
      return;
    }

    dispatch(
      checkCodeRequest({
        posCode: value,
        ...(isEditMode ? { excludePosId: formTarget.posId } : {}),
      })
    );
  };

  // 중복검사 결과에 따른 도움말
  const codeHelp =
    codeCheck === true
      ? { validateStatus: "error", help: t("list.codeUnavailable") }
      : codeCheck === false
        ? { validateStatus: "success", help: t("list.codeAvailable") }
        : {};

  // 폼 제출
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 중복 코드 차단
      if (codeCheck === true) {
        message.warning(t("list.duplicateWarning"));
        return;
      }

      setSaving(true);
      if (isEditMode) {
        dispatch(updatePosRequest({ posId: formTarget.posId, ...values }));
      } else {
        dispatch(createPosRequest(values));
      }
    } catch (e) {
      // Form 자체 검증 실패
    }
  };

  // ─── 삭제 ───
  const confirmDelete = () => {
    setDeleting(true);
    dispatch(deletePosRequest(deleteTarget.posId));
  };

  // ─── 테이블 컬럼 ───
  const columns = [
    {
      title: t("list.table.order"),
      dataIndex: "posOrder",
      key: "posOrder",
      width: 80,
      align: "center",
    },
    {
      title: t("list.table.code"),
      dataIndex: "posCode",
      key: "posCode",
      width: 180,
      render: (code) => <Tag>{code}</Tag>,
    },
    {
      title: t("list.table.name"),
      dataIndex: "posName",
      key: "posName",
      render: (name) => <span style={{ fontWeight: 600 }}>{name}</span>,
    },
    {
      title: t("list.table.actions"),
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            title={t("common:button.edit")}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            title={t("common:button.delete")}
            onClick={() => setDeleteTarget(record)}
          />
        </div>
      ),
    },
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
            {t("list.breadcrumbOrg")} &gt; {t("list.breadcrumbCurrent")} &gt; {t("common:button.list")}
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

      {/* 목록 카드 */}
      <Card>
        <Table
          rowKey="posId"
          columns={columns}
          dataSource={posList}
          loading={loading && !saving && !deleting}
          pagination={false}
          locale={{ emptyText: t("list.emptyMsg") }}
        />
      </Card>

      {/* 안내 문구 */}
      <div style={{ marginTop: 12, color: "#999", fontSize: 13 }}>
        {t("list.deleteHint")}
      </div>

      {/* ── 등록/수정 모달 ── */}
      <Modal
        title={formTitle}
        open={formTarget !== null}
        onCancel={closeFormModal}
        onOk={handleSubmit}
        okText={isEditMode ? t("common:button.edit") : t("common:button.add")}
        okButtonProps={{ loading: saving, disabled: codeCheck === true }}
        cancelText={t("common:button.cancel")}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="posCode"
            label={t("list.codeLabel")}
            rules={[{ required: true, message: t("list.codeRequired") }]}
            extra={t("list.codeExtra")}
            {...codeHelp}
          >
            <Input
              placeholder={t("list.codePlaceholder")}
              maxLength={20}
              onBlur={handleCodeBlur}
            />
          </Form.Item>

          <Form.Item
            name="posName"
            label={t("list.nameLabel")}
            rules={[{ required: true, message: t("list.nameRequired") }]}
          >
            <Input placeholder={t("list.namePlaceholder")} maxLength={50} />
          </Form.Item>

          <Form.Item
            name="posOrder"
            label={t("list.orderLabel")}
            rules={[{ required: true, message: t("list.orderRequired") }]}
            extra={t("list.orderExtra")}
          >
            <InputNumber
              placeholder={t("list.orderPlaceholder")}
              min={1}
              style={{ width: "100%" }}
            />
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
          {t("list.deleteConfirmMsg", { posName: deleteTarget?.posName })}
        </p>
        <p style={{ color: "#999", fontSize: 13 }}>
          {t("list.deleteHint2")}
        </p>
      </Modal>
    </div>
  );
}
