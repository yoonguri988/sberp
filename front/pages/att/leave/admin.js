// pages/att/leave/admin.js

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Card, Table, Tag, Button, Select, Space,
  Modal, InputNumber, Input, message, DatePicker
} from "antd";
import { CalculatorOutlined, MinusCircleOutlined, ToolOutlined, HistoryOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import moment from "moment";

import {
  fetchAllBalancesRequest, fetchGrantHistoryRequest, calculateRequest,
  deductRequest, adjustRequest, resetLeaveState,
  clearLeaveDetail, calculateAllRequest,
} from "../../../reducers/att/leaveBalanceReducer";

// ── 부여 유형별 Tag 색상 ──
const GRANT_TYPE_COLOR = {
  REG: "blue",
  CAR: "cyan",
  ADJ: "orange",
  USE: "red",
};

export default function LeaveAdminPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation(["att", "common"]);

  const { allBalances, grantHistory, loading, success, error } =
    useSelector((state) => state.leave);

  // ── 로컬 상태: 검색 조건 ──
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [keyword, setKeyword] = useState("");

  // ── 로컬 상태: 차감 모달 ──
  const [deductTarget, setDeductTarget] = useState(null);   // 대상 사원 정보
  const [deductHalfType, setDeductHalfType] = useState(null); // null=연차, "AM", "PM"
  const [deductReason, setDeductReason] = useState("");
  const [deductDate, setDeductDate] = useState(null);

  // ── 로컬 상태: 조정 모달 ──
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");

  // ── 로컬 상태: 이력 모달 ──
  const [historyTarget, setHistoryTarget] = useState(null);

  // ── 마운트 시: 해당 연도 전체 연차 조회 ──
  useEffect(() => {
    loadBalances();

    return () => {
      dispatch(resetLeaveState());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── success 감시 ──
  useEffect(() => {
    if (success) {
      // 어떤 모달이 열려있는지에 따라 메시지를 구분
      if (deductTarget) {
        message.success(t("att:msg.deductSuccess"));
        setDeductTarget(null);
      } else if (adjustTarget) {
        message.success(t("att:msg.adjustSuccess"));
        setAdjustTarget(null);
      } else {
        message.success(t("att:msg.calculateSuccess"));
      }
      loadBalances(); // 목록 새로고침
      dispatch(resetLeaveState());
    }
  }, [success]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 에러 감시 ──
  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(resetLeaveState());
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBalances = () => {
    // payload 형태: { year: 2026 }
    // → leaveBalanceSaga의 fetchAllBalances에서
    //   action.payload.year 로 꺼내 쓴다
    dispatch(fetchAllBalancesRequest({ year: selectedYear, keyword: keyword.trim() || null }));
  };

  // ── 연차 발생 ──
  const handleCalculate = (record) => {
    Modal.confirm({
      title: t("att:leaveAdmin.confirmCalculate"),
      onOk: () => {
        // payload: { empId, year }
        dispatch(calculateRequest({
          empId: record.empId,
          year: selectedYear,
        }));
      },
    });
  };

  // ── 차감 모달 열기 ──
  const openDeductModal = (record) => {
    setDeductTarget(record);
    setDeductHalfType(null);
    setDeductReason("");
    setDeductDate(null);
  };

  // ── 차감 실행 ──
  const handleDeduct = () => {
    if (!deductTarget) return;
    if (!deductDate) {
      message.warning(t("att:leaveAdmin.deductModal.leaveDateRequired"));
      return;
    }
    const deductAmount = deductHalfType ? 0.5 : 1;
    dispatch(deductRequest({
      empId: deductTarget.empId,
      grantDays: -deductAmount,
      grantType: "USE",
      halfType: deductHalfType,
      reason: deductReason,
      leaveDate: deductDate.format("YYYY-MM-DD"),
    }));
  };

  // ── 조정 모달 열기 ──
  const openAdjustModal = (record) => {
    setAdjustTarget(record);
    setAdjustAmount(0);
    setAdjustReason("");
  };

  // ── 조정 실행 ──
  const handleAdjust = () => {
    if (!adjustTarget || adjustAmount === 0) return;
    dispatch(adjustRequest({
      empId: adjustTarget.empId,
      grantDays: adjustAmount,
      grantType: "ADJ",
      reason: adjustReason,
      leaveDate: moment().format("YYYY-MM-DD"),  // ← 추가 (오늘 날짜)
    }));
};

  // ── 이력 모달 열기 ──
  //
  // [새로운 패턴: 모달 열 때 별도 API 호출]
  //   모달을 열면서 동시에 해당 사원의 이력을 조회한다.
  //   이 데이터는 grantHistory 상태에 저장되고,
  //   모달을 닫을 때 clearLeaveDetail()로 정리한다.
  //
  const openHistoryModal = (record) => {
    setHistoryTarget(record);
    // 이 dispatch로 saga가 GET /api/att/leave/grant/{empId} 호출
    dispatch(fetchGrantHistoryRequest(record.empId));
  };

  // ── 이력 모달용 columns ──
  const historyColumns = [
    {
      title: t("att:leaveAdmin.historyModal.table.grantDays"),
      dataIndex: "grantDays",
      key: "grantDays",
      width: 80,
      align: "center",
      render: (v) => {
        // 양수(부여)는 파란색, 음수(차감)는 빨간색
        const color = v > 0 ? "blue" : "red";
        return <Tag color={color}>{v > 0 ? `+${v}` : v}</Tag>;
      },
    },
    {
      title: t("att:leaveAdmin.historyModal.table.grantType"),
      dataIndex: "grantType",
      key: "grantType",
      width: 100,
      render: (v) => (
        <Tag color={GRANT_TYPE_COLOR[v] || "default"}>
          {t(`att:leaveAdmin.historyModal.grantType.${v}`, v)}
        </Tag>
      ),
    },
    {
      title: t("att:leaveAdmin.historyModal.table.grantedAt"),
      dataIndex: "grantedAt",
      key: "grantedAt",
      width: 160,
      render: (v) => (v ? moment(v).format("YYYY-MM-DD HH:mm") : "—"),
    },
    {
      title: t("att:leaveAdmin.historyModal.table.reason"),
      dataIndex: "reason",
      key: "reason",
      render: (v) => v || "—",
    },
  ];

  // ── 메인 테이블 columns ──
  const columns = [
    {
      title: t("att:leaveAdmin.table.empNo"),
      dataIndex: "empNo",
      key: "empNo",
      width: 100,
    },
    {
      title: t("att:leaveAdmin.table.empName"),
      dataIndex: "empName",
      key: "empName",
      width: 100,
    },
    {
      title: t("att:leaveAdmin.table.totalDays"),
      dataIndex: "totalDays",
      key: "totalDays",
      width: 100,
      align: "center",
      render: (v) => (v != null ? v : "—"),
    },
    {
      title: t("att:leaveAdmin.table.usedDays"),
      dataIndex: "usedDays",
      key: "usedDays",
      width: 100,
      align: "center",
      render: (v) => (v != null ? v : "—"),
    },
    {
      title: t("att:leaveAdmin.table.remainingDays"),
      dataIndex: "remainingDays",
      key: "remainingDays",
      width: 100,
      align: "center",
      render: (v) => {
        if (v == null) return "—";
        const color = v <= 3 ? "red" : "green";
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: t("att:leaveAdmin.table.action"),
      key: "action",
      width: 280,
      // ── 한 행에 버튼 4개 ──
      //
      // 각 버튼이 서로 다른 action을 trigger한다:
      //   연차 발생 → calculateRequest → POST /calculate/{empId}
      //   차감     → deductRequest    → POST /deduct (모달 거침)
      //   조정     → adjustRequest    → POST /adjust (모달 거침)
      //   이력     → fetchGrantHistoryRequest → GET /grant/{empId} (모달)
      //
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<CalculatorOutlined />}
            onClick={() => handleCalculate(record)}
          >
            {t("att:leaveAdmin.btnCalculate")}
          </Button>
          <Button
            size="small"
            icon={<MinusCircleOutlined />}
            onClick={() => openDeductModal(record)}
          >
            {t("att:leaveAdmin.btnDeduct")}
          </Button>
          <Button
            size="small"
            icon={<ToolOutlined />}
            onClick={() => openAdjustModal(record)}
          >
            {t("att:leaveAdmin.btnAdjust")}
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => openHistoryModal(record)}
          >
            {t("att:leaveAdmin.btnHistory")}
          </Button>
        </Space>
      ),
    },
  ];

  // ── 연도 선택 옵션 생성 ──
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear - 2; y <= currentYear + 1; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common:breadcrumbRoot")} &gt; {t("att:breadcrumb")} &gt; {t("att:leaveAdmin.breadcrumb")}
          </div>
          <h1>{t("att:leaveAdmin.title")}</h1>
          <p>{t("att:leaveAdmin.subtitle")}</p>
        </div>
      </div>

      {/* ── 연도 선택 + 검색 ── */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space>
            <span>{t("att:leaveAdmin.yearSelect")}:</span>
            <Select
              value={selectedYear}
              onChange={(v) => setSelectedYear(v)}
              style={{ width: 120 }}
            >
              {yearOptions.map((y) => (
                <Select.Option key={y} value={y}>
                  {y}
                </Select.Option>
              ))}
            </Select>
            <Input
              placeholder={t("att:admin.search.keywordPlaceholder")}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={loadBalances}
              style={{ width: 180 }}
              allowClear
            />
            <Button type="primary" onClick={loadBalances} loading={loading}>
              {t("att:admin.search.btnSearch")}
            </Button>
          </Space>
          <Button
            onClick={() => {
              Modal.confirm({
                title: `${selectedYear}년 전체 사원 연차를 일괄 발생하시겠습니까?`,
                onOk: () => { dispatch(calculateAllRequest({ year: selectedYear })); },
              });
            }}
            loading={loading}
          >
            전체 일괄 발생
          </Button>
        </div>
      </Card>

      

      {/* ── 메인 테이블 ── */}
      <Card>
        <Table
          rowKey="balanceId"
          columns={columns}
          dataSource={allBalances}
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: t("att:leaveAdmin.emptyMsg") }}
        />
      </Card>

      {/* ═════════════════════════════════════════════════════ */}
      {/*  차감 모달                                              */}
      {/* ═════════════════════════════════════════════════════ */}
      <Modal
        title={t("att:leaveAdmin.deductModal.title")}
        visible={!!deductTarget}
        onCancel={() => setDeductTarget(null)}
        onOk={handleDeduct}
        okText={t("att:leaveAdmin.deductModal.btnDeduct")}
        confirmLoading={loading}
      >
        {deductTarget && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <label>{t("att:leaveAdmin.deductModal.halfType")}</label>
              <Select
                value={deductHalfType}
                onChange={setDeductHalfType}
                style={{ width: "100%", marginTop: 4 }}
                allowClear
                placeholder={t("att:leaveAdmin.deductModal.fullDay")}
              >
                <Select.Option value="AM">
                  {t("att:leaveAdmin.deductModal.halfAM")}
                </Select.Option>
                <Select.Option value="PM">
                  {t("att:leaveAdmin.deductModal.halfPM")}
                </Select.Option>
              </Select>
            </div>
            <div>
              <label>{t("att:leaveAdmin.deductModal.leaveDate")}</label>
              <DatePicker
                value={deductDate}
                onChange={setDeductDate}
                style={{ width: "100%", marginTop: 4 }}
              />
            </div>
            <div>
              <label>{t("att:leaveAdmin.deductModal.reason")}</label>
              <Input
                value={deductReason}
                onChange={(e) => setDeductReason(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>
          </Space>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  조정 모달                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Modal
        title={t("att:leaveAdmin.adjustModal.title")}
        visible={!!adjustTarget}
        onCancel={() => setAdjustTarget(null)}
        onOk={handleAdjust}
        okText={t("att:leaveAdmin.adjustModal.btnAdjust")}
        confirmLoading={loading}
      >
        {adjustTarget && (
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <label>{t("att:leaveAdmin.adjustModal.amount")}</label>
              <InputNumber
                value={adjustAmount}
                onChange={setAdjustAmount}
                step={0.5}
                style={{ width: "100%", marginTop: 4 }}
              />
              <small style={{ color: "#999" }}>
                {t("att:leaveAdmin.adjustModal.amountHint")}
              </small>
            </div>
            <div>
              <label>{t("att:leaveAdmin.adjustModal.reason")}</label>
              <Input
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>
          </Space>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/*  이력 모달                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      {/*
        이 모달은 조회 전용이라 onOk 대신 footer에 닫기 버튼만 둔다.
        모달을 닫을 때 clearLeaveDetail()로 grantHistory를 비운다.
        → 안 비우면 다른 사원의 이력을 열었을 때 이전 데이터가 잠깐 보인다.
      */}
      <Modal
        title={
          historyTarget
            ? `${historyTarget.empName} — ${t("att:leaveAdmin.historyModal.title")}`
            : t("att:leaveAdmin.historyModal.title")
        }
        visible={!!historyTarget}
        onCancel={() => {
          setHistoryTarget(null);
          dispatch(clearLeaveDetail());
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setHistoryTarget(null);
              dispatch(clearLeaveDetail());
            }}
          >
            {t("att:admin.editModal.btnCancel")}
          </Button>,
        ]}
        width={700}
      >
        <Table
          rowKey="grantId"
          columns={historyColumns}
          dataSource={grantHistory}
          loading={loading}
          pagination={false}
          size="small"
          locale={{ emptyText: t("att:leaveAdmin.historyModal.emptyMsg") }}
        />
      </Modal>
    </div>
  );
}
