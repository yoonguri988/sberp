// pages/att/my.js

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Table, Tag, message } from "antd";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { myAttRequest, resetAttState, } from "../../reducers/att/attReducer";

// ── 근무 상태별 Tag 색상 매핑 ──
// 컴포넌트 바깥에 선언하는 이유:
//   - 리렌더링마다 새 객체를 만들지 않으므로 성능상 이득
//   - 상수(변하지 않는 값)는 컴포넌트 밖에 두는 것이 관례
const STATUS_COLOR = {
  NORMAL: "green",
  LATE: "orange",
  EARLY_LEAVE: "gold",
  ABSENT: "red",
  AM_HALF: "cyan",
  PM_HALF: "blue",
  ANNUAL: "purple",
};

export default function AttMyPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation(["att", "common"]);

  // ── state.att에서 데이터 가져오기 ──
  const { myAttList, loading, error } = useSelector((state) => state.att);

  useEffect(() => {
    dispatch(myAttRequest());

    // cleanup: 페이지 이탈 시 att 상태 초기화
    return () => {
      dispatch(resetAttState());
    };
  }, [dispatch]);

  useEffect(() => {
  if (error) { message.error(error); dispatch(resetAttState()); }
  }, [error]);

  const columns = [
    {
      title: t("att:myHistory.table.date"),
      dataIndex: "attDate",
      key: "attDate",
      width: 120,
      // ── moment로 날짜 포맷팅 ──
      // 백엔드에서 LocalDate가 "2026-08-24" 문자열로 내려온다.
      // moment()로 파싱 후 원하는 형식으로 출력한다.
      // Ant Design v4는 moment를 기본 사용한다 (dayjs 아님).
      render: (v) => (v ? moment(v).format("YYYY-MM-DD") : "—"),
    },
    {
      title: t("att:myHistory.table.checkIn"),
      dataIndex: "checkIn",
      key: "checkIn",
      width: 100,
      // LocalDateTime → "2026-08-24T09:00:00" 형식
      // 시:분만 필요하므로 HH:mm 으로 포맷
      render: (v) => (v ? moment(v).format("HH:mm") : "—"),
    },
    {
      title: t("att:myHistory.table.checkOut"),
      dataIndex: "checkOut",
      key: "checkOut",
      width: 100,
      render: (v) => (v ? moment(v).format("HH:mm") : "—"),
    },
    {
      title: t("att:myHistory.table.workMinutes"),
      dataIndex: "workMinutes",
      key: "workMinutes",
      width: 100,
      align: "center",
      render: (v) => (v != null ? v : "—"),
    },
    {
      title: t("att:myHistory.table.overtimeMinutes"),
      dataIndex: "overtimeMinutes",
      key: "overtimeMinutes",
      width: 100,
      align: "center",
      render: (v) => (v != null && v > 0 ? v : "—"),
    },
    {
      title: t("att:myHistory.table.nightMinutes"),
      dataIndex: "nightMinutes",
      key: "nightMinutes",
      width: 100,
      align: "center",
      render: (v) => (v != null && v > 0 ? v : "—"),
    },
    {
      title: t("att:myHistory.table.status"),
      dataIndex: "attStatus",
      key: "attStatus",
      width: 100,
      align: "center",
      // ── 상태값을 Tag 컴포넌트로 렌더링 ──
      // s = "NORMAL", "LATE" 등 (백엔드 enum 문자열)
      // t(`att:status.${s}`) → i18n에서 한글/영문 라벨 가져오기
      // STATUS_COLOR[s] → 색상 매핑
      render: (s) => {
        if (!s) return "—";
        return (
          <Tag color={STATUS_COLOR[s] || "default"}>
            {t(`att:status.${s}`, s)}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common:breadcrumbRoot")} &gt; {t("att:breadcrumb")} &gt; {t("att:myHistory.breadcrumb")}
          </div>
          <h1>{t("att:myHistory.title")}</h1>
          <p>{t("att:myHistory.subtitle")}</p>
        </div>
      </div>

      <Card>
        <Table
          rowKey="attId"
          columns={columns}
          dataSource={myAttList}
          loading={loading}
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: t("att:myHistory.emptyMsg") }}
        />
      </Card>
    </div>
  );
}
