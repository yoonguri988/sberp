// pages/emp/detail.js
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Row, Col, Card, Button, Tag, Avatar, Descriptions, Modal, Form, Input, message, Alert, } from "antd";
import { ArrowLeftOutlined, EditOutlined, KeyOutlined, SafetyCertificateOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  detailEmpRequest, updatePasswordRequest, resetPasswordRequest,
  resetEmpState,
} from "../../reducers/emp/empReducer";
import { empStatusLabel } from "../../utils/empStatus";

const STATUS_TAG = { 재직: "green", 휴직: "orange", 퇴직: "red" };

export default function EmpDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["emp", "common"]);
  const { empId } = router.query;
  const [passForm] = Form.useForm();

  const SENTIMENT = {
    POSITIVE: { color: "green", label: t("detail.sentiment.positive") },
    NEUTRAL: { color: "default", label: t("detail.sentiment.neutral") },
    NEGATIVE: { color: "red", label: t("detail.sentiment.negative") },
  };

  const { currentEmp, latestReport, loading, passwordSuccess, error } =
    useSelector((state) => state.emp);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isSelf = user?.empId === Number(empId);

  // 비밀번호 모달
  const [passModal, setPassModal] = useState(null); // "change" | "reset" | null
  const [passSaving, setPassSaving] = useState(false);

  // ─── 데이터 로드 ───
  useEffect(() => {
    if (!empId) return;
    dispatch(detailEmpRequest(Number(empId)));
    return () => { dispatch(resetEmpState()); };
  }, [dispatch, empId]);

  // ─── 비밀번호 결과 처리 ───
  useEffect(() => {
    if (!passSaving) return;
    if (passwordSuccess) {
      message.success(
        passModal === "change"
          ? t("detail.changeSuccessMsg")
          : t("detail.resetSuccessMsg")
      );
      setPassModal(null);
      setPassSaving(false);
      passForm.resetFields();
      dispatch(resetEmpState());
    } else if (error) {
      message.error(error);
      setPassSaving(false);
      dispatch(resetEmpState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passwordSuccess, error]);

  // ─── 비밀번호 변경 ───
  const handleChangePassword = async () => {
    try {
      const values = await passForm.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        message.warning(t("detail.passwordMismatch"));
        return;
      }
      setPassSaving(true);
      dispatch(
        updatePasswordRequest({
          empId: Number(empId),
          currentPass: values.currentPassword,
          newPass: values.newPassword,
          checkPass: values.confirmPassword,
        })
      );
    } catch (e) {}
  };

  // ─── 비밀번호 초기화 ───
  const handleResetPassword = () => {
    setPassSaving(true);
    dispatch(resetPasswordRequest(Number(empId)));
  };

  const emp = currentEmp;

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
            {t("common.breadcrumbOrg")} &gt; {t("common.breadcrumbList")} &gt; {t("detail.breadcrumbCurrent")}
          </div>
          <h1>{emp?.empName || t("detail.namePlaceholder")}</h1>
          {emp && (
            <p>
              {emp.deptName} · {emp.posName}
            </p>
          )}
        </div>
        <div className="sb-page-head__actions">
          <Link href="/emp/list">
            <Button icon={<ArrowLeftOutlined />}>{t("common.backToListBtn")}</Button>
          </Link>
        </div>
      </div>

      {/* 프로필 + AI 리포트 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* 좌: 프로필 카드 */}
        <Col xs={24} lg={8}>
          <Card style={{ height: "100%" }} loading={loading && !emp}>
            {emp && (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Avatar size={64} style={{ marginBottom: 8 }}>
                    {emp.empName?.charAt(0)}
                  </Avatar>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 700, margin: "4px 0" }}>
                    {emp.empName}
                  </h3>
                  <p style={{ color: "#999" }}>
                    {emp.deptName} · {emp.posName}
                  </p>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Tag>{emp.empNo}</Tag>
                    <Tag color={STATUS_TAG[emp.empStatus]}>{empStatusLabel(t, emp.empStatus)}</Tag>
                  </div>
                </div>

                <hr style={{ margin: "16px 0", borderColor: "#f0f0f0" }} />

                <Row gutter={16}>
                  <Col span={8}>
                    <div style={{ color: "#999", fontSize: 12 }}>{t("detail.table.email")}</div>
                    <div style={{ fontSize: 13, wordBreak: "break-all" }}>
                      {emp.empEmail}
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ color: "#999", fontSize: 12 }}>{t("detail.table.mobile")}</div>
                    <div style={{ fontSize: 13 }}>{emp.empMobile}</div>
                  </Col>
                  <Col span={8}>
                    <div style={{ color: "#999", fontSize: 12 }}>{t("detail.table.hireDate")}</div>
                    <div style={{ fontSize: 13 }}>{emp.hireDate}</div>
                  </Col>
                </Row>
              </>
            )}
          </Card>
        </Col>

        {/* 우: AI 리포트 */}
        <Col xs={24} lg={16}>
          <Card style={{ height: "100%" }}>
            {latestReport ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{t("detail.aiReportTitle")}</span>
                  {isAdmin && (
                    <Link
                      href={{
                        pathname: "/eval/report/detail",
                        query: { reportId: latestReport.reportId },
                      }}
                    >
                      <Button size="small">{t("detail.aiDetailBtn")}</Button>
                    </Link>
                  )}
                </div>
                <Row gutter={16}>
                  <Col span={8} style={{ textAlign: "center" }}>
                    <div style={{ color: "#999", marginBottom: 4 }}>{t("detail.overallGradeLabel")}</div>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        color:
                          latestReport.grade === "A"
                            ? "#52c41a"
                            : latestReport.grade === "B"
                              ? "#1890ff"
                              : "#fa8c16",
                      }}
                    >
                      {latestReport.grade}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ color: "#999", fontSize: 12 }}>{t("detail.overallScoreLabel")}</div>
                      <div style={{ fontWeight: 600, fontSize: 18 }}>
                        {latestReport.overallScore?.toFixed(2)}
                      </div>
                    </div>
                    {latestReport.sentimentLabel && (
                      <div style={{ marginTop: 8 }}>
                        <Tag color={SENTIMENT[latestReport.sentimentLabel]?.color}>
                          {SENTIMENT[latestReport.sentimentLabel]?.label}
                        </Tag>
                      </div>
                    )}
                  </Col>
                  <Col span={16}>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ color: "#999", fontSize: 12 }}>{t("detail.evalRoundLabel")}</div>
                      <div>
                        {latestReport.periodTitle}{" "}
                        <Tag>{latestReport.generatedAt}</Tag>
                      </div>
                    </div>
                    <div>
                      <div style={{ color: "#999", fontSize: 12 }}>{t("detail.summaryLabel")}</div>
                      <div style={{ whiteSpace: "pre-line" }}>
                        {latestReport.aiSummary || t("detail.summaryEmptyMsg")}
                      </div>
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#999",
                }}
              >
                <p style={{ fontSize: 28, opacity: 0.5 }}>📄</p>
                <p>{t("detail.aiEmptyMsg")}</p>
                <p style={{ fontSize: 13 }}>
                  {t("detail.aiEmptyHint")}
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 상세 정보 */}
      {emp && (
        <Card style={{ marginBottom: 16 }} title={t("detail.cardTitle")}>
          <Descriptions column={{ xs: 1, sm: 2, lg: 4 }}>
            <Descriptions.Item label={t("detail.table.empNo")}>{emp.empNo}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.empName")}>{emp.empName}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.dept")}>{emp.deptName}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.pos")}>{emp.posName}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.email")}>{emp.empEmail}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.mobile")}>{emp.empMobile}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.hireDate")}>{emp.hireDate}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.status")}>
              <Tag color={STATUS_TAG[emp.empStatus]}>{empStatusLabel(t, emp.empStatus)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t("detail.table.createdAt")}>{emp.createdAt}</Descriptions.Item>
            <Descriptions.Item label={t("detail.table.updatedAt")}>
              {emp.updatedAt}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

            {/* 본인이지만 관리자가 아닌 경우 안내 */}
      {isSelf && !isAdmin && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={t("detail.editRequestNotice")}
        />
      )}

      {/* 하단 버튼 */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {isAdmin && (
          <>
            <Link
              href={{
                pathname: "/perm/empAuth",
                query: { empId },
              }}
            >
              <Button icon={<SafetyCertificateOutlined />}>{t("detail.permManageBtn")}</Button>
            </Link>
            <Button
              icon={<KeyOutlined />}
              onClick={() => setPassModal("reset")}
            >
              {t("detail.resetPasswordBtn")}
            </Button>
          </>
        )}
        {isSelf && (
          <Button
            icon={<KeyOutlined />}
            onClick={() => {
              setPassModal("change");
              passForm.resetFields();
            }}
          >
            {t("detail.changePasswordBtn")}
          </Button>
        )}
        {/* 정보 수정은 관리자만. 사원은 관리자에게 요청한다. */}
        {isAdmin && (
          <Link
            href={{ pathname: "/emp/edit", query: { empId } }}
          >
            <Button type="primary" icon={<EditOutlined />}>
              {t("detail.editBtn")}
            </Button>
          </Link>
        )}
      </div>

      {/* ── 비밀번호 변경 모달 (본인) ── */}
      <Modal
        title={t("detail.changePasswordModalTitle")}
        open={passModal === "change"}
        onCancel={() => setPassModal(null)}
        onOk={handleChangePassword}
        okText={t("detail.changeBtn")}
        okButtonProps={{ loading: passSaving }}
        cancelText={t("common:button.cancel")}
        destroyOnClose
      >
        <Form form={passForm} layout="vertical">
          <Form.Item
            name="currentPassword"
            label={t("detail.currentPasswordLabel")}
            rules={[{ required: true, message: t("detail.currentPasswordRequired") }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t("detail.newPasswordLabel")}
            rules={[{ required: true, message: t("detail.newPasswordRequired") }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t("detail.confirmPasswordLabel")}
            rules={[{ required: true, message: t("detail.confirmPasswordRequired") }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 비밀번호 초기화 모달 (관리자) ── */}
      <Modal
        title={t("detail.resetPasswordModalTitle")}
        open={passModal === "reset"}
        onCancel={() => setPassModal(null)}
        onOk={handleResetPassword}
        okText={t("common:button.reset")}
        okButtonProps={{ danger: true, loading: passSaving }}
        cancelText={t("common:button.cancel")}
        destroyOnClose
      >
        <p>{t("detail.resetPasswordConfirmMsg", { empName: emp?.empName })}</p>
        <p style={{ color: "#999", fontSize: 13 }}>
          {t("detail.resetPasswordHint")}
        </p>
      </Modal>
    </div>
  );
}
