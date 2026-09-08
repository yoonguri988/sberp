// pages/notice/list.js
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Table, Input, Select, Button, Pagination, Empty, Tag } from "antd";
import { PlusOutlined, SearchOutlined, NotificationOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { fetchNoticeRequest } from "../../reducers/notice/noticeReducer";

export default function NoticeListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["notice", "common"]);
  const { notices = [], noticesPaging, totalCnt = 0, loading, error } = useSelector((state) => state.notice);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("new");
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.roles?.includes("ROOT") || user?.roles?.includes("ROLE_ADMIN");

  // 목록 조회
  useEffect(() => {
    if (!router.isReady) return;
    const getQueryValue = (key, fallback = "") => {
      const value = router.query[key];
      return Array.isArray(value) ? value[0] : value || fallback;
    };
    const keywordValue = getQueryValue("keyword");
    const sortByValue = getQueryValue("sortBy", "new");
    const pstartno = Number(router.query.pstartno) || 1;
    const onepagelist = Number(router.query.onepagelist) || 10;
    setKeyword(keywordValue);
    setSortBy(sortByValue);
    dispatch(fetchNoticeRequest({ keyword: keywordValue, sortBy: sortByValue, pstartno, onepagelist }));
  }, [router.isReady, router.query, dispatch]);

  // 쿼리 변경
  const updateQuery = (next) => {
    router.push({ pathname: "/notice/list", query: { ...router.query, ...next } });
  };

  // 검색
  const handleSearch = (value) => {
    setKeyword(value);
    updateQuery({ keyword: value, pstartno: 1 });
  };

  // 정렬
  const handleSortChange = (value) => {
    setSortBy(value);
    updateQuery({ sortBy: value, pstartno: 1 });
  };

  // 페이지
  const handlePageChange = (page) => {
    updateQuery({ pstartno: page });
  };

  const handlePageSizeChange = (current, size) => {
    updateQuery({ pstartno: 1, onepagelist: size });
  };

  const pagingTotal = noticesPaging?.listtotal ?? 0;
  const currentPage = Number(noticesPaging?.current) || Number(router.query.pstartno) || 1;
  const pageSize = Number(router.query.onepagelist) || 10;

  const columns = [
    {
      title: t("list.table.title"),
      dataIndex: "btitle",
      key: "btitle",
      ellipsis: true,
      render: (title, record) => (
        <Link href={{ pathname: "/notice/detail", query: { bno: record.bno } }}>
          <span className="sb-table__name" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {record.urgent && <Tag color="white" style={{ marginRight: 0 }}>📌</Tag>}
            {title || "-"}
          </span>
        </Link>
      ),
    },
    {
      title: t("list.table.author"),
      dataIndex: "empName",
      key: "empName",
      width: 120,
      align: "center",
      render: (name) => name || "-",
    },
    {
      title: t("list.table.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      align: "center",
      render: (value) => value ? dayjs(value).format("YYYY-MM-DD") : "-",
    },
    {
      title: t("list.table.views"),
      dataIndex: "bhit",
      key: "bhit",
      width: 100,
      align: "center",
      render: (hit) => hit ?? 0,
    }
  ];

  return (
    <main className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("list.breadcrumbHome")}</Link>
            <i className="bi bi-chevron-right"></i>
            {t("list.breadcrumbWork")}
            <i className="bi bi-chevron-right"></i>
            {t("list.breadcrumbCurrent")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions my-3">
          {isAdmin && (
            <Link href="/notice/write">
              <Button type="primary" size="small" icon={<PlusOutlined />}>{t("list.writeBtn")}</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="sb-card mb-3">
        <div className="sb-toolbar" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{t("list.cardTitle")}</strong>
            <span className="sb-badge sb-badge--gray ms-2">{t("list.resultCount", { count: totalCnt })}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Input.Search style={{ width: 280 }} value={keyword} onChange={(e) => setKeyword(e.target.value)} onSearch={handleSearch} placeholder={t("list.searchPlaceholder")} allowClear enterButton={<SearchOutlined />} />
            <Select value={sortBy} onChange={handleSortChange} style={{ width: 120 }} options={[{ value: "new", label: t("list.sortNew") }, { value: "views", label: t("list.sortViews") }]} />
            <Button icon={<SearchOutlined />} onClick={() => handleSearch(keyword)}>{t("list.searchBtn")}</Button>
          </div>
        </div>

        {error && <div style={{ color: "#ff4d4f", padding: "12px 16px" }}>{error}</div>}

        <div className="sb-card__body--flush">
          <Table
            rowKey="bno"
            columns={columns}
            dataSource={notices}
            loading={loading}
            pagination={false}
            locale={{ emptyText: <Empty image={<NotificationOutlined style={{ fontSize: 32 }} />} description={t("list.emptyMsg")} /> }}
          />
        </div>

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
        {totalCnt > 0 && (
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
