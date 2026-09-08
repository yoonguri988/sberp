// pages/com/add.js
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Upload,
  Modal,
  Card,
  Row,
  Col,
  Alert,
  Spin,
  message,
} from "antd";
import {
  TagOutlined,
  BankOutlined,
  PictureOutlined,
  ArrowLeftOutlined,
  CameraOutlined,
  CheckOutlined,
  UploadOutlined,
  InfoCircleOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useTranslation } from "react-i18next";

import {
  addCompanyRequest,
  checkBizNoRequest,
  resetCompanyState,
} from "../../reducers/com/companyReducer";
import {
  verifyBizNoRequest,
  processOcrRequest,
  resetApiUtilState,
} from "../../reducers/api/apiUtilReducer";
import {
  GRP_OPTIONS,
  getCodeOptions,
  matchGrpFromText,
  matchCodeFromText,
} from "../../constants/industryCode";

const BIZNO_PATTERN = /^\d{3}-\d{2}-\d{5}$/;

export default function ComAddPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation(["com", "common"]);

  const { loading, error, success, bizNoCheck } = useSelector(
    (state) => state.company,
  );
  const {
    loading: utilLoading,
    bizNoVerifyResult,
    ocrResult,
  } = useSelector((state) => state.apiUtil);

  const [industryGrpCode, setIndustryGrpCode] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 진위확인 스냅샷: 마지막으로 성공한 bizNo/startDt/ceoName. null이면 미확인/무효화 상태.
  const [verifiedSnapshot, setVerifiedSnapshot] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // OCR 모달
  const [ocrOpen, setOcrOpen] = useState(false);
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrLoadingLocal, setOcrLoadingLocal] = useState(false);
  const [ocrForm, setOcrForm] = useState(null); // { bizNo, comName, comCeo, startDt, industryGrpCode, industryCode, grpRaw, codeRaw }

  const codeOptions = useMemo(
    () => getCodeOptions(industryGrpCode, i18n.language),
    [industryGrpCode, i18n.language],
  );
  const ocrCodeOptions = useMemo(
    () => getCodeOptions(ocrForm?.industryGrpCode, i18n.language),
    [ocrForm?.industryGrpCode, i18n.language],
  );
  const grpOptions = useMemo(
    () =>
      GRP_OPTIONS.map((o) => ({
        value: o.value,
        label: i18n.language === "en" ? o.labelEn : o.label,
      })),
    [i18n.language],
  );

  // 등록 성공/실패 처리
  useEffect(() => {
    if (!submitting || loading) return;
    if (success) {
      message.success(t("add.messages.success"));
      dispatch(resetCompanyState());
      setSubmitting(false);
      router.push("/com/list");
    } else if (error) {
      message.error(error);
      setSubmitting(false);
      dispatch(resetCompanyState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, submitting]);

  // 사업자번호 중복확인 결과 반영
  useEffect(() => {
    if (!bizNoCheck.checked) return;
    if (bizNoCheck.duplicate) {
      form.setFields([
        { name: "bizNo", errors: [t("add.messages.bizNoDuplicate")] },
      ]);
    } else {
      form.setFields([{ name: "bizNo", errors: [] }]);
    }
  }, [bizNoCheck]); // eslint-disable-line react-hooks/exhaustive-deps

  // 국세청 진위확인 결과 반영
  useEffect(() => {
    if (!verifying || utilLoading) return;
    setVerifying(false);
    const fields = form.getFieldsValue();
    const item = bizNoVerifyResult?.data?.[0];

    if (bizNoVerifyResult?.status_code === "OK" && item?.valid === "01") {
      setVerifiedSnapshot({
        bizNo: fields.bizNo,
        startDt: fields.startDt ? fields.startDt.format("YYYY-MM-DD") : "",
        ceoName: fields.comCeo,
      });
      message.success(t("add.verify.success"));
    } else {
      setVerifiedSnapshot(null);
      message.error(item?.valid_msg || t("add.verify.failDefault"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilLoading, verifying, bizNoVerifyResult]);

  // OCR 결과 반영
  useEffect(() => {
    // 요청이 아직 진행중(utilLoading)이면 대기 - ocrResult가 아직 초기화(null)된
    // 상태에서 effect가 먼저 실행되어 "실패"로 오판하는 것을 방지
    if (!ocrLoadingLocal || utilLoading) return;
    setOcrLoadingLocal(false);
    if (!ocrResult) {
      message.warning(t("add.ocr.fail"));
      return;
    }
    const grpCode = matchGrpFromText(ocrResult.industryGrpText);
    const detailCode = matchCodeFromText(grpCode, ocrResult.industryCodeText);
    setOcrForm({
      bizNo: ocrResult.bizNo || "",
      comName: ocrResult.comName || "",
      comCeo: ocrResult.comCeo || "",
      startDt: ocrResult.startDt || "",
      industryGrpCode: grpCode,
      industryCode: detailCode,
      grpRaw: ocrResult.industryGrpText || "",
      codeRaw: ocrResult.industryCodeText || "",
    });
    message.success(t("add.ocr.success"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrLoadingLocal, utilLoading, ocrResult]);

  const isVerified = (fields) =>
    verifiedSnapshot !== null &&
    verifiedSnapshot.bizNo === fields.bizNo &&
    verifiedSnapshot.startDt ===
      (fields.startDt ? fields.startDt.format("YYYY-MM-DD") : "") &&
    verifiedSnapshot.ceoName === fields.comCeo;

  const handleBizFieldsChange = () => {
    // 진위확인 대상 필드가 바뀌면 스냅샷 무효화 (재확인 유도)
    if (verifiedSnapshot === null) return;
    const fields = form.getFieldsValue();
    if (!isVerified(fields)) setVerifiedSnapshot(null);
  };

  const handleBizNoBlur = () => {
    const bizNo = form.getFieldValue("bizNo");
    if (bizNo && BIZNO_PATTERN.test(bizNo)) {
      dispatch(checkBizNoRequest(bizNo));
    }
  };

  const handleVerifyBizNo = () => {
    const fields = form.getFieldsValue();
    if (!BIZNO_PATTERN.test(fields.bizNo || "")) {
      message.error(t("add.verify.bizNoFormatRequired"));
      return;
    }
    if (!fields.startDt) {
      message.error(t("add.verify.startDtRequired"));
      return;
    }
    if (!fields.comCeo) {
      message.error(t("add.verify.ceoRequired"));
      return;
    }
    setVerifying(true);
    dispatch(
      verifyBizNoRequest({
        bizNo: fields.bizNo,
        startDt: fields.startDt.format("YYYY-MM-DD"),
        ceoName: fields.comCeo,
      }),
    );
  };

  const handleLogoChange = (info) => {
    const file = info.file?.originFileObj || info.file;
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      message.error(t("form.logoSizeError"));
      return;
    }
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    form.resetFields();
    setIndustryGrpCode("");
    setLogoFile(null);
    setLogoPreview("");
    setVerifiedSnapshot(null);
    dispatch(resetApiUtilState());
  };

  const handleOcrFileChange = (info) => {
    const file = info.file?.originFileObj || info.file;
    if (!file) return;
    setOcrFile(file);
    setOcrLoadingLocal(true);
    dispatch(processOcrRequest(file));
  };

  const applyOcrToForm = () => {
    if (!ocrForm) return;
    form.setFieldsValue({
      bizNo: ocrForm.bizNo,
      comName: ocrForm.comName,
      comCeo: ocrForm.comCeo,
      startDt: ocrForm.startDt ? moment(ocrForm.startDt, "YYYY-MM-DD") : null,
      industryGrpCode: ocrForm.industryGrpCode,
      industryCode: ocrForm.industryCode,
    });
    setIndustryGrpCode(ocrForm.industryGrpCode);
    setVerifiedSnapshot(null);
    setOcrOpen(false);
    setOcrForm(null);
    setOcrFile(null);
  };

  const closeOcrModal = () => {
    setOcrOpen(false);
    setOcrForm(null);
    setOcrFile(null);
    dispatch(resetApiUtilState());
  };

  const onFinish = (values) => {
    if (!isVerified(values)) {
      message.error(t("add.verify.requiredBeforeSubmit"));
      return;
    }
    const dto = {
      industryGrpCode: values.industryGrpCode,
      industryCode: values.industryCode,
      comName: values.comName,
      comCeo: values.comCeo,
      bizNo: values.bizNo,
      comTel: values.comTel,
    };
    setSubmitting(true);
    dispatch(addCompanyRequest({ dto, logoFile }));
  };

  return (
    <div className="sb-page">
      {/* 페이지 헤더 */}
      <div
        className="sb-page-head"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("breadcrumb.home")}</Link> <span>&gt;</span>{" "}
            <Link href="/com/list">{t("breadcrumb.comManagement")}</Link>{" "}
            <span>&gt;</span> {t("breadcrumb.add")}
          </div>
          <h1>{t("add.title")}</h1>
          <p>{t("add.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions" style={{ display: "flex", gap: 8 }}>
          <Button icon={<CameraOutlined />} onClick={() => setOcrOpen(true)}>
            {t("add.ocrButton")}
          </Button>
          <Link href="/com/list">
            <Button icon={<ArrowLeftOutlined />}>{t("form.backToListButton")}</Button>
          </Link>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleBizFieldsChange}
        initialValues={{ industryGrpCode: "", industryCode: "" }}
      >
        {/* ① 업종 분류 */}
        <Card
          className="sb-card mb-3"
          title={
            <span>
              <TagOutlined className="me-2 text-soft" /> {t("form.industryCard")}
            </span>
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("form.industryLabel")}
                name="industryGrpCode"
                rules={[{ required: true, message: t("form.industryRequired") }]}
              >
                <Select
                  placeholder={t("form.industryPlaceholder")}
                  options={grpOptions}
                  onChange={(v) => {
                    setIndustryGrpCode(v);
                    form.setFieldsValue({ industryCode: undefined });
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("form.detailIndustryLabel")}
                name="industryCode"
                rules={[{ required: true, message: t("form.detailIndustryRequired") }]}
              >
                <Select
                  placeholder={
                    industryGrpCode
                      ? t("form.detailIndustryPlaceholder")
                      : t("form.detailIndustryPlaceholderDisabled")
                  }
                  disabled={!industryGrpCode}
                  options={codeOptions}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ② 기본 정보 */}
        <Card
          className="sb-card mb-3"
          title={
            <span>
              <BankOutlined className="me-2 text-soft" /> {t("form.basicInfoCard")}
            </span>
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                label={t("form.comNameLabel")}
                name="comName"
                rules={[{ required: true, message: t("form.comNameRequired") }]}
              >
                <Input placeholder={t("form.comNamePlaceholder")} maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label={t("form.ceoLabel")}
                name="comCeo"
                rules={[{ required: true, message: t("form.ceoRequired") }]}
              >
                <Input placeholder={t("form.ceoPlaceholder")} maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("form.bizNoLabel")}
                name="bizNo"
                validateTrigger="onBlur"
                rules={[
                  {
                    pattern: BIZNO_PATTERN,
                    message: t("form.bizNoFormatError"),
                  },
                  { required: true, message: t("form.bizNoRequired") },
                ]}
                extra={t("form.bizNoExtra")}
              >
                <Input placeholder={t("form.bizNoPlaceholder")} maxLength={45} onBlur={handleBizNoBlur} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label={t("form.telLabel")} name="comTel" extra={t("form.telExtra")}>
                <Input placeholder={t("form.telPlaceholder")} maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={t("add.startDtLabel")}
                name="startDt"
                rules={[{ required: true, message: t("add.startDtRequired") }]}
                extra={t("add.startDtExtra")}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} style={{ display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", marginBottom: 24 }}>
                <Button
                  block
                  icon={<SafetyCertificateOutlined />}
                  onClick={handleVerifyBizNo}
                  loading={verifying && utilLoading}
                  danger={verifiedSnapshot === null && verifying === false && bizNoVerifyResult != null}
                >
                  {t("add.verifyButton")}
                </Button>
                <div style={{ marginTop: 6, fontSize: 13 }}>
                  {verifiedSnapshot ? (
                    <span style={{ color: "#389e0d" }}>
                      <CheckCircleFilled /> {t("add.verifiedText")}
                    </span>
                  ) : (
                    <span className="text-faint">
                      <InfoCircleOutlined /> {t("add.unverifiedText")}
                    </span>
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* ③ 회사 로고 */}
        <Card
          className="sb-card mb-3"
          title={
            <span>
              <PictureOutlined className="me-2 text-soft" /> {t("form.logoCard")}
            </span>
          }
          extra={<span className="sub">{t("form.logoExtra")}</span>}
        >
          <div className="logo-zone" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div
              className="logo-preview"
              style={{
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #eee",
                borderRadius: 8,
                overflow: "hidden",
                fontSize: 28,
              }}
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt={t("form.logoPreviewAlt")}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <BankOutlined />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <Upload
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleLogoChange}
              >
                <Button icon={<UploadOutlined />}>{t("form.logoSelectButton")}</Button>
              </Upload>
              <div className="text-faint mt-1" style={{ fontSize: 12 }}>
                {t("add.logoHint")}
              </div>
            </div>
          </div>
        </Card>

        {/* 폼 버튼 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={handleReset}>{t("form.resetButton")}</Button>
          <Link href="/com/list">
            <Button>{t("form.listButton")}</Button>
          </Link>
          <Button type="primary" htmlType="submit" icon={<CheckOutlined />} loading={submitting && loading}>
            {t("add.submitButton")}
          </Button>
        </div>
      </Form>

      {/* OCR 자동입력 모달 */}
      <Modal
        title={
          <span>
            <CameraOutlined /> {t("add.ocr.modalTitle")}
          </span>
        }
        open={ocrOpen}
        onCancel={closeOcrModal}
        width={720}
        footer={[
          <Button key="cancel" onClick={closeOcrModal}>
            {t("add.ocr.cancelButton")}
          </Button>,
          <Button
            key="apply"
            type="primary"
            icon={<CheckOutlined />}
            disabled={!ocrForm}
            onClick={applyOcrToForm}
          >
            {t("add.ocr.applyButton")}
          </Button>,
        ]}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8 }}>{t("add.ocr.uploadLabel")}</div>
          <Upload
            accept="image/*,.pdf"
            showUploadList={ocrFile ? [{ uid: "-1", name: ocrFile.name, status: "done" }] : false}
            fileList={ocrFile ? [{ uid: "-1", name: ocrFile.name, status: "done" }] : []}
            beforeUpload={() => false}
            onChange={handleOcrFileChange}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>{t("add.ocr.selectFileButton")}</Button>
          </Upload>
        </div>

        {ocrLoadingLocal && (
          <div style={{ marginBottom: 16 }}>
            <Spin size="small" /> {t("add.ocr.recognizing")}
          </div>
        )}

        {ocrForm && (
          <Row gutter={16}>
            <Col span={12}>
              <div className="sb-form-label">{t("add.ocr.bizNoLabel")}</div>
              <Input
                value={ocrForm.bizNo}
                onChange={(e) => setOcrForm({ ...ocrForm, bizNo: e.target.value })}
                placeholder="000-00-00000"
              />
            </Col>
            <Col span={12}>
              <div className="sb-form-label">{t("add.ocr.comNameLabel")}</div>
              <Input
                value={ocrForm.comName}
                onChange={(e) => setOcrForm({ ...ocrForm, comName: e.target.value })}
              />
            </Col>
            <Col span={12} style={{ marginTop: 12 }}>
              <div className="sb-form-label">{t("add.ocr.ceoLabel")}</div>
              <Input
                value={ocrForm.comCeo}
                onChange={(e) => setOcrForm({ ...ocrForm, comCeo: e.target.value })}
              />
            </Col>
            <Col span={12} style={{ marginTop: 12 }}>
              <div className="sb-form-label">{t("add.ocr.startDtLabel")}</div>
              <DatePicker
                style={{ width: "100%" }}
                value={ocrForm.startDt ? moment(ocrForm.startDt, "YYYY-MM-DD") : null}
                onChange={(d) =>
                  setOcrForm({ ...ocrForm, startDt: d ? d.format("YYYY-MM-DD") : "" })
                }
              />
            </Col>
            <Col span={24} style={{ marginTop: 12 }}>
              <div className="sb-form-label">
                {t("add.ocr.industryLabel")}{" "}
                <span className="field-hint">{t("add.ocr.industryHint")}</span>
              </div>
              <Select
                style={{ width: "100%" }}
                placeholder={t("form.industryPlaceholder")}
                options={grpOptions}
                value={ocrForm.industryGrpCode || undefined}
                onChange={(v) => setOcrForm({ ...ocrForm, industryGrpCode: v, industryCode: "" })}
              />
              {(ocrForm.grpRaw || ocrForm.codeRaw) && (
                <div className="field-hint mt-1" style={{ fontSize: 12, color: "#999" }}>
                  {ocrForm.grpRaw && (
                    <div>
                      {t("add.ocr.grpRawText", { text: ocrForm.grpRaw })}
                      {!ocrForm.industryGrpCode && t("add.ocr.matchFail")}
                    </div>
                  )}
                  {ocrForm.codeRaw && (
                    <div>
                      {t("add.ocr.codeRawText", { text: ocrForm.codeRaw })}
                      {!ocrForm.industryCode && t("add.ocr.matchFail")}
                    </div>
                  )}
                </div>
              )}
            </Col>
            <Col span={24} style={{ marginTop: 12 }}>
              <div className="sb-form-label">{t("add.ocr.detailIndustryLabel")}</div>
              <Select
                style={{ width: "100%" }}
                placeholder={t("form.detailIndustryPlaceholderDisabled")}
                disabled={!ocrForm.industryGrpCode}
                options={ocrCodeOptions}
                value={ocrForm.industryCode || undefined}
                onChange={(v) => setOcrForm({ ...ocrForm, industryCode: v })}
              />
            </Col>
          </Row>
        )}
      </Modal>
    </div>
  );
}