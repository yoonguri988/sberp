// pages/emp/add.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Form, Input, Select, DatePicker, Button, message, } from "antd";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  createEmpRequest, checkEmailRequest, checkMobileRequest,
  checkEmpNoRequest, resetEmpState,
} from "../../reducers/emp/empReducer";
import { listPosRequest } from "../../reducers/pos/posReducer";
import { fetchDeptFlatRequest } from "../../reducers/dept/deptReducer";

export default function EmpAddPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["emp", "common"]);
  const [form] = Form.useForm();

  const { checkResult, loading, success, error } = useSelector((state) => state.emp);
  const { user } = useSelector((state) => state.auth);
  const { posList } = useSelector((state) => state.pos);
  const { flatList } = useSelector((state) => state.dept);

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  // 관리자 전용 페이지. 주소창으로 직접 진입한 경우 목록으로 되돌린다.
  // user가 아직 없으면 인증 정보 로딩 중이므로 판단을 미룬다.
  useEffect(() => {
    if (!user) return;
    if (!isAdmin) {
      message.warning(t("add.adminOnlyMsg"));
      router.replace("/emp/list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  // 직급, 부서 목록 로드
  useEffect(() => {
    if (user && !isAdmin) return;   // 비관리자에게는 조회 요청도 보내지 않는다
    dispatch(listPosRequest());
    dispatch(fetchDeptFlatRequest(user?.comId));
    return () => { dispatch(resetEmpState()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, user, isAdmin]);

  // 등록 성공 시 목록으로 이동
  useEffect(() => {
    if (success) {
      message.success(t("add.successMsg"));
      dispatch(resetEmpState());
      router.push("/emp/list");
    } else if (error) {
      message.error(error);
      dispatch(resetEmpState());
    }
  }, [success, error, dispatch, router]);

  // 중복검사 도움말 생성
  const checkHelp = (field) => {
    const val = checkResult[field];
    if (val === true) return { validateStatus: "success", help: t("common.checkAvailable") };
    if (val === false) return { validateStatus: "error", help: t("common.checkUnavailable") };
    return {};
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 중복 차단
      if (checkResult.email === false || checkResult.mobile === false || checkResult.empNo === false) {
        message.warning(t("add.duplicateWarning"));
        return;
      }
      // 날짜 변환
      const data = {
        ...values,
        hireDate: values.hireDate?.format("YYYY-MM-DD"),
      };
      dispatch(createEmpRequest(data));
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
            {t("common.breadcrumbOrg")} &gt; {t("common.breadcrumbList")} &gt; {t("add.breadcrumbCurrent")}
          </div>
          <h1>{t("add.title")}</h1>
          <p>{t("add.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/emp/list">
            <Button icon={<ArrowLeftOutlined />}>{t("common.backToListBtn")}</Button>
          </Link>
        </div>
      </div>

      <Card title={t("common.infoCardTitle")}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 640 }}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="empNo"
            label={t("common.fieldLabel.empNo")}
            rules={[{ required: true, message: t("add.empNoRequired") }]}
            {...checkHelp("empNo")}
          >
            <Input
              placeholder={t("add.empNoPlaceholder")}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v) dispatch(checkEmpNoRequest(v));
              }}
            />
          </Form.Item>

          <Form.Item
            name="empName"
            label={t("common.fieldLabel.empName")}
            rules={[{ required: true, message: t("add.empNameRequired") }]}
          >
            <Input placeholder={t("add.empNamePlaceholder")} />
          </Form.Item>

          <Form.Item
            name="empEmail"
            label={t("common.fieldLabel.empEmail")}
            rules={[
              { required: true, message: t("add.emailRequired") },
              { type: "email", message: t("add.emailInvalid") },
            ]}
            {...checkHelp("email")}
          >
            <Input
              placeholder={t("add.empEmailPlaceholder")}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v) dispatch(checkEmailRequest(v));
              }}
            />
          </Form.Item>

          <Form.Item
            name="empMobile"
            label={t("common.fieldLabel.empMobile")}
            rules={[{ required: true, message: t("common.mobileRequired") }]}
            {...checkHelp("mobile")}
          >
            <Input
              placeholder={t("add.empMobilePlaceholder")}
              onBlur={(e) => {
                const v = e.target.value.trim();
                if (v) dispatch(checkMobileRequest(v));
              }}
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
            rules={[{ required: true, message: t("common.posRequired") }]}
          >
            <Select
              placeholder={t("common.posPlaceholder")}
              options={posList.map((p) => ({
                value: p.posId,
                label: p.posName,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="hireDate"
            label={t("common.fieldLabel.hireDate")}
            rules={[{ required: true, message: t("add.hireDateRequired") }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Link href="/emp/list">
              <Button>{t("common:button.cancel")}</Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckOutlined />}
              loading={loading}
            >
              {t("common:button.add")}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
