// pages/careers/my.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  List,
  Tag,
  Button,
  Empty,
  Skeleton,
  Modal,
  Upload,
  Form,
  Input,
  message,
  Popconfirm,
} from "antd";
import { InboxOutlined, FilePdfOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";
import apctApi from "../../api/apctAxios";

import ApplicantLayout from "../../components/ApplicantLayout";
import {
  fetchMyApplicationsRequest,
  cancelApplicationRequest,
  updateApplicationRequest,
  resetApplicantPublicState,
} from "../../reducers/apct/applicantPublicReducer";
import {
  uploadResumeRequest,
  resetResumePublicState,
} from "../../reducers/rsm/resumePublicReducer";

const STATUS_COLOR = {
  RECEIVED: "st-default",
  SCREENING: "st-blue",
  INTERVIEW: "st-purple",
  HIRED: "st-green",
  REJECTED: "st-red",
};

const STATUS_LABEL_KEY = {
  RECEIVED: "received",
  SCREENING: "screening",
  INTERVIEW: "interview",
  HIRED: "hired",
  REJECTED: "rejected",
};

export default function CareersMyPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("careers");
  const { apctAccessToken } = useSelector((state) => state.apctAuth);
  const { myApplications, myApplicationsLoading, cancelLoading, cancelSuccess, cancelError, updateLoading, updateSuccess, updateError } =
    useSelector((state) => state.applicantPublic);
  const { uploadLoading, uploadSuccess, uploadError } = useSelector(
    (state) => state.resumePublic,
  );

  const [uploadTarget, setUploadTarget] = useState(null); // apctId | null
  const [fileList, setFileList] = useState([]);

  const [editTarget, setEditTarget] = useState(null); // apctId | null
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (!apctAccessToken) return;
    dispatch(fetchMyApplicationsRequest());
    if (router.query.apctId) {
      setUploadTarget(Number(router.query.apctId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apctAccessToken]);

  useEffect(() => {
    if (cancelLoading) return;
    if (cancelSuccess) {
      message.success(t("my.cancelSuccess"));
      dispatch(resetApplicantPublicState());
    } else if (cancelError) {
      message.error(cancelError);
      dispatch(resetApplicantPublicState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelLoading, cancelSuccess, cancelError]);

  useEffect(() => {
    if (updateLoading) return;
    if (updateSuccess) {
      message.success(t("my.updateSuccess"));
      closeEditModal();
    } else if (updateError) {
      message.error(updateError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateLoading, updateSuccess, updateError]);

  useEffect(() => {
    if (uploadLoading) return;
    if (uploadSuccess) {
      message.success(t("my.uploadSuccess"));
      closeUploadModal();
    } else if (uploadError) {
      message.error(uploadError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadLoading, uploadSuccess, uploadError]);

  const closeUploadModal = () => {
    setUploadTarget(null);
    setFileList([]);
    dispatch(resetResumePublicState());
  };

  const openEditModal = (item) => {
    setEditTarget(item.apctId);
    editForm.setFieldsValue({
      apctName: item.apctName,
      apctEmail: item.apctEmail,
      apctPhone: item.apctPhone,
    });
  };

  const closeEditModal = () => {
    setEditTarget(null);
    editForm.resetFields();
    dispatch(resetApplicantPublicState());
  };

  const handleEditSubmit = () => {
    editForm.validateFields().then((values) => {
      dispatch(
        updateApplicationRequest({
          apctId: editTarget,
          ...values,
        }),
      );
    });
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning(t("my.selectFileWarning"));
      return;
    }
    dispatch(
      uploadResumeRequest({ apctId: uploadTarget, file: fileList[0].originFileObj || fileList[0] }),
    );
  };

  const handleCancel = (apctId) => {
    dispatch(cancelApplicationRequest(apctId));
  };
  // 이력서 미리보기
  const handlePreviewResume = async (apctId) => {
    try {
      const response = await apctApi.get(`/api/public/resume/my/${apctId}/preview`, {
        responseType: "blob",
      });
      const fileURL = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(fileURL, "_blank");
    } catch (err) {
      message.error(t("my.previewError"));
    }
  };
  return (
    <ApplicantLayout>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#14251f", marginBottom: 6 }}>
          {t("my.title")}
        </h1>
        <p style={{ color: "#778", fontSize: 14 }}>
          {t("my.subtitle")}
        </p>
      </div>

      {myApplicationsLoading && <Skeleton active paragraph={{ rows: 4 }} />}

      {!myApplicationsLoading && myApplications.length === 0 && (
        <Empty description={t("my.emptyDescription")} style={{ padding: "60px 0" }} />
      )}

      {!myApplicationsLoading && myApplications.length > 0 && (
        <List
          itemLayout="horizontal"
          dataSource={myApplications}
          renderItem={(item) => {
            const statusText = STATUS_LABEL_KEY[item.apctStatus]
              ? t(`my.statusLabels.${STATUS_LABEL_KEY[item.apctStatus]}`)
              : item.apctStatus;
            const statusColor = STATUS_COLOR[item.apctStatus] || "st-default";
            const canEdit = item.apctStatus === "RECEIVED";
            return (
              <List.Item
                className="crc-list-item"
                style={{
                  background: "#fff",
                  border: "1px solid #e6ebe8",
                  borderRadius: 10,
                  padding: "16px 20px",
                  marginBottom: 10,
                }}
                actions={[
                  canEdit && (
                    <Button
                      key="edit"
                      size="small"
                      className="crc-btn"
                      icon={<EditOutlined />}
                      onClick={() => openEditModal(item)}
                    >
                      {t("my.editBtn")}
                    </Button>
                  ),
                  item.resumeFileName && (
                    <Button
                      key="preview"
                      size="small"
                      className="crc-btn"
                      icon={<FilePdfOutlined />}
                      onClick={() => handlePreviewResume(item.apctId)}
                    >
                      {t("my.previewResumeBtn")}
                    </Button>
                  ),
                  canEdit && (
                    <Button
                      key="upload"
                      size="small"
                      className="crc-btn"
                      icon={<FilePdfOutlined />}
                      onClick={() => setUploadTarget(item.apctId)}
                    >
                    {t("my.resumeBtn")}
                    </Button>
                  ),
                  canEdit && (
                    <Popconfirm
                      key="cancel"
                      title={t("my.cancelConfirmTitle")}
                      okText={t("my.cancelOkText")}
                      cancelText={t("my.cancelCancelText")}
                      onConfirm={() => handleCancel(item.apctId)}
                    >
                      <Button size="small" danger className="crc-btn-danger" icon={<DeleteOutlined />} loading={cancelLoading}>
                        {t("my.cancelBtn")}
                      </Button>
                    </Popconfirm>
                  ),
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  title={
                    <span>
                      {item.recTitle}
                      <Tag className={`crc-status-tag ${statusColor}`} style={{ marginLeft: 10 }}>
                        {statusText}
                      </Tag>
                      {item.resumeFileName && (
                        <Tag color="cyan" style={{ marginLeft: 6 }}>
                          {t("my.resumeSubmittedTag")}
                        </Tag>
                      )}
                    </span>
                  }
                  description={
                    item.apctDate
                      ? t("my.appliedDate", { date: moment(item.apctDate).format("YYYY-MM-DD") })
                      : undefined
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      {/* 이력서 업로드 모달 */}
      <Modal
        title={t("my.uploadModal.title")}
        open={uploadTarget !== null}
        onCancel={closeUploadModal}
        onOk={handleUpload}
        okText={t("my.uploadModal.okText")}
        cancelText={t("my.uploadModal.cancelText")}
        okButtonProps={{ loading: uploadLoading, className: "crc-btn" }}
        cancelButtonProps={{ className: "crc-btn" }}
        destroyOnClose
      >
        <Upload.Dragger
          accept="application/pdf"
          maxCount={1}
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
          onRemove={() => setFileList([])}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t("my.uploadModal.dragText")}</p>
          <p className="ant-upload-hint">{t("my.uploadModal.dragHint")}</p>
        </Upload.Dragger>
      </Modal>

      {/* 지원 정보 수정 모달 */}
      <Modal
        title={t("my.editModal.title")}
        open={editTarget !== null}
        onCancel={closeEditModal}
        onOk={handleEditSubmit}
        okText={t("my.editModal.okText")}
        cancelText={t("my.editModal.cancelText")}
        okButtonProps={{ loading: updateLoading, className: "crc-btn" }}
        cancelButtonProps={{ className: "crc-btn" }}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="apctName"
            label={t("my.editModal.nameLabel")}
            rules={[{ required: true, message: t("my.editModal.nameRequired") }]}
          >
            <Input placeholder={t("my.editModal.namePlaceholder")} />
          </Form.Item>
          <Form.Item
            name="apctEmail"
            label={t("my.editModal.emailLabel")}
            rules={[
              { required: true, message: t("my.editModal.emailRequired") },
              { type: "email", message: t("my.editModal.emailInvalid") },
            ]}
          >
            <Input placeholder={t("my.editModal.emailPlaceholder")} />
          </Form.Item>
          <Form.Item
            name="apctPhone"
            label={t("my.editModal.phoneLabel")}
            rules={[{ required: true, message: t("my.editModal.phoneRequired") }]}
          >
            <Input placeholder={t("my.editModal.phonePlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>
    </ApplicantLayout>
  );
}