// pages/sal/ai-doc-admin.js
// AI 급여 Q&A 근거 문서(급여 규정집/수당기준/연말정산 가이드 PDF) 관리 (ROLE_ADMIN)
// GET/POST /api/salai/docs — 업로드 시 기존 활성 문서는 자동 이력 처리(actv=false)되고
// 새 버전이 청킹+임베딩되어 RAG 검색 대상에 반영된다.
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
  Upload,
  message,
  Alert,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import moment from "moment";

import {
  listSalAiDocRequest,
  uploadSalAiDocRequest,
  resetSalAiDocState,
} from "../../reducers/sal/salAiDocReducer";

export default function SalAiDocAdminPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const [form] = Form.useForm();

  const {
    docList,
    listLoading,
    listError,
    uploadLoading,
    uploadSuccess,
    uploadError,
  } = useSelector((state) => state.salAiDoc);

  const [modalOpen, setModalOpen] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    dispatch(listSalAiDocRequest());
    return () => dispatch(resetSalAiDocState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!uploadLoading) {
      if (uploadSuccess) {
        message.success(t("aidocAdmin.uploadSuccessMsg"));
        closeModal();
        dispatch(resetSalAiDocState());
        dispatch(listSalAiDocRequest());
      } else if (uploadError) {
        message.error(uploadError);
        dispatch(resetSalAiDocState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadLoading, uploadSuccess, uploadError]);

  const openModal = () => {
    setModalOpen(true);
    form.resetFields();
    setFileList([]);
  };
  const closeModal = () => {
    setModalOpen(false);
    setFileList([]);
    form.resetFields();
  };

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.warning(t("aidocAdmin.selectFileWarning"));
        return;
      }
      dispatch(
        uploadSalAiDocRequest({
          file: fileList[0].originFileObj,
          title: values.title,
        }),
      );
    } catch (e) {
      // 폼 자체 검증 실패
    }
  };

  const columns = [
    {
      title: t("aidocAdmin.columns.version"),
      dataIndex: "docVersion",
      key: "docVersion",
      width: 80,
      align: "center",
      render: (v) => <b>v{v}</b>,
    },
    {
      title: t("aidocAdmin.columns.title"),
      dataIndex: "title",
      key: "title",
    },
    {
      title: t("aidocAdmin.columns.srcFileName"),
      dataIndex: "srcFileName",
      key: "srcFileName",
    },
    {
      title: t("aidocAdmin.columns.chunkCount"),
      dataIndex: "chunkCount",
      key: "chunkCount",
      width: 110,
      align: "center",
    },
    {
      title: t("aidocAdmin.columns.status"),
      dataIndex: "actv",
      key: "actv",
      width: 100,
      align: "center",
      render: (v) =>
        v ? <Tag color="green">{t("aidocAdmin.statusActive")}</Tag> : <Tag>{t("aidocAdmin.statusInactive")}</Tag>,
    },
    {
      title: t("aidocAdmin.columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (v) => (v ? moment(v).format("YYYY-MM-DD HH:mm") : "-"),
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
          <div className="sb-breadcrumb">
            {t("aidocAdmin.breadcrumb")}
          </div>
          <h1>{t("aidocAdmin.title")}</h1>
          <p>
            {t("aidocAdmin.subtitle")}
          </p>
        </div>
        <div className="sb-page-head__actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
            {t("aidocAdmin.registerBtn")}
          </Button>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={t("aidocAdmin.infoAlert")}
      />

      <Card>
        <Table
          rowKey="docId"
          columns={columns}
          dataSource={docList}
          loading={listLoading}
          pagination={false}
          locale={{ emptyText: t("aidocAdmin.emptyText") }}
        />
        {listError && (
          <p style={{ color: "red", marginTop: 12 }}>{listError}</p>
        )}
      </Card>

      <Modal
        title={t("aidocAdmin.modalTitle")}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleUpload}
        okText={t("aidocAdmin.okText")}
        okButtonProps={{ loading: uploadLoading }}
        cancelText={t("aidocAdmin.cancelText")}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label={t("aidocAdmin.titleFieldLabel")}>
            <Input placeholder={t("aidocAdmin.titleFieldPlaceholder")} maxLength={100} />
          </Form.Item>
          <Form.Item
            label={t("aidocAdmin.fileFieldLabel")}
            required
            extra={t("aidocAdmin.fileFieldExtra")}
          >
            <Upload
              accept="application/pdf"
              beforeUpload={(file) => {
                const isPdf = file.type === "application/pdf";
                if (!isPdf) {
                  message.error(t("aidocAdmin.pdfOnlyError"));
                  return Upload.LIST_IGNORE;
                }
                const isUnder5MB = file.size / 1024 / 1024 < 5;
                if (!isUnder5MB) {
                  message.error(t("aidocAdmin.fileSizeError"));
                  return Upload.LIST_IGNORE;
                }
                return false;
              }}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList.slice(-1))}
              onRemove={() => setFileList([])}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>{t("aidocAdmin.selectFileBtn")}</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
