// pages/proj/proj_list.js

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import {
  Table,
  Input,
  DatePicker,
  Segmented,
  Button,
  Pagination,
  Empty,
  Tag,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { fetchProjRequest } from "../../reducers/proj/projReducer";

const { RangePicker } = DatePicker;

// 상태값에 따른 태그 색상
const STATUS_TAG_COLOR = {
  TODO: "default",
  DOING: "processing",
  DONE: "success",
};

export default function ProjListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("proj");

  // 상태 필터 버튼에 쓰일 옵션
  const STATUS_OPTIONS = [
    { label: t("common.statusAll"), value: "" },
    { label: "TODO", value: "TODO" },
    { label: "DOING", value: "DOING" },
    { label: "DONE", value: "DONE" },
  ];

  const {
    projects = [],
    projectsPaging,
    loading,
    error,
  } = useSelector((state) => state.proj);

  // 로그인 사용자 정보 — ROOT 계정의 타 회사 프로젝트 클릭 제한에 사용
  const { user } = useSelector((state) => state.auth);
  const isRoot = user?.roles?.includes("ROOT");
  const myComId = user?.comId;

  // 검색창/필터 입력값을 화면에 표시하기 위한 로컬 state
  // (실제 조회는 URL 쿼리스트링을 기준으로 동작함)
  const [keyword, setKeyword] = useState("");
  const [proStatus, setProStatus] = useState("");
  const [dateRange, setDateRange] = useState(null);

  // URL 쿼리(주소창)가 바뀔 때마다 그 조건으로 프로젝트 목록을 다시 조회
  useEffect(() => {
    if (!router.isReady) return;

    // router.query 값은 문자열 하나 또는 배열로 올 수 있어서 정리해줌
    const getQueryValue = (key, fallback = "") => {
      const value = router.query[key];
      return Array.isArray(value) ? value[0] : value || fallback;
    };

    const keyword = getQueryValue("keyword");
    const proStatus = getQueryValue("proStatus");
    const startDate = getQueryValue("startDate");
    const endDate = getQueryValue("endDate");
    const pstartno = Number(router.query.pstartno) || 1;
    const onepagelist = Number(router.query.onepagelist) || 10;

    // 화면에 보이는 입력값들도 URL과 맞춰줌
    setKeyword(keyword);
    setProStatus(proStatus);
    setDateRange(
      startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : null
    );

    dispatch(
      fetchProjRequest({
        keyword,
        proStatus,
        startDate,
        endDate,
        pstartno,
        onepagelist,
      })
    );
  }, [router.isReady, router.query, dispatch]);

  // 검색/필터/페이지 조건이 바뀔 때마다 이 함수로 URL 쿼리를 갱신
  // → 위 useEffect가 그 변화를 감지해서 다시 조회함
  const updateQuery = (next) => {
    router.push({
      pathname: "/proj/proj_list",
      query: {
        ...router.query,
        ...next,
      },
    });
  };

  // 검색어 입력 후 검색 실행
  const handleSearch = (value) => {
    setKeyword(value);
    updateQuery({ keyword: value, pstartno: 1 });
  };

  // 상태 필터(전체/TODO/DOING/DONE) 변경
  const handleStatusChange = (value) => {
    setProStatus(value);
    updateQuery({ proStatus: value, pstartno: 1 });
  };

  // 기간(날짜 범위) 변경
  const handleDateChange = (dates) => {
    setDateRange(dates);
  };

  // 페이지 번호 변경
  const handlePageChange = (page) => {
    updateQuery({ pstartno: page });
  };

  // 페이지당 표시 개수 변경
  const handlePageSizeChange = (current, size) => {
    updateQuery({ pstartno: 1, onepagelist: size });
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      title: t("list.table.name"),
      dataIndex: "proName",
      key: "proName",
      render: (name, record) => {
        const isOtherCompany = isRoot && record.comId !== myComId;

        if (isOtherCompany) {
          return (
            <span className="sb-table__name sb-table__name--disabled">
              {name}
            </span>
          );
        }

        return (
          <Link
            href={{
              pathname: "/proj/proj_detail",
              query: { proId: record.proId },
            }}
          >
            <span className="sb-table__name" style={{ cursor: "pointer" }}>
              {name}
            </span>
          </Link>
        );
      },
    },
    {
      title: t("list.table.desc"),
      dataIndex: "proDesc",
      key: "proDesc",
      ellipsis: true,
      render: (desc) => <span className="sb-table__muted">{desc || "-"}</span>,
    },
    {
      title: t("list.table.creator"),
      dataIndex: "empName",
      key: "empName",
      width: 100,
      align: "center",
      render: (name) => name || "-",
    },
    {
      title: t("list.table.memberCnt"),
      key: "memberCnt",
      width: 110,
      align: "center",
      render: (_, record) => {
        const isOtherCompany = isRoot && record.comId !== myComId;
        const countLabel = `${record.memberCnt ?? 0}${t("list.table.memberCntSuffix")}`;

        if (isOtherCompany) {
          return (
            <Button type="text" size="small" icon={<TeamOutlined />} disabled>
              {countLabel}
            </Button>
          );
        }

        return (
          <Link
            href={{
              pathname: "/proj/proj_member",
              query: { proId: record.proId },
            }}
          >
            <Button type="text" size="small" icon={<TeamOutlined />}>
              {countLabel}
            </Button>
          </Link>
        );
      },
    },
    {
      title: t("list.table.status"),
      dataIndex: "proStatus",
      key: "proStatus",
      width: 100,
      align: "center",
      render: (status) => (
        <Tag color={STATUS_TAG_COLOR[status] || "default"}>
          {status || "-"}
        </Tag>
      ),
    },
    {
      title: t("list.table.period"),
      key: "period",
      width: 220,
      align: "center",
      render: (_, record) => (
        <span className="sb-hr-cell tnum">
          {record.startDate ? dayjs(record.startDate).format("YYYY-MM-DD") : "-"}
          {" ~ "}
          {record.endDate ? dayjs(record.endDate).format("YYYY-MM-DD") : "-"}
        </span>
      ),
    },
    {
      title: t("list.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      align: "center",
      render: (value) => (value ? dayjs(value).format("YYYY-MM-DD") : "-"),
    },
  ];

  const totalCnt = projectsPaging?.listtotal ?? 0;
  const currentPage =
    Number(projectsPaging?.current) || Number(router.query.pstartno) || 1;
  const pageSize = Number(router.query.onepagelist) || 10;

  return (
    <main className="sb-content">
      {/* 페이지 제목 영역 */}
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common.breadcrumbHome")} <i className="bi bi-chevron-right"></i> {t("common.breadcrumbWork")}{" "}
            <i className="bi bi-chevron-right"></i> {t("common.breadcrumbProj")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>

        <div className="sb-page-head__actions my-3">
          <Link href="/proj/proj_create">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("list.createBtn")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="sb-card mb-3">
        {/* 검색/필터 영역 */}
        <div
          className="sb-toolbar"
          style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{t("list.cardTitle")}</strong>
            <span className="sb-badge sb-badge--gray ms-2">{t("list.resultCount", { count: totalCnt })}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Input.Search
              style={{ width: 280 }}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              placeholder={t("list.searchPlaceholder")}
              allowClear
              enterButton={<SearchOutlined />}
            />

            <Segmented
              value={proStatus}
              onChange={handleStatusChange}
              options={STATUS_OPTIONS}
            />

            <RangePicker
              value={dateRange}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
            />

            <Button
              icon={<SearchOutlined />}
              onClick={() => {
              updateQuery({
              keyword,
              proStatus,
              startDate: dateRange?.[0] ? dateRange[0].format("YYYY-MM-DD") : "",
              endDate: dateRange?.[1] ? dateRange[1].format("YYYY-MM-DD") : "",
              pstartno: 1,
              });
              }}
              >
            {t("list.searchBtn")}
            </Button>
          </div>
        </div>

        {error && (
          <div style={{ color: "#ff4d4f", padding: "12px 16px" }}>{error}</div>
        )}

        {/* 프로젝트 목록 테이블 */}
        <div className="sb-card__body--flush">
          <Table
            rowKey="proId"
            columns={columns}
            dataSource={projects}
            loading={loading}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={<FolderOpenOutlined style={{ fontSize: 32 }} />}
                  description={t("list.emptyMsg")}
                />
              ),
            }}
          />
        </div>
        {/* 페이지네이션 */}
        <div
          style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          borderTop: "1px solid var(--sb-border)",
          }}
          >
          <span style={{ color: "#999", fontSize: 12.5 }}>
          {t("list.totalCountPrefix")}<b>{totalCnt}</b>{t("list.totalCountSuffix")}
          </span>
          {totalCnt > pageSize && (
          <Pagination
          size="small"
          current={currentPage}
          total={totalCnt}
          pageSize={pageSize}
          showSizeChanger={false}
          onChange={handlePageChange}
          />
          )}
          </div>
      </div>
    </main>
  );
}