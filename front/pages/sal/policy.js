// pages/sal/policy/list.js
// 급여 계산 정책 관리 - 4대보험요율(ROOT) / 소득세구간표(ROOT) / 식대정책(ROLE_ADMIN) / 직책수당정책(ROLE_ADMIN)
// 4개 컨트롤러 모두 "등록 + 전체조회"만 있는 단순 정책 카탈로그라서 탭 하나의 화면으로 묶었다.
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Card,
  Tabs,
  Table,
  Button,
  Tag,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  Input,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

import {
  fetchRatePolicyRequest,
  createRatePolicyRequest,
  fetchTaxBracketRequest,
  createTaxBracketRequest,
  fetchMealPolicyRequest,
  createMealPolicyRequest,
  fetchPosAllowanceRequest,
  createPosAllowanceRequest,
  resetSalPolicyState,
} from "../../reducers/sal/salPolicyReducer";
import { formatWon, wonFormatter, wonParser } from "../../utils/currency";

const { TabPane } = Tabs;

function EffPeriodCell({ effFrom, effTo }) {
  const { t } = useTranslation("sal");
  return (
    <span>
      {effFrom} ~ {effTo || <Tag color="green">{t("policy.applyingTag")}</Tag>}
    </span>
  );
}

export default function SalPolicyListPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const { user } = useSelector((state) => state.auth);
  const isRoot = Boolean(user?.roles?.includes("ROOT"));
  const isAdmin = Boolean(user?.roles?.includes("ROLE_ADMIN"));
  // 4대보험요율/소득세구간표는 등록(POST)만 ROOT 전용이고, 조회(GET)는
  // 백엔드가 hasAnyAuthority('ROOT','ROLE_ADMIN')로 ADMIN에게도 허용한다.
  // 탭 노출 조건을 isRoot 단독으로 걸면 ADMIN 계정에서 두 탭이 통째로
  // 사라지므로, 조회 권한 기준(canViewRateTax)으로 맞춘다.
  const canViewRateTax = isRoot || isAdmin;

  const {
    rateList,
    rateLoading,
    taxBracketList,
    taxBracketLoading,
    mealPolicyList,
    mealPolicyLoading,
    posAllowanceList,
    posAllowanceLoading,
    saving,
    success,
    error,
  } = useSelector((state) => state.salPolicy);

  const [activeTab, setActiveTab] = useState(null);
  const [modalType, setModalType] = useState(null); // "rate" | "tax" | "meal" | "pos"
  const [form] = Form.useForm();

  useEffect(() => {
    if (canViewRateTax) {
      dispatch(fetchRatePolicyRequest());
      dispatch(fetchTaxBracketRequest());
    }
    if (isAdmin) {
      dispatch(fetchMealPolicyRequest());
      dispatch(fetchPosAllowanceRequest());
    }
    if (!activeTab) setActiveTab(canViewRateTax ? "rate" : "meal");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isRoot, isAdmin, canViewRateTax]);

  useEffect(() => {
    if (saving) return;
    if (success) {
      message.success(t("policy.registerSuccessMsg"));
      closeModal();
      if (modalType === "rate") dispatch(fetchRatePolicyRequest());
      if (modalType === "tax") dispatch(fetchTaxBracketRequest());
      if (modalType === "meal") dispatch(fetchMealPolicyRequest());
      if (modalType === "pos") dispatch(fetchPosAllowanceRequest());
      dispatch(resetSalPolicyState());
    } else if (error) {
      message.error(error);
      dispatch(resetSalPolicyState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, success, error]);

  const openModal = (type) => {
    setModalType(type);
    form.resetFields();
    if (type === "pos") form.setFieldsValue({ comId: user?.comId });
  };
  const closeModal = () => {
    setModalType(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (modalType === "rate") {
        dispatch(
          createRatePolicyRequest({
            plcyYear: values.plcyYear,
            pensRate: values.pensRate,
            hlthRate: values.hlthRate,
            careRate: values.careRate,
            emplRate: values.emplRate,
            effFrom: values.effFrom.format("YYYY-MM-DD"),
          }),
        );
      } else if (modalType === "tax") {
        dispatch(
          createTaxBracketRequest({
            minAmt: values.minAmt,
            maxAmt: values.maxAmt ?? null,
            taxRate: values.taxRate,
            effFrom: values.effFrom.format("YYYY-MM-DD"),
          }),
        );
      } else if (modalType === "meal") {
        dispatch(
          createMealPolicyRequest({
            amt: values.amt,
            effFrom: values.effFrom.format("YYYY-MM-DD"),
          }),
        );
      } else if (modalType === "pos") {
        dispatch(
          createPosAllowanceRequest({
            pos: values.pos,
            comId: values.comId,
            amt: values.amt,
            effFrom: values.effFrom.format("YYYY-MM-DD"),
          }),
        );
      }
    } catch (e) {
      // 폼 검증 실패
    }
  };

  const rateColumns = [
    { title: t("policy.rateColumns.plcyYear"), dataIndex: "plcyYear", key: "plcyYear", width: 90 },
    {
      title: t("policy.rateColumns.pensRate"),
      dataIndex: "pensRate",
      key: "pensRate",
      align: "right",
    },
    {
      title: t("policy.rateColumns.hlthRate"),
      dataIndex: "hlthRate",
      key: "hlthRate",
      align: "right",
    },
    {
      title: t("policy.rateColumns.careRate"),
      dataIndex: "careRate",
      key: "careRate",
      align: "right",
    },
    {
      title: t("policy.rateColumns.emplRate"),
      dataIndex: "emplRate",
      key: "emplRate",
      align: "right",
    },
    {
      title: t("policy.rateColumns.period"),
      key: "period",
      render: (_, r) => <EffPeriodCell {...r} />,
    },
  ];

  const taxColumns = [
    {
      title: t("policy.taxColumns.minAmt"),
      dataIndex: "minAmt",
      key: "minAmt",
      align: "right",
      render: formatWon,
    },
    {
      title: t("policy.taxColumns.maxAmt"),
      dataIndex: "maxAmt",
      key: "maxAmt",
      align: "right",
      render: (v) =>
        v === null || v === undefined ? t("policy.noUpperLimit") : formatWon(v),
    },
    { title: t("policy.taxColumns.taxRate"), dataIndex: "taxRate", key: "taxRate", align: "right" },
    {
      title: t("policy.taxColumns.period"),
      key: "period",
      render: (_, r) => <EffPeriodCell {...r} />,
    },
  ];

  const mealColumns = [
    {
      title: t("policy.mealColumns.scope"),
      dataIndex: "comId",
      key: "comId",
      width: 120,
      render: (v) => (v ? t("policy.comIdScope", { comId: v }) : <Tag color="blue">{t("policy.companyWideScope")}</Tag>),
    },
    {
      title: t("policy.mealColumns.amt"),
      dataIndex: "amt",
      key: "amt",
      align: "right",
      render: formatWon,
    },
    {
      title: t("policy.mealColumns.period"),
      key: "period",
      render: (_, r) => <EffPeriodCell {...r} />,
    },
  ];

  const posColumns = [
    { title: t("policy.posColumns.pos"), dataIndex: "pos", key: "pos", width: 120 },
    {
      title: t("policy.posColumns.comId"),
      dataIndex: "comId",
      key: "comId",
      width: 100,
      render: (v) => `#${v}`,
    },
    {
      title: t("policy.posColumns.amt"),
      dataIndex: "amt",
      key: "amt",
      align: "right",
      render: formatWon,
    },
    {
      title: t("policy.posColumns.period"),
      key: "period",
      render: (_, r) => <EffPeriodCell {...r} />,
    },
  ];

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("policy.breadcrumb")}</div>
          <h1>{t("policy.title")}</h1>
          <p>
            {t("policy.subtitle")}
          </p>
        </div>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {canViewRateTax && (
            <TabPane tab={t("policy.tabRate")} key="rate">
              {isRoot && (
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal("rate")}
                  >
                    {t("policy.registerRateBtn")}
                  </Button>
                </div>
              )}
              <Table
                rowKey="rateId"
                columns={rateColumns}
                dataSource={rateList}
                loading={rateLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: t("policy.rateEmptyText") }}
              />
            </TabPane>
          )}
          {canViewRateTax && (
            <TabPane tab={t("policy.tabTax")} key="tax">
              {isRoot && (
                <div
                  style={{
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => openModal("tax")}
                  >
                    {t("policy.registerTaxBtn")}
                  </Button>
                </div>
              )}
              <p style={{ color: "#999", fontSize: 13 }}>
                {t("policy.taxNotice")}
              </p>
              <Table
                rowKey="brktId"
                columns={taxColumns}
                dataSource={taxBracketList}
                loading={taxBracketLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: t("policy.taxEmptyText") }}
              />
            </TabPane>
          )}
          {isAdmin && (
            <TabPane tab={t("policy.tabMeal")} key="meal">
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openModal("meal")}
                >
                  {t("policy.registerMealBtn")}
                </Button>
              </div>
              <Table
                rowKey="mealPlcyId"
                columns={mealColumns}
                dataSource={mealPolicyList}
                loading={mealPolicyLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: t("policy.mealEmptyText") }}
              />
            </TabPane>
          )}
          {isAdmin && (
            <TabPane tab={t("policy.tabPos")} key="pos">
              <div
                style={{
                  marginBottom: 12,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => openModal("pos")}
                >
                  {t("policy.registerPosBtn")}
                </Button>
              </div>
              <Table
                rowKey="alwId"
                columns={posColumns}
                dataSource={posAllowanceList}
                loading={posAllowanceLoading}
                pagination={false}
                size="small"
                locale={{ emptyText: t("policy.posEmptyText") }}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>

      <Modal
        title={
          modalType === "rate"
            ? t("policy.modalTitleRate")
            : modalType === "tax"
              ? t("policy.modalTitleTax")
              : modalType === "meal"
                ? t("policy.modalTitleMeal")
                : t("policy.modalTitlePos")
        }
        open={!!modalType}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={t("policy.okText")}
        okButtonProps={{ loading: saving }}
        cancelText={t("policy.cancelText")}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {modalType === "rate" && (
            <>
              <Form.Item
                name="plcyYear"
                label={t("policy.plcyYearFieldLabel")}
                rules={[
                  { required: true, message: t("policy.plcyYearFieldRequired") },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={2000}
                  max={2100}
                  placeholder={t("policy.plcyYearPlaceholder")}
                />
              </Form.Item>
              <Form.Item
                name="pensRate"
                label={t("policy.pensRateFieldLabel")}
                rules={[{ required: true, message: t("policy.rateFieldRequired") }]}
                extra={t("policy.rateFieldExtra")}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={1}
                  step={0.001}
                />
              </Form.Item>
              <Form.Item
                name="hlthRate"
                label={t("policy.hlthRateFieldLabel")}
                rules={[{ required: true, message: t("policy.rateFieldRequired") }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={1}
                  step={0.001}
                />
              </Form.Item>
              <Form.Item
                name="careRate"
                label={t("policy.careRateFieldLabel")}
                rules={[{ required: true, message: t("policy.rateFieldRequired") }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={1}
                  step={0.0001}
                />
              </Form.Item>
              <Form.Item
                name="emplRate"
                label={t("policy.emplRateFieldLabel")}
                rules={[{ required: true, message: t("policy.rateFieldRequired") }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={1}
                  step={0.001}
                />
              </Form.Item>
              <Form.Item
                name="effFrom"
                label={t("policy.effFromFieldLabel")}
                rules={[
                  { required: true, message: t("policy.effFromFieldRequired") },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}
          {modalType === "tax" && (
            <>
              <Form.Item
                name="minAmt"
                label={t("policy.minAmtFieldLabel")}
                rules={[
                  { required: true, message: t("policy.minAmtFieldRequired") },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={wonFormatter}
                  parser={wonParser}
                  addonAfter={t("policy.wonSuffix")}
                />
              </Form.Item>
              <Form.Item
                name="maxAmt"
                label={t("policy.maxAmtFieldLabel")}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={wonFormatter}
                  parser={wonParser}
                  addonAfter={t("policy.wonSuffix")}
                />
              </Form.Item>
              <Form.Item
                name="taxRate"
                label={t("policy.taxRateFieldLabel")}
                rules={[{ required: true, message: t("policy.taxRateFieldRequired") }]}
                extra={t("policy.taxRateFieldExtra")}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={1}
                  step={0.001}
                />
              </Form.Item>
              <Form.Item
                name="effFrom"
                label={t("policy.effFromFieldLabel")}
                rules={[
                  { required: true, message: t("policy.effFromFieldRequired") },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}
          {modalType === "meal" && (
            <>
              <p style={{ color: "#999", fontSize: 13 }}>
                {t("policy.mealAdminNotice")}
              </p>
              <Form.Item
                name="amt"
                label={t("policy.mealAmtFieldLabel")}
                rules={[
                  { required: true, message: t("policy.mealAmtFieldRequired") },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={wonFormatter}
                  parser={wonParser}
                  addonAfter={t("policy.wonSuffix")}
                />
              </Form.Item>
              <Form.Item
                name="effFrom"
                label={t("policy.effFromFieldLabel")}
                rules={[
                  { required: true, message: t("policy.effFromFieldRequired") },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}
          {modalType === "pos" && (
            <>
              <Form.Item
                name="pos"
                label={t("policy.posFieldLabel")}
                rules={[
                  { required: true, message: t("policy.posFieldRequired") },
                ]}
              >
                <Input placeholder={t("policy.posPlaceholder")} maxLength={30} />
              </Form.Item>
              <Form.Item
                name="comId"
                label={t("policy.comIdFieldLabel")}
                rules={[{ required: true, message: t("policy.comIdFieldRequired") }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={1}
                  disabled={!isRoot}
                />
              </Form.Item>
              <Form.Item
                name="amt"
                label={t("policy.posAmtFieldLabel")}
                rules={[{ required: true, message: t("policy.posAmtFieldRequired") }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={wonFormatter}
                  parser={wonParser}
                  addonAfter={t("policy.wonSuffix")}
                />
              </Form.Item>
              <Form.Item
                name="effFrom"
                label={t("policy.effFromFieldLabel")}
                rules={[
                  { required: true, message: t("policy.effFromFieldRequired") },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}