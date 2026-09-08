// pages/sal/pay/list.js
// 급여지급 관리 (ROLE_ADMIN) - /api/salpay 전체 CRUD + 상태변경 + 항목조정
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Card, Table, Button, Tag, Modal, Form, Input, InputNumber, DatePicker,
  Select, Pagination, message, Drawer, Descriptions, Divider,
} from "antd";
import {
  PlusOutlined, SearchOutlined, EyeOutlined, SyncOutlined,
  SwapOutlined, DeleteOutlined, EditOutlined,
} from "@ant-design/icons";
import moment from "moment";

import {
  listSalPayRequest, createSalPayRequest, recalcSalPayRequest,
  adjustSalPayItemRequest, changeSalPayStatusRequest, deleteSalPayRequest,
  resetSalPayState, clearCurrentSalPay,
} from "../../reducers/sal/salPayReducer";
import EmployeePicker from "../../components/EmployeePicker";
import { formatWon, wonFormatter, wonParser } from "../../utils/currency";

const STATUS_COLOR = {
  PENDING: "gold",
  APPROVED: "blue",
  PAID: "green",
  REJECTED: "red",
};

const NEXT_STATUS = {
  PENDING: ["APPROVED", "REJECTED"],
  APPROVED: ["PAID", "REJECTED"],
  PAID: [],
  REJECTED: [],
};

export default function SalPayListPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const [regForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [recalcForm] = Form.useForm();
  const [adjustForm] = Form.useForm();

  const STATUS_LABEL = {
    PENDING: { text: t("pay.status.pending"), color: STATUS_COLOR.PENDING },
    APPROVED: { text: t("pay.status.approved"), color: STATUS_COLOR.APPROVED },
    PAID: { text: t("pay.status.paid"), color: STATUS_COLOR.PAID },
    REJECTED: { text: t("pay.status.rejected"), color: STATUS_COLOR.REJECTED },
  };

  function StatusTag({ stat }) {
    const info = STATUS_LABEL[stat] || { text: stat, color: "default" };
    return <Tag color={info.color}>{info.text}</Tag>;
  }

  const { payList, paging, current, loading, success, error } = useSelector((state) => state.salPay);

  const [filters, setFilters] = useState({ empName: "", department: "", paymentMonth: null, status: "" });
  const [page, setPage] = useState(1);

  const [regOpen, setRegOpen] = useState(false);
  const [registering, setRegistering] = useState(false);

  const [detailTarget, setDetailTarget] = useState(null); // list row 또는 current
  const [statusTarget, setStatusTarget] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [recalcTarget, setRecalcTarget] = useState(null);
  const [recalculating, setRecalculating] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null); // { payId, itemId, itemName, amt }
  const [adjusting, setAdjusting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const runSearch = (nextPage = 1) => {
    setPage(nextPage);
    dispatch(listSalPayRequest({
      empName: filters.empName,
      department: filters.department,
      paymentMonth: filters.paymentMonth ? filters.paymentMonth.startOf("month").format("YYYY-MM-DD") : undefined,
      status: filters.status || undefined,
      page: nextPage - 1,
      size: 10,
    }));
  };

  useEffect(() => {
    runSearch(1);
    return () => dispatch(resetSalPayState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // 상세 드로어가 열려있는 동안 목록이 갱신되면 최신 데이터로 동기화
  useEffect(() => {
    if (!detailTarget) return;
    const fresh = payList.find((p) => p.payId === detailTarget.payId);
    if (fresh) setDetailTarget(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payList]);

  useEffect(() => {
    if (!(registering || changingStatus || recalculating || adjusting || deleting) || loading) return;
    if (success) {
      if (registering) {
        message.success(t("pay.registerSuccessMsg"));
        setRegOpen(false);
        regForm.resetFields();
        setRegistering(false);
      }
      if (changingStatus) {
        message.success(t("pay.statusChangeSuccessMsg"));
        setStatusTarget(null);
        setChangingStatus(false);
        if (current) setDetailTarget(current);
      }
      if (recalculating) {
        message.success(t("pay.recalcSuccessMsg"));
        setRecalcTarget(null);
        setRecalculating(false);
        if (current) setDetailTarget(current);
      }
      if (adjusting) {
        message.success(t("pay.adjustSuccessMsg"));
        setAdjustTarget(null);
        setAdjusting(false);
        if (current) setDetailTarget(current);
      }
      if (deleting) {
        message.success(t("pay.deleteSuccessMsg"));
        setDeleteTarget(null);
        setDeleting(false);
        setDetailTarget(null);
      }
      dispatch(resetSalPayState());
      dispatch(clearCurrentSalPay());
      runSearch(page);
    } else if (error) {
      message.error(error);
      setRegistering(false);
      setChangingStatus(false);
      setRecalculating(false);
      setAdjusting(false);
      setDeleting(false);
      dispatch(resetSalPayState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, dispatch]);

  const handleRegister = async () => {
    try {
      const values = await regForm.validateFields();
      if (!values.empId) {
        message.warning(t("pay.empSelectWarning"));
        return;
      }
      setRegistering(true);
      dispatch(createSalPayRequest({
        empId: values.empId,
        payMonth: values.payMonth.startOf("month").format("YYYY-MM-DD"),
      }));
    } catch (e) {
      // 폼 검증 실패
    }
  };

  const openStatusModal = (record) => {
    setStatusTarget(record);
    statusForm.resetFields();
  };
  const handleChangeStatus = async () => {
    try {
      const values = await statusForm.validateFields();
      setChangingStatus(true);
      dispatch(changeSalPayStatusRequest({
        payId: statusTarget.payId,
        stat: values.stat,
        rejRsn: values.stat === "REJECTED" ? values.rejRsn : undefined,
      }));
    } catch (e) {
      // 폼 검증 실패
    }
  };

  const openRecalcModal = (record) => {
    setRecalcTarget(record);
    recalcForm.resetFields();
  };
  const handleRecalc = async () => {
    const values = await recalcForm.validateFields().catch(() => null);
    if (values === null) return;
    setRecalculating(true);
    dispatch(recalcSalPayRequest({ payId: recalcTarget.payId, reason: values.reason }));
  };

  const openAdjustModal = (payId, item) => {
    setAdjustTarget({ payId, itemId: item.itemId, itemName: item.itemName, amt: item.amt });
    adjustForm.setFieldsValue({ amt: item.amt, reason: "" });
  };
  const handleAdjust = async () => {
    try {
      const values = await adjustForm.validateFields();
      setAdjusting(true);
      dispatch(adjustSalPayItemRequest({
        payId: adjustTarget.payId,
        itemId: adjustTarget.itemId,
        amt: values.amt,
        reason: values.reason,
      }));
    } catch (e) {
      // 폼 검증 실패
    }
  };

  const confirmDelete = () => {
    setDeleting(true);
    dispatch(deleteSalPayRequest(deleteTarget.payId));
  };

  const columns = [
    { title: t("pay.columns.empName"), dataIndex: "empName", key: "empName", width: 120, render: (v) => <b>{v}</b> },
    { title: t("pay.columns.payMonth"), dataIndex: "payMonth", key: "payMonth", width: 100,
      render: (v) => (v ? moment(v).format("YYYY-MM") : "-") },
    { title: t("pay.columns.baseSal"), dataIndex: "baseSal", key: "baseSal", width: 120, align: "right", render: formatWon },
    { title: t("pay.columns.allowTotal"), dataIndex: "allowTotal", key: "allowTotal", width: 120, align: "right", render: formatWon },
    { title: t("pay.columns.dedtTotal"), dataIndex: "dedtTotal", key: "dedtTotal", width: 120, align: "right", render: formatWon },
    { title: t("pay.columns.netPay"), dataIndex: "netPay", key: "netPay", width: 130, align: "right",
      render: (v) => <b>{formatWon(v)}</b> },
    { title: t("pay.columns.status"), dataIndex: "stat", key: "stat", width: 90, align: "center",
      render: (v) => <StatusTag stat={v} /> },
    {
      title: t("pay.columns.actions"), key: "actions", width: 190, align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          <Button type="text" size="small" icon={<EyeOutlined />} title={t("pay.detailTitle")}
            onClick={() => setDetailTarget(record)} />
          {record.stat === "PENDING" && (
            <Button type="text" size="small" icon={<SyncOutlined />} title={t("pay.recalcTitle")}
              onClick={() => openRecalcModal(record)} />
          )}
          {NEXT_STATUS[record.stat]?.length > 0 && (
            <Button type="text" size="small" icon={<SwapOutlined />} title={t("pay.changeStatusTitle")}
              onClick={() => openStatusModal(record)} />
          )}
          {record.stat !== "PAID" && (
            <Button type="text" size="small" danger icon={<DeleteOutlined />} title={t("pay.deleteTitle")}
              onClick={() => setDeleteTarget(record)} />
          )}
        </div>
      ),
    },
  ];

  const itemColumns = [
    { title: t("pay.itemColumns.itemType"), dataIndex: "itemType", key: "itemType", width: 70,
      render: (v) => (v === "ALLOWANCE" ? <Tag color="blue">{t("pay.itemTypeAllowance")}</Tag> : <Tag color="volcano">{t("pay.itemTypeDeduction")}</Tag>) },
    { title: t("pay.itemColumns.itemName"), dataIndex: "itemName", key: "itemName" },
    { title: t("pay.itemColumns.amt"), dataIndex: "amt", key: "amt", align: "right", render: formatWon },
    detailTarget?.stat === "PENDING"
      ? {
          title: "", key: "adjust", width: 70, align: "center",
          render: (_, item) => (
            <Button type="text" size="small" icon={<EditOutlined />} title={t("pay.itemColumns.adjustAction")}
              onClick={() => openAdjustModal(detailTarget.payId, item)} />
          ),
        }
      : null,
  ].filter(Boolean);

  const nextStatusOptions = useMemo(() => {
    if (!statusTarget) return [];
    return (NEXT_STATUS[statusTarget.stat] || []).map((s) => ({ value: s, label: STATUS_LABEL[s].text }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTarget, t]);

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("pay.breadcrumb")}</div>
          <h1>{t("pay.title")}</h1>
          <p>{t("pay.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegOpen(true)}>
            {t("pay.registerBtn")}
          </Button>
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Input
            style={{ width: 160 }}
            placeholder={t("pay.searchEmpNamePlaceholder")}
            value={filters.empName}
            onChange={(e) => setFilters((f) => ({ ...f, empName: e.target.value }))}
            onPressEnter={() => runSearch(1)}
          />
          <Input
            style={{ width: 140 }}
            placeholder={t("pay.searchDeptPlaceholder")}
            value={filters.department}
            onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
            onPressEnter={() => runSearch(1)}
          />
          <DatePicker
            picker="month"
            placeholder={t("pay.searchPayMonthPlaceholder")}
            value={filters.paymentMonth}
            onChange={(v) => setFilters((f) => ({ ...f, paymentMonth: v }))}
          />
          <Select
            style={{ width: 130 }}
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
            options={[
              { value: "", label: t("pay.statusAllOption") },
              { value: "PENDING", label: t("pay.status.pending") },
              { value: "APPROVED", label: t("pay.status.approved") },
              { value: "PAID", label: t("pay.status.paid") },
              { value: "REJECTED", label: t("pay.status.rejected") },
            ]}
          />
          <Button icon={<SearchOutlined />} onClick={() => runSearch(1)}>{t("pay.searchBtn")}</Button>
        </div>

        <Table
          rowKey="payId"
          columns={columns}
          dataSource={payList}
          loading={loading && !registering && !changingStatus && !recalculating && !adjusting && !deleting}
          pagination={false}
          locale={{ emptyText: t("pay.emptyText") }}
        />

        {paging && paging.totalElements > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12 }}>
            <span style={{ color: "#999", fontSize: 12.5 }}>{t("pay.totalCount", { count: paging.totalElements })}</span>
            <Pagination
              size="small"
              current={page}
              total={paging.totalElements}
              pageSize={paging.size || 10}
              showSizeChanger={false}
              onChange={runSearch}
            />
          </div>
        )}
      </Card>

      {/* 등록(산정) 모달 */}
      <Modal
        title={t("pay.registerModalTitle")}
        open={regOpen}
        onCancel={() => { setRegOpen(false); regForm.resetFields(); }}
        onOk={handleRegister}
        okText={t("pay.okTextRegister")}
        okButtonProps={{ loading: registering }}
        cancelText={t("pay.cancelText")}
        destroyOnClose
      >
        <p style={{ color: "#999", fontSize: 13, marginBottom: 16 }}>
          {t("pay.registerModalNotice")}
        </p>
        <Form form={regForm} layout="vertical">
          <Form.Item name="empId" label={t("pay.empFieldLabel")} rules={[{ required: true, message: t("pay.empFieldRequired") }]}>
            <EmployeePicker />
          </Form.Item>
          <Form.Item name="payMonth" label={t("pay.payMonthFieldLabel")} rules={[{ required: true, message: t("pay.payMonthFieldRequired") }]}>
            <DatePicker picker="month" style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 상태변경 모달 */}
      <Modal
        title={t("pay.statusModalTitle")}
        open={!!statusTarget}
        onCancel={() => setStatusTarget(null)}
        onOk={handleChangeStatus}
        okText={t("pay.okTextChangeStatus")}
        okButtonProps={{ loading: changingStatus }}
        cancelText={t("pay.cancelText")}
        destroyOnClose
      >
        <Form form={statusForm} layout="vertical">
          <Form.Item label={t("pay.currentStatusFieldLabel")}>
            <StatusTag stat={statusTarget?.stat} />
          </Form.Item>
          <Form.Item name="stat" label={t("pay.nextStatusFieldLabel")} rules={[{ required: true, message: t("pay.nextStatusFieldRequired") }]}>
            <Select options={nextStatusOptions} placeholder={t("pay.nextStatusPlaceholder")} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.stat !== cur.stat}>
            {({ getFieldValue }) =>
              getFieldValue("stat") === "REJECTED" && (
                <Form.Item name="rejRsn" label={t("pay.rejRsnFieldLabel")} rules={[{ required: true, message: t("pay.rejRsnFieldRequired") }]}>
                  <Input.TextArea rows={3} placeholder={t("pay.rejRsnPlaceholder")} />
                </Form.Item>
              )
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* 재산정 모달 */}
      <Modal
        title={t("pay.recalcModalTitle")}
        open={!!recalcTarget}
        onCancel={() => setRecalcTarget(null)}
        onOk={handleRecalc}
        okText={t("pay.okTextRecalc")}
        okButtonProps={{ loading: recalculating }}
        cancelText={t("pay.cancelText")}
        destroyOnClose
      >
        <p style={{ color: "#999", fontSize: 13 }}>
          {t("pay.recalcModalNotice")}
        </p>
        <Form form={recalcForm} layout="vertical">
          <Form.Item name="reason" label={t("pay.recalcReasonFieldLabel")}>
            <Input.TextArea rows={2} placeholder={t("pay.recalcReasonPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 항목 조정 모달 */}
      <Modal
        title={t("pay.adjustModalTitle", { itemName: adjustTarget?.itemName || "" })}
        open={!!adjustTarget}
        onCancel={() => setAdjustTarget(null)}
        onOk={handleAdjust}
        okText={t("pay.okTextAdjust")}
        okButtonProps={{ loading: adjusting }}
        cancelText={t("pay.cancelText")}
        destroyOnClose
      >
        <Form form={adjustForm} layout="vertical">
          <Form.Item name="amt" label={t("pay.adjustAmtFieldLabel")} rules={[{ required: true, message: t("pay.adjustAmtFieldRequired") }]}>
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={wonFormatter}
              parser={wonParser}
              addonAfter={t("pay.wonSuffix")}
            />
          </Form.Item>
          <Form.Item name="reason" label={t("pay.adjustReasonFieldLabel")} rules={[{ required: true, message: t("pay.adjustReasonFieldRequired") }]}>
            <Input.TextArea rows={2} placeholder={t("pay.adjustReasonPlaceholder")} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        title={t("pay.deleteModalTitle")}
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onOk={confirmDelete}
        okText={t("pay.okTextDelete")}
        okButtonProps={{ danger: true, loading: deleting }}
        cancelText={t("pay.cancelText")}
        destroyOnClose
      >
        <p>
          {t("pay.deleteConfirmText", {
            empName: deleteTarget?.empName,
            payMonth: deleteTarget?.payMonth ? moment(deleteTarget.payMonth).format("YYYY-MM") : "",
          })}
        </p>
        <p style={{ color: "#999", fontSize: 13 }}>{t("pay.deleteWarningText")}</p>
      </Modal>

      {/* 상세 드로어 */}
      <Drawer
        title={t("pay.detailDrawerTitle")}
        open={!!detailTarget}
        onClose={() => setDetailTarget(null)}
        width={520}
        destroyOnClose
      >
        {detailTarget && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label={t("pay.detailEmpLabel")}>{detailTarget.empName}</Descriptions.Item>
              <Descriptions.Item label={t("pay.detailPayMonthLabel")}>
                {t("pay.payMonthYearFormat", {
                  year: moment(detailTarget.payMonth).format("YYYY"),
                  month: moment(detailTarget.payMonth).format("MM"),
                })}
              </Descriptions.Item>
              <Descriptions.Item label={t("pay.detailStatusLabel")}><StatusTag stat={detailTarget.stat} /></Descriptions.Item>
              {detailTarget.stat === "REJECTED" && (
                <Descriptions.Item label={t("pay.detailRejRsnLabel")}>{detailTarget.rejRsn || "-"}</Descriptions.Item>
              )}
              <Descriptions.Item label={t("pay.detailBaseSalLabel")}>{formatWon(detailTarget.baseSal)}</Descriptions.Item>
              <Descriptions.Item label={t("pay.detailAllowTotalLabel")}>{formatWon(detailTarget.allowTotal)}</Descriptions.Item>
              <Descriptions.Item label={t("pay.detailDedtTotalLabel")}>{formatWon(detailTarget.dedtTotal)}</Descriptions.Item>
              <Descriptions.Item label={t("pay.detailNetPayLabel")}><b>{formatWon(detailTarget.netPay)}</b></Descriptions.Item>
              <Descriptions.Item label={t("pay.detailPaidAtLabel")}>
                {detailTarget.paidAt ? moment(detailTarget.paidAt).format("YYYY-MM-DD HH:mm") : "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" plain>{t("pay.detailAcctDivider")}</Divider>
            {detailTarget.bankName ? (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label={t("pay.detailAcctBankLabel")}>{detailTarget.bankName}</Descriptions.Item>
                <Descriptions.Item label={t("pay.detailAcctNoLabel")}>{detailTarget.acctNo}</Descriptions.Item>
                <Descriptions.Item label={t("pay.detailAcctHldrLabel")}>{detailTarget.hldrName}</Descriptions.Item>
              </Descriptions>
            ) : (
              <p style={{ color: "#999" }}>{t("pay.detailNoAcctText")}</p>
            )}

            <Divider orientation="left" plain>
              {t("pay.detailItemsDivider")}
              {detailTarget.stat === "PENDING" ? t("pay.detailItemsDividerAdjustHint") : ""}
            </Divider>
            <Table
              rowKey="itemId"
              columns={itemColumns}
              dataSource={detailTarget.items || []}
              pagination={false}
              size="small"
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
