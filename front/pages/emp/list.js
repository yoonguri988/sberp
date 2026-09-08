// pages/emp/list.js
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Table, Select, Input, Button, Tag, Avatar, Pagination, message, } from "antd";
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { listEmpRequest, resetEmpState, } from "../../reducers/emp/empReducer";
import { listPosRequest } from "../../reducers/pos/posReducer";
import { empStatusLabel } from "../../utils/empStatus";

const STATUS_TAG = {
  재직: "green",
  휴직: "orange",
  퇴직: "red",
};

export default function EmpListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["emp", "common"]);

  // 재직 상태 옵션 (값은 백엔드와 동일한 한글 원본 유지, 라벨만 번역)
  const STATUS_OPTIONS = [
    { value: "", label: t("list.allStatusOption") },
    { value: "재직", label: t("common:empStatus.active") },
    { value: "휴직", label: t("common:empStatus.leave") },
    { value: "퇴직", label: t("common:empStatus.retired") },
  ];

  const { empList, paging, loading, error } = useSelector((state) => state.emp);
  const { posList } = useSelector((state) => state.pos);

  // 로그인 사용자 정보 (관리자 여부, 본인 ID)
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  const [filters, setFilters] = useState({
    deptId: "",
    posId: "",
    empStatus: "",
    keyword: "",
    page: 1,
  });

  // 직급 목록 로드 (필터 select용)
  useEffect(() => {
    dispatch(listPosRequest());
    return () => { dispatch(resetEmpState()); }
  }, [dispatch]);

  useEffect(() => {
    if (error) { message.error(error); dispatch(resetEmpState()); }
  }, [error]);

  // URL 쿼리 → 필터 동기화 → 목록 조회
  useEffect(() => {
    if (!router.isReady) return;
    const {
      deptId = "",
      posId = "",
      empStatus = "",
      keyword = "",
      page = "1",
    } = router.query;

    const next = {
      deptId,
      posId,
      empStatus,
      keyword,
      page: Number(page),
    };
    setFilters(next);
    dispatch(listEmpRequest(next));
  }, [router.isReady, router.query, dispatch]);

  const pushQuery = (next) => {
    router.push({
      pathname: "/emp/list",
      query: { ...router.query, ...next },
    });
  };

  const handleSearch = () => {
    pushQuery({ ...filters, page: 1 });
  };

  const handleReset = () => {
    router.push({ pathname: "/emp/list" });
  };

  const columns = [
    {
      title: t("list.table.empNo"),
      dataIndex: "empNo",
      key: "empNo",
      width: 110,
    },
    {
      title: t("list.table.empName"),
      key: "empName",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar size="small">
            {record.empName ? record.empName.charAt(0) : "?"}
          </Avatar>
          <span style={{ fontWeight: 600 }}>{record.empName}</span>
        </div>
      ),
    },
    { title: t("list.table.dept"), dataIndex: "deptName", key: "deptName", width: 120 },
    { title: t("list.table.pos"), dataIndex: "posName", key: "posName", width: 100 },
    {
      title: t("list.table.email"),
      dataIndex: "empEmail",
      key: "empEmail",
      ellipsis: true,
    },
    { title: t("list.table.mobile"), dataIndex: "empMobile", key: "empMobile", width: 140 },
    {
      title: t("list.table.status"),
      dataIndex: "empStatus",
      key: "empStatus",
      width: 90,
      render: (status) => (
        <Tag color={STATUS_TAG[status] || "default"}>{empStatusLabel(t, status)}</Tag>
      ),
    },
    { title: t("list.table.hireDate"), dataIndex: "hireDate", key: "hireDate", width: 110 },
    {
      title: "",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
          {(isAdmin || user?.empId === record.empId) && (
            <Link
              href={{
                pathname: "/emp/detail",
                query: { empId: record.empId },
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                title={t("list.viewTooltip")}
              />
            </Link>
          )}
          {isAdmin && (
            <Link
              href={{
                pathname: "/emp/edit",
                query: { empId: record.empId },
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                title={t("list.editTooltip")}
              />
            </Link>
          )}
        </div>
      ),
    },
  ];

  //////
  return (
    <div className="sb-page">
      {/* 페이지 헤더 */}
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
            {t("common.breadcrumbOrg")} &gt; {t("list.breadcrumbCurrent")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>
        {isAdmin && (
          <div className="sb-page-head__actions">
            <Link href="/emp/add">
              <Button type="primary" icon={<PlusOutlined />}>
                {t("list.addBtn")}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* 목록 카드 */}
      <Card>
        {/* 검색 툴바 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <Select
            style={{ width: 160 }}
            value={filters.posId || ""}
            onChange={(v) => setFilters((f) => ({ ...f, posId: v }))}
            options={[
              { value: "", label: t("list.allPosOption") },
              ...posList.map((p) => ({ value: String(p.posId), label: p.posName })),
            ]}
          />
          <Select
            style={{ width: 130 }}
            value={filters.empStatus || ""}
            onChange={(v) => setFilters((f) => ({ ...f, empStatus: v }))}
            options={STATUS_OPTIONS}
          />
          <Input
            style={{ width: 200 }}
            placeholder={t("list.searchPlaceholder")}
            value={filters.keyword}
            onChange={(e) =>
              setFilters((f) => ({ ...f, keyword: e.target.value }))
            }
            onPressEnter={handleSearch}
          />
          <Button icon={<SearchOutlined />} onClick={handleSearch}>
            {t("common:button.search")}
          </Button>
          {(filters.keyword || filters.posId || filters.empStatus) && (
            <Button onClick={handleReset}>{t("common:button.reset")}</Button>
          )}
        </div>

        {/* 테이블 */}
        <Table
          rowKey="empId"
          columns={columns}
          dataSource={empList}
          loading={loading}
          pagination={false}
          locale={{ emptyText: t("list.emptyMsg") }}
        />

        {/* 페이지네이션 */}
        {paging && paging.listtotal > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 12,
            }}
          >
            <span style={{ color: "#999", fontSize: 12.5 }}>
              {t("list.totalCountPrefix")}<b>{paging.listtotal}</b>{t("list.totalCountSuffix")}
            </span>
            <Pagination
              size="small"
              current={filters.page}
              total={paging.listtotal}
              pageSize={paging.onepagelist || 10}
              showSizeChanger={false}
              onChange={(p) => pushQuery({ page: p })}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
