// pages/sal/acct/admin.js
// 직원 급여 수령 계좌 조회/수정 (ROLE_ADMIN) - GET/PUT /api/salacct/{empId}
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Card,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  message,
  Empty,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import moment from "moment";

import {
  fetchAcctByEmpIdRequest,
  updateAcctByAdminRequest,
  resetSalAcctState,
  clearAdminAcct,
} from "../../reducers/sal/salAcctReducer";
import EmployeePicker from "../../components/EmployeePicker";

export default function SalAcctAdminPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const [form] = Form.useForm();

  const {
    adminAcct,
    adminAcctLoading,
    adminAcctError,
    loading,
    success,
    error,
  } = useSelector((state) => state.salAcct);

  const [empId, setEmpId] = useState(undefined);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => dispatch(clearAdminAcct()), [dispatch]);

  useEffect(() => {
    if (!empId) return;
    dispatch(fetchAcctByEmpIdRequest(empId));
  }, [empId, dispatch]);

  useEffect(() => {
    if (!saving || loading) return;
    if (success) {
      message.success(t("acctAdmin.updateSuccessMsg"));
      setEditing(false);
      setSaving(false);
      dispatch(resetSalAcctState());
      dispatch(fetchAcctByEmpIdRequest(empId));
    } else if (error) {
      message.error(error);
      setSaving(false);
      dispatch(resetSalAcctState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error]);

  const openEdit = () => {
    setEditing(true);
    form.setFieldsValue({
      bankName: adminAcct?.bankName,
      acctNo: adminAcct?.acctNo,
      hldrName: adminAcct?.hldrName,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      dispatch(updateAcctByAdminRequest({ empId, ...values }));
    } catch (e) {
      // 폼 검증 실패
    }
  };

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("acctAdmin.breadcrumb")}</div>
          <h1>{t("acctAdmin.title")}</h1>
          <p>
            {t("acctAdmin.subtitle")}
          </p>
        </div>
      </div>

      <Card>
        <div style={{ marginBottom: 20, maxWidth: 360 }}>
          <EmployeePicker
            value={empId}
            onChange={setEmpId}
            placeholder={t("acctAdmin.empSearchPlaceholder")}
          />
        </div>

        {!empId && <Empty description={t("acctAdmin.selectEmpPrompt")} />}

        {empId && adminAcctLoading && <p>{t("acctAdmin.loadingText")}</p>}

        {empId && !adminAcctLoading && adminAcctError && (
          <Empty description={t("acctAdmin.noAcctText")} />
        )}

        {empId && !adminAcctLoading && adminAcct && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 12,
              }}
            >
              <Button icon={<EditOutlined />} onClick={openEdit}>
                {t("acctAdmin.editBtn")}
              </Button>
            </div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t("acctAdmin.empLabel")}>
                {adminAcct.empName}
              </Descriptions.Item>
              <Descriptions.Item label={t("acctAdmin.bankLabel")}>
                {adminAcct.bankName}
              </Descriptions.Item>
              <Descriptions.Item label={t("acctAdmin.acctNoLabel")}>
                {adminAcct.acctNo}
              </Descriptions.Item>
              <Descriptions.Item label={t("acctAdmin.hldrLabel")}>
                {adminAcct.hldrName}
              </Descriptions.Item>
              <Descriptions.Item label={t("acctAdmin.createdAtLabel")}>
                {adminAcct.createdAt
                  ? moment(adminAcct.createdAt).format("YYYY-MM-DD HH:mm")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label={t("acctAdmin.updatedAtLabel")}>
                {adminAcct.updatedAt
                  ? moment(adminAcct.updatedAt).format("YYYY-MM-DD HH:mm")
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>

      <Modal
        title={t("acctAdmin.modalTitle")}
        open={editing}
        onCancel={() => setEditing(false)}
        onOk={handleSubmit}
        okText={t("acctAdmin.okText")}
        okButtonProps={{ loading: saving }}
        cancelText={t("acctAdmin.cancelText")}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="bankName"
            label={t("acctAdmin.bankNameFieldLabel")}
            rules={[{ required: true, message: t("acctAdmin.bankNameFieldRequired") }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item
            name="acctNo"
            label={t("acctAdmin.acctNoFieldLabel")}
            rules={[{ required: true, message: t("acctAdmin.acctNoFieldRequired") }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item
            name="hldrName"
            label={t("acctAdmin.hldrNameFieldLabel")}
            rules={[{ required: true, message: t("acctAdmin.hldrNameFieldRequired") }]}
          >
            <Input maxLength={30} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
