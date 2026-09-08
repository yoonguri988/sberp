// pages/sal/my/index.js
// 내 급여정보 (전 직원 공통) - 급여기준 조회 / 급여명세서 조회 / 급여 수령 계좌 등록·수정
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Card,
  Tabs,
  Descriptions,
  Table,
  Tag,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  Pagination,
  Drawer,
  Divider,
  message,
} from "antd";
import { EditOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";

import { fetchMySalStdRequest } from "../../reducers/sal/salStdReducer";
import { fetchMyPaymentsRequest } from "../../reducers/sal/salPayReducer";
import {
  fetchMyAcctRequest,
  registerMyAcctRequest,
  updateMyAcctRequest,
  resetSalAcctState,
} from "../../reducers/sal/salAcctReducer";
import { formatWon } from "../../utils/currency";

const { TabPane } = Tabs;

const STATUS_COLOR = {
  PENDING: "gold",
  APPROVED: "blue",
  PAID: "green",
  REJECTED: "red",
};

export default function MySalaryPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");

  const STATUS_LABEL = {
    PENDING: { text: t("pay.status.pending"), color: STATUS_COLOR.PENDING },
    APPROVED: { text: t("pay.status.approved"), color: STATUS_COLOR.APPROVED },
    PAID: { text: t("pay.status.paid"), color: STATUS_COLOR.PAID },
    REJECTED: { text: t("pay.status.rejected"), color: STATUS_COLOR.REJECTED },
  };

  const { myStd, myStdLoading, myStdError } = useSelector(
    (state) => state.salStd,
  );
  const { myPayments, myPaging, myLoading } = useSelector(
    (state) => state.salPay,
  );
  const {
    myAcct,
    myAcctLoading,
    myAcctError,
    loading: acctSaving,
    success: acctSuccess,
    error: acctError,
  } = useSelector((state) => state.salAcct);

  const [page, setPage] = useState(1);
  const [detailTarget, setDetailTarget] = useState(null);
  const [acctModalOpen, setAcctModalOpen] = useState(false);
  const [acctModalMode, setAcctModalMode] = useState("register"); // "register" | "update"
  const [form] = Form.useForm();
  const hasAcct = !!myAcct;

  useEffect(() => {
    dispatch(fetchMySalStdRequest());
    dispatch(fetchMyPaymentsRequest({ page: 0, size: 10 }));
    dispatch(fetchMyAcctRequest());
  }, [dispatch]);

  useEffect(() => {
    if (acctSaving) return;
    if (acctSuccess) {
      message.success(
        acctModalMode === "update"
          ? t("my.acctUpdateSuccessMsg")
          : t("my.acctRegisterSuccessMsg"),
      );
      setAcctModalOpen(false);
      dispatch(resetSalAcctState());
    } else if (acctError) {
      message.error(acctError);
      dispatch(resetSalAcctState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acctSaving, acctSuccess, acctError, dispatch]);

  const runPaymentSearch = (nextPage = 1) => {
    setPage(nextPage);
    dispatch(fetchMyPaymentsRequest({ page: nextPage - 1, size: 10 }));
  };

  const openAcctModal = () => {
    setAcctModalOpen(true);
    setAcctModalMode(hasAcct ? "update" : "register");
    form.setFieldsValue({
      bankName: myAcct?.bankName,
      acctNo: myAcct?.acctNo,
      hldrName: myAcct?.hldrName,
    });
  };

  const handleAcctSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (acctModalMode === "update") {
        dispatch(updateMyAcctRequest(values));
      } else {
        dispatch(registerMyAcctRequest(values));
      }
    } catch (e) {
      // 폼 검증 실패
    }
  };

  const payColumns = [
    {
      title: t("my.payColumns.payMonth"),
      dataIndex: "payMonth",
      key: "payMonth",
      width: 100,
      render: (v) => (v ? moment(v).format("YYYY-MM") : "-"),
    },
    {
      title: t("my.payColumns.baseSal"),
      dataIndex: "baseSal",
      key: "baseSal",
      align: "right",
      render: formatWon,
    },
    {
      title: t("my.payColumns.allowTotal"),
      dataIndex: "allowTotal",
      key: "allowTotal",
      align: "right",
      render: formatWon,
    },
    {
      title: t("my.payColumns.dedtTotal"),
      dataIndex: "dedtTotal",
      key: "dedtTotal",
      align: "right",
      render: formatWon,
    },
    {
      title: t("my.payColumns.netPay"),
      dataIndex: "netPay",
      key: "netPay",
      align: "right",
      render: (v) => <b>{formatWon(v)}</b>,
    },
    {
      title: t("my.payColumns.status"),
      dataIndex: "stat",
      key: "stat",
      width: 90,
      align: "center",
      render: (v) => {
        const info = STATUS_LABEL[v] || { text: v, color: "default" };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: "",
      key: "detail",
      width: 60,
      align: "center",
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setDetailTarget(record)}
        />
      ),
    },
  ];

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("my.breadcrumb")}</div>
          <h1>{t("my.title")}</h1>
          <p>{t("my.subtitle")}</p>
        </div>
      </div>

      <Card>
        <Tabs defaultActiveKey="std">
          <TabPane tab={t("my.tabStd")} key="std">
            {myStdLoading ? (
              <p>{t("my.loadingText")}</p>
            ) : myStdError || !myStd ? (
              <Empty description={t("my.stdEmptyText")} />
            ) : (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={t("my.stdBaseSalLabel")}>
                  {formatWon(myStd.baseSal)}
                </Descriptions.Item>
                <Descriptions.Item label={t("my.stdAnnuSalLabel")}>
                  {formatWon(myStd.annuSal)}
                </Descriptions.Item>
                <Descriptions.Item label={t("my.stdStartDateLabel")}>
                  {myStd.startDate}
                </Descriptions.Item>
                <Descriptions.Item label={t("my.stdEndDateLabel")}>
                  {myStd.endDate || "-"}
                </Descriptions.Item>
                <Descriptions.Item label={t("my.stdStatusLabel")}>
                  {myStd.actv ? (
                    <Tag color="green">{t("my.statusActive")}</Tag>
                  ) : (
                    <Tag>{t("my.statusEnded")}</Tag>
                  )}
                </Descriptions.Item>
              </Descriptions>
            )}
          </TabPane>

          <TabPane tab={t("my.tabPay")} key="pay">
            <Table
              rowKey="payId"
              columns={payColumns}
              dataSource={myPayments}
              loading={myLoading}
              pagination={false}
              locale={{ emptyText: t("my.payEmptyText") }}
            />
            {myPaging && myPaging.totalElements > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  paddingTop: 12,
                }}
              >
                <Pagination
                  size="small"
                  current={page}
                  total={myPaging.totalElements}
                  pageSize={myPaging.size || 10}
                  showSizeChanger={false}
                  onChange={runPaymentSearch}
                />
              </div>
            )}
          </TabPane>

          <TabPane tab={t("my.tabAcct")} key="acct">
            {myAcctLoading ? (
              <p>{t("my.loadingText")}</p>
            ) : myAcctError || !myAcct ? (
              <div>
                <Empty
                  description={t("my.acctEmptyText")}
                  style={{ marginBottom: 16 }}
                />
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openAcctModal}
                  >
                    {t("my.acctRegisterBtn")}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 12,
                  }}
                >
                  <Button icon={<EditOutlined />} onClick={openAcctModal}>
                    {t("my.acctEditBtn")}
                  </Button>
                </div>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label={t("my.acctBankLabel")}>
                    {myAcct.bankName}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("my.acctNoLabel")}>
                    {myAcct.acctNo}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("my.acctHldrLabel")}>
                    {myAcct.hldrName}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          acctModalMode === "update"
            ? t("my.acctModalTitleUpdate")
            : t("my.acctModalTitleRegister")
        }
        open={acctModalOpen}
        onCancel={() => setAcctModalOpen(false)}
        onOk={handleAcctSubmit}
        okText={acctModalMode === "update" ? t("my.okTextUpdate") : t("my.okTextRegister")}
        okButtonProps={{ loading: acctSaving }}
        cancelText={t("my.cancelText")}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="bankName"
            label={t("my.bankNameFieldLabel")}
            rules={[{ required: true, message: t("my.bankNameFieldRequired") }]}
          >
            <Input maxLength={30} placeholder={t("my.bankNamePlaceholder")} />
          </Form.Item>
          <Form.Item
            name="acctNo"
            label={t("my.acctNoFieldLabel")}
            rules={[{ required: true, message: t("my.acctNoFieldRequired") }]}
          >
            <Input maxLength={30} placeholder={t("my.acctNoPlaceholder")} />
          </Form.Item>
          <Form.Item
            name="hldrName"
            label={t("my.hldrNameFieldLabel")}
            rules={[{ required: true, message: t("my.hldrNameFieldRequired") }]}
          >
            <Input maxLength={30} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title={t("my.detailDrawerTitle")}
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        width={480}
        destroyOnClose
      >
        {detailTarget && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={t("my.detailPayMonthLabel")}>
                {t("my.payMonthYearFormat", {
                  year: moment(detailTarget.payMonth).format("YYYY"),
                  month: moment(detailTarget.payMonth).format("MM"),
                })}
              </Descriptions.Item>
              <Descriptions.Item label={t("my.detailStatusLabel")}>
                <Tag color={STATUS_LABEL[detailTarget.stat]?.color}>
                  {STATUS_LABEL[detailTarget.stat]?.text}
                </Tag>
              </Descriptions.Item>
              {detailTarget.stat === "REJECTED" && (
                <Descriptions.Item label={t("my.detailRejRsnLabel")}>
                  {detailTarget.rejRsn || "-"}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t("my.detailBaseSalLabel")}>
                {formatWon(detailTarget.baseSal)}
              </Descriptions.Item>
              <Descriptions.Item label={t("my.detailAllowTotalLabel")}>
                {formatWon(detailTarget.allowTotal)}
              </Descriptions.Item>
              <Descriptions.Item label={t("my.detailDedtTotalLabel")}>
                {formatWon(detailTarget.dedtTotal)}
              </Descriptions.Item>
              <Descriptions.Item label={t("my.detailNetPayLabel")}>
                <b>{formatWon(detailTarget.netPay)}</b>
              </Descriptions.Item>
              <Descriptions.Item label={t("my.detailPaidAtLabel")}>
                {detailTarget.paidAt
                  ? moment(detailTarget.paidAt).format("YYYY-MM-DD HH:mm")
                  : "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain>
              {t("my.detailAcctDivider")}
            </Divider>
            {detailTarget.bankName ? (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label={t("my.detailAcctBankLabel")}>
                  {detailTarget.bankName}
                </Descriptions.Item>
                <Descriptions.Item label={t("my.detailAcctNoLabel")}>
                  {detailTarget.acctNo}
                </Descriptions.Item>
                <Descriptions.Item label={t("my.detailAcctHldrLabel")}>
                  {detailTarget.hldrName}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <p style={{ color: "#999" }}>{t("my.detailNoAcctText")}</p>
            )}

            <Divider orientation="left" plain>
              {t("my.detailItemsDivider")}
            </Divider>
            <Table
              rowKey="itemId"
              size="small"
              pagination={false}
              dataSource={detailTarget.items || []}
              columns={[
                {
                  title: t("my.itemColumns.itemType"),
                  dataIndex: "itemType",
                  key: "itemType",
                  width: 70,
                  render: (v) =>
                    v === "ALLOWANCE" ? (
                      <Tag color="blue">{t("my.itemTypeAllowance")}</Tag>
                    ) : (
                      <Tag color="volcano">{t("my.itemTypeDeduction")}</Tag>
                    ),
                },
                { title: t("my.itemColumns.itemName"), dataIndex: "itemName", key: "itemName" },
                {
                  title: t("my.itemColumns.amt"),
                  dataIndex: "amt",
                  key: "amt",
                  align: "right",
                  render: formatWon,
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
