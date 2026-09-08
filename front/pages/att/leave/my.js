// pages/att/leave/my.js

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Table, Tag, message } from "antd";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { fetchMyBalancesRequest, fetchMyGrantsRequest, resetLeaveState, clearLeaveDetail, } from "../../../reducers/att/leaveBalanceReducer";

export default function LeaveMyPage() {

  const dispatch = useDispatch();

  // ── useTranslation: i18n 다국어 번역 함수 ──
  // t("att:leaveMy.title") → "내 연차 현황" (ko) 또는 "My Leave Balance" (en)
  // 배열의 첫 번째가 기본 namespace, 두 번째부터는 fallback
  const { t } = useTranslation(["att", "common"]);

  // ── useSelector: Redux store에서 필요한 상태를 꺼내오기 ──
  const { myBalances, grantHistory, loading, error } = useSelector((state) => state.leave);

  useEffect(() => {
    dispatch(fetchMyBalancesRequest());
    dispatch(fetchMyGrantsRequest());
    return () => {
        dispatch(resetLeaveState());
        dispatch(clearLeaveDetail());
    };
  }, [dispatch]);

  useEffect(() => {
    if (error) { message.error(error); dispatch(resetLeaveState()); }
  }, [error]);

  const columns = [
    {
      title: t("att:leaveMy.table.year"),
      dataIndex: "year",
      key: "year",
      width: 100,
      align: "center",
    },
    {
      title: t("att:leaveMy.table.totalDays"),
      dataIndex: "totalDays",
      key: "totalDays",
      width: 120,
      align: "center",
      // BigDecimal이 JSON에서 숫자로 내려오므로 소수점 표시
      render: (v) => (v != null ? `${v} ${t("att:leaveMy.table.unit")}` : "—"),
    },
    {
      title: t("att:leaveMy.table.usedDays"),
      dataIndex: "usedDays",
      key: "usedDays",
      width: 120,
      align: "center",
      render: (v) => (v != null ? `${v} ${t("att:leaveMy.table.unit")}` : "—"),
    },
    {
      title: t("att:leaveMy.table.remainingDays"),
      dataIndex: "remainingDays",
      key: "remainingDays",
      width: 120,
      align: "center",
      render: (v) => {
        if (v == null) return "—";
        // 잔여 연차가 3일 이하면 빨간색 Tag로 강조
        const color = v <= 3 ? "red" : "green";
        return <Tag color={color}>{v} {t("att:leaveMy.table.unit")}</Tag>;
      },
    },
  ];

  return (
    <div className="sb-page">
      {/* 페이지 헤더: 브레드크럼 + 제목 + 부제목 */}
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common:breadcrumbRoot")} &gt; {t("att:breadcrumb")} &gt; {t("att:leaveMy.breadcrumb")}
          </div>
          <h1>{t("att:leaveMy.title")}</h1>
          <p>{t("att:leaveMy.subtitle")}</p>
        </div>
      </div>

      <Card>
        <Table
          rowKey="balanceId"
          columns={columns}
          dataSource={myBalances}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t("att:leaveMy.emptyMsg") }}
        />
      </Card>

      {/* 연차 사용 이력 */}
      <Card style={{ marginTop: 16 }} title={t("att:leaveMy.historyCardTitle")}>
        <Table
          rowKey="grantId"
          columns={[
            {
              title: t("att:leaveMy.historyTable.grantDays"),
              dataIndex: "grantDays",
              key: "grantDays",
              width: 80,
              align: "center",
              render: (v) => {
                const color = v > 0 ? "blue" : "red";
                return <Tag color={color}>{v > 0 ? `+${v}` : v}</Tag>;
              },
            },
            {
              title: t("att:leaveMy.historyTable.grantType"),
              dataIndex: "grantType",
              key: "grantType",
              width: 100,
              render: (v) => {
                const colors = { REG: "blue", CAR: "cyan", ADJ: "orange", USE: "red" };
                return <Tag color={colors[v] || "default"}>{t(`att:leaveAdmin.historyModal.grantType.${v}`, v)}</Tag>;
              },
            },
            {
              title: t("att:leaveMy.historyTable.grantedAt"),
              dataIndex: "grantedAt",
              key: "grantedAt",
              width: 160,
              render: (v) => (v ? moment(v).format("YYYY-MM-DD HH:mm") : "—"),
            },
            {
              title: t("att:leaveMy.historyTable.reason"),
              dataIndex: "reason",
              key: "reason",
              render: (v) => v || "—",
            },
          ]}
          dataSource={grantHistory}
          loading={loading}
          pagination={{ defaultPageSize: 10 }}
          locale={{ emptyText: t("att:leaveAdmin.historyModal.emptyMsg") }}
        />
      </Card>
    </div>
  );
}