// pages/careers/index.js
// 채용 공개 사이트 - 공고 목록 (GET /api/public/recruit, 로그인 필요)
// 회사 구분 없이 전체 공고를 노출한다 (잡코리아 방식) — comId 파라미터 없음
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Empty, Pagination, Spin, Alert, Tag, Input } from "antd";
import { SearchOutlined, EnvironmentOutlined, TeamOutlined, ClockCircleOutlined, BankOutlined } from "@ant-design/icons";
import Link from "next/link";
import moment from "moment";

import ApplicantLayout from "../../components/ApplicantLayout";
import { fetchPublicRecruitListRequest } from "../../reducers/rec/recruitPublicReducer";

export default function CareersListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("careers");
  const { apctAccessToken } = useSelector((state) => state.apctAuth);
  const { list, paging, listLoading, listError } = useSelector(
    (state) => state.recruitPublic,
  );

  const page = Number(router.query.pstartno) || 1;
  const recTitle = router.query.recTitle || "";

  // 검색창 입력값(엔터/버튼 클릭 전까지는 URL에 반영하지 않음)
  const [keywordInput, setKeywordInput] = useState(recTitle);

  useEffect(() => {
    setKeywordInput(recTitle);
  }, [recTitle]);

  useEffect(() => {
    if (!router.isReady || !apctAccessToken) return;

    dispatch(
      fetchPublicRecruitListRequest({
        pstartno: page,
        recTitle: recTitle || undefined,
      })
    );
  }, [router.isReady, apctAccessToken, page, recTitle, dispatch]);

  const handlePageChange = (nextPage) => {
    router.push({
      pathname: "/careers",
      query: { ...router.query, pstartno: nextPage },
    });
  };

  const handleSearch = (value) => {
    const trimmed = value.trim();
    router.push({
      pathname: "/careers",
      query: trimmed ? { recTitle: trimmed, pstartno: 1 } : { pstartno: 1 },
    });
  };

  return (
    <ApplicantLayout>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#14251f", marginBottom: 6 }}>
          {t("list.title")}
        </h1>
        <p style={{ color: "#778", fontSize: 14 }}>
          {t("list.subtitle")}
        </p>
      </div>

      <Input.Search
        placeholder={t("list.searchPlaceholder")}
        allowClear
        enterButton={<SearchOutlined />}
        size="large"
        value={keywordInput}
        onChange={(e) => setKeywordInput(e.target.value)}
        onSearch={handleSearch}
        style={{ marginBottom: 20 }}
      />

      {listLoading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      )}

      {!listLoading && listError && (
        <Alert type="error" showIcon message={t("list.loadError")} description={listError} />
      )}

      {!listLoading && !listError && list.length === 0 && (
        <Empty
          description={
            recTitle
              ? t("list.emptySearch", { keyword: recTitle })
              : t("list.emptyDefault")
          }
          style={{ padding: "60px 0" }}
        />
      )}

      { !listLoading &&
        list.map((rec) => (
          <Link key={rec.recId} href={{pathname: "/careers/detail", query: { recId: rec.recId },}} passHref>
            <a className="crc-card">
              <div className="crc-title">{rec.recTitle}</div>
              <div className="crc-company">
                <BankOutlined /> {rec.comName}
              </div>
              <div className="crc-meta">
                <span>
                  <EnvironmentOutlined /> {rec.recDepartment}
                </span>
                <span>{rec.recPosition}</span>
                <span>
                  <TeamOutlined /> {t("list.headcountUnit", { count: rec.recHeadcount })}
                </span>
                <Tag color="blue">{rec.recEmploymentType}</Tag>
                <span>
                  <ClockCircleOutlined />{" "}
                  {rec.recEndDate
                    ? t("list.closingDate", { date: moment(rec.recEndDate).format("YYYY-MM-DD") })
                    : t("list.alwaysOpen")}
                </span>
              </div>
            </a>
          </Link>
        ))}

      {paging && paging.listtotal > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
          <Pagination
            current={paging.current || page}
            total={paging.listtotal}
            pageSize={paging.onepagelist || 10}
            showSizeChanger={false}
            onChange={handlePageChange}
          />
        </div>
      )}
    </ApplicantLayout>
  );
}