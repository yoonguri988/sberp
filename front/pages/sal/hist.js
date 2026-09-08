// pages/sal/hist/list.js
// 급여 변경이력 조회 (ROLE_ADMIN, 조회 전용) - GET /api/salhist
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, Table, Button, Tag, Select, DatePicker, Pagination, Empty } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";

import { searchSalHistRequest, resetSalHistState } from "../../reducers/sal/salHistReducer";
import EmployeePicker from "../../components/EmployeePicker";

const { RangePicker } = DatePicker;

const DOM_COLOR = {
  SALARY_STANDARD: "geekblue",
  SALARY_PAYMENT: "purple",
  SALARY_ACCOUNT: "cyan",
};

const CHG_COLOR = {
  CREATE: "green",
  UPDATE: "blue",
  DELETE: "red",
  STATUS_CHANGE: "gold",
  MANUAL_ADJUST: "volcano",
};

function prettyJson(value) {
  if (!value) return "-";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch (e) {
    return value;
  }
}

export default function SalHistListPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const { histList, paging, loading } = useSelector((state) => state.salHist);

  const DOM_LABEL = {
    SALARY_STANDARD: { text: t("hist.domain.salaryStandard"), color: DOM_COLOR.SALARY_STANDARD },
    SALARY_PAYMENT: { text: t("hist.domain.salaryPayment"), color: DOM_COLOR.SALARY_PAYMENT },
    SALARY_ACCOUNT: { text: t("hist.domain.salaryAccount"), color: DOM_COLOR.SALARY_ACCOUNT },
  };

  const CHG_LABEL = {
    CREATE: { text: t("hist.changeType.create"), color: CHG_COLOR.CREATE },
    UPDATE: { text: t("hist.changeType.update"), color: CHG_COLOR.UPDATE },
    DELETE: { text: t("hist.changeType.delete"), color: CHG_COLOR.DELETE },
    STATUS_CHANGE: { text: t("hist.changeType.statusChange"), color: CHG_COLOR.STATUS_CHANGE },
    MANUAL_ADJUST: { text: t("hist.changeType.manualAdjust"), color: CHG_COLOR.MANUAL_ADJUST },
  };

  const [actorEmpId, setActorEmpId] = useState(undefined);
  const [changeType, setChangeType] = useState("");
  const [range, setRange] = useState(null);
  const [page, setPage] = useState(1);

  const runSearch = (nextPage = 1) => {
    setPage(nextPage);
    dispatch(searchSalHistRequest({
      actorEmpId,
      changeType: changeType || undefined,
      from: range?.[0] ? range[0].startOf("day").format("YYYY-MM-DDTHH:mm:ss") : undefined,
      to: range?.[1] ? range[1].endOf("day").format("YYYY-MM-DDTHH:mm:ss") : undefined,
      page: nextPage - 1,
      size: 10,
    }));
  };

  useEffect(() => {
    runSearch(1);
    return () => dispatch(resetSalHistState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const columns = [
    { title: t("hist.columns.createdAt"), dataIndex: "createdAt", key: "createdAt", width: 150,
      render: (v) => (v ? moment(v).format("YYYY-MM-DD HH:mm:ss") : "-") },
    { title: t("hist.columns.actorName"), dataIndex: "actorName", key: "actorName", width: 100 },
    { title: t("hist.columns.trgtEmpId"), dataIndex: "trgtEmpId", key: "trgtEmpId", width: 100, align: "center",
      render: (v) => v ?? "-" },
    { title: t("hist.columns.domType"), dataIndex: "domType", key: "domType", width: 100, align: "center",
      render: (v) => {
        const info = DOM_LABEL[v] || { text: v, color: "default" };
        return <Tag color={info.color}>{info.text}</Tag>;
      } },
    { title: t("hist.columns.chgType"), dataIndex: "chgType", key: "chgType", width: 100, align: "center",
      render: (v) => {
        const info = CHG_LABEL[v] || { text: v, color: "default" };
        return <Tag color={info.color}>{info.text}</Tag>;
      } },
    { title: t("hist.columns.descr"), dataIndex: "descr", key: "descr", ellipsis: true, render: (v) => v || "-" },
  ];

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">{t("hist.breadcrumb")}</div>
          <h1>{t("hist.title")}</h1>
          <p>{t("hist.subtitle")}</p>
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <EmployeePicker
            value={actorEmpId}
            onChange={setActorEmpId}
            placeholder={t("hist.actorSearchPlaceholder")}
            style={{ width: 220 }}
          />
          <Select
            style={{ width: 140 }}
            value={changeType}
            onChange={setChangeType}
            options={[
              { value: "", label: t("hist.changeTypeAllOption") },
              { value: "CREATE", label: t("hist.changeType.create") },
              { value: "UPDATE", label: t("hist.changeType.update") },
              { value: "DELETE", label: t("hist.changeType.delete") },
              { value: "STATUS_CHANGE", label: t("hist.changeType.statusChange") },
              { value: "MANUAL_ADJUST", label: t("hist.changeType.manualAdjust") },
            ]}
          />
          <RangePicker value={range} onChange={setRange} />
          <Button icon={<SearchOutlined />} onClick={() => runSearch(1)}>{t("hist.searchBtn")}</Button>
        </div>

        <Table
          rowKey="histId"
          columns={columns}
          dataSource={histList}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t("hist.emptyText") }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{t("hist.beforeChangeLabel")}</div>
                  <pre className="sb-code-block">{prettyJson(record.bfrVal)}</pre>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{t("hist.afterChangeLabel")}</div>
                  <pre className="sb-code-block">{prettyJson(record.aftVal)}</pre>
                </div>
              </div>
            ),
          }}
        />

        {paging && paging.totalElements > 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12 }}>
            <span style={{ color: "#999", fontSize: 12.5 }}>{t("hist.totalCount", { count: paging.totalElements })}</span>
            <Pagination
              size="small"
              current={page}
              total={paging.totalElements}
              pageSize={paging.size || 10}
              showSizeChanger={false}
              onChange={runSearch}
            />
          </div>
        ) : (
          !loading && histList.length === 0 && <Empty description={t("hist.emptyDescription")} style={{ marginTop: 16 }} />
        )}
      </Card>

      <style jsx>{`
        :global(.sb-code-block) {
          background: #f6f8fa;
          border: 1px solid #eaeaea;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 12px;
          max-height: 260px;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}
