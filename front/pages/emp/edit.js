// pages/emp/edit.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Form, Input, Select, DatePicker, Button, message, } from "antd";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import moment from "moment";

import {
  detailEmpRequest, updateEmpRequest, checkEmailRequest,
  checkMobileRequest, checkEmpNoRequest, resetEmpState,
} from "../../reducers/emp/empReducer";
import { listPosRequest } from "../../reducers/pos/posReducer";
import { fetchDeptFlatRequest } from "../../reducers/dept/deptReducer";

export default function EmpEditPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["emp", "common"]);
  const { empId } = router.query;
  const [form] = Form.useForm();

  const STATUS_OPTIONS = [
    { value: "재직", label: t("common:empStatus.active") },
    { value: "휴직", label: t("common:empStatus.leave") },
    { value: "퇴직", label: t("common:empStatus.retired") },
  ];

  const { currentEmp, checkResult, loading, success, error } = useSelector((state) => state.emp);
  const { user } = useSelector((state) => state.auth);
  const { posList } = useSelector((state) => state.pos);
  const { flatList } = useSelector((state) => state.dept);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  // 관리자 전용 페이지. 주소창으로 직접 진입한 경우 상세로 되돌린다.
  // user가 아직 없으면 인증 정보 로딩 중이므로 판단을 미룬다.
  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      message.warning(t("edit.adminOnlyMsg"));
      router.replace({ pathname: "/emp/detail", query: { empId } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, empId]);

  // 데이터 로드
  useEffect(() => {
    if (!empId) return;
    if (user && !isAdmin) return;   // 비관리자에게는 조회 요청도 보내지 않는다
    dispatch(detailEmpRequest(Number(empId)));
    dispatch(listPosRequest());
    dispatch(fetchDeptFlatRequest(user?.comId));
    return () => { dispatch(resetEmpState()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, empId, user, isAdmin]);

  // 폼에 기존 값 세팅
  useEffect(() => {
    if (!currentEmp) return;
    form.setFieldsValue({
      empNo: currentEmp.empNo,
      empName: currentEmp.empName,
      empEmail: currentEmp.empEmail,
      empMobile: currentEmp.empMobile,
      deptId: currentEmp.deptId,
      posId: currentEmp.posId,
      empStatus: currentEmp.empStatus,
      hireDate: currentEmp.hireDate ? moment(currentEmp.hireDate) : null,
    });
  }, [currentEmp, form]);

  // 수정 결과
  useEffect(() => {
    if (success) {
      message.success(t("edit.successMsg"));
      dispatch(resetEmpState());
      router.push({ pathname: "/emp/detail", query: { empId } });
    } else if (error) {
      message.error(error);
      dispatch(resetEmpState());
    }
  }, [success, error, dispatch, router, empId]);

  // 중복검사 (원본 값과 같으면 스킵)
  const handleBlur = (field, value, original, requestAction) => {
    if (!value || value === original) return;
    dispatch(requestAction(value));
  };

  const checkHelp = (field) => {
    const val = checkResult[field];
    if (val === true) return { validateStatus: "success", help: t("common.checkAvailable") };
    if (val === false) return { validateStatus: "error", help: t("common.checkUnavailable") };
    return {};
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (
        checkResult.email === false ||
        checkResult.mobile === false ||
        checkResult.empNo === false
      ) {
        message.warning(t("edit.duplicateWarning"));
        return;
      }
      dispatch(
        updateEmpRequest({
          empId: Number(empId),
          ...values,
          hireDate: values.hireDate?.format("YYYY-MM-DD"),
        })
      );
    } catch (e) {}
  };

  // 리다이렉트 직전 폼이 깜빡이는 것을 방지
  if (user && !isAdmin) return null;

  //////
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
            {t("common.breadcrumbOrg")} &gt; {t("common.breadcrumbList")} &gt; {t("edit.breadcrumbCurrent")}
          </div>
          <h1>{t("edit.title")}</h1>
          <p>{t("edit.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href={{ pathname: "/emp/detail", query: { empId } }}>
            <Button icon={<ArrowLeftOutlined />}>{t("edit.backToDetailBtn")}</Button>
          </Link>
        </div>
      </div>

      <Card title={t("common.infoCardTitle")} loading={loading && !currentEmp}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 640 }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="empNo"
            label={t("common.fieldLabel.empNo")}
            rules={[{ required: true }]}
            {...checkHelp("empNo")}
          >
            <Input
              onBlur={(e) =>
                handleBlur(
                  "empNo",
                  e.target.value.trim(),
                  currentEmp?.empNo,
                  checkEmpNoRequest
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="empName"
            label={t("common.fieldLabel.empName")}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="empEmail"
            label={t("common.fieldLabel.empEmail")}
            rules={[{ required: true, message: t("edit.emailRequired") }, { type: "email", message: t("edit.emailInvalid") }]}
            {...checkHelp("email")}
          >
            <Input
              onBlur={(e) =>
                handleBlur(
                  "email",
                  e.target.value.trim(),
                  currentEmp?.empEmail,
                  checkEmailRequest
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="empMobile"
            label={t("common.fieldLabel.empMobile")}
            rules={[{ required: true, message: t("common.mobileRequired") }]}
            {...checkHelp("mobile")}
          >
            <Input
              onBlur={(e) =>
                handleBlur(
                  "mobile",
                  e.target.value.trim(),
                  currentEmp?.empMobile,
                  checkMobileRequest
                )
              }
            />
          </Form.Item>

          <Form.Item
            name="deptId"
            label={t("common.fieldLabel.dept")}
            rules={[{ required: true, message: t("common.deptRequired") }]}
          >
            <Select
              placeholder={t("common.deptPlaceholder")}
              options={flatList.map((d) => ({
                  value: d.deptId,
                  label: d.deptName,
                }))}
            />
          </Form.Item>

          <Form.Item
            name="posId"
            label={t("common.fieldLabel.pos")}
            rules={[{ required: true }]}
          >
            <Select
              options={posList.map((p) => ({
                value: p.posId,
                label: p.posName,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="empStatus"
            label={t("common.fieldLabel.empStatus")}
            rules={[{ required: true }]}
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>

          <Form.Item
            name="hireDate"
            label={t("common.fieldLabel.hireDate")}
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Link href={{ pathname: "/emp/detail", query: { empId } }}>
              <Button>{t("common:button.cancel")}</Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckOutlined />}
              loading={loading}
            >
              {t("common:button.edit")}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
