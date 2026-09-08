// pages/apct/rank.js
// 공고별 fit_score(AI 적합도) 순위 (ROLE_ADMIN) - GET /api/admin/applicant/rank?recId&page&size
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Card, Table, Select, Button, Tag, Pagination, Empty } from "antd";
import { ArrowLeftOutlined, TrophyFilled } from "@ant-design/icons";

import { fetchApplicantRankRequest } from "../../reducers/apct/applicantReducer";
import { fetchRecruitAdminListRequest } from "../../reducers/rec/recruitReducer";

const MEDAL_COLOR = ["#d4af37", "#a8a8a8", "#b46a35"];

export default function ApplicantRankPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("apct");
  const { rankList, rankPaging, rankLoading } = useSelector((state) => state.applicant);
  const { list: recruitOptions } = useSelector((state) => state.recruit);

  const [recId, setRecId] = useState(undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchRecruitAdminListRequest({ onepagelist: 100, pstartno: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.recId) setRecId(Number(router.query.recId));
  }, [router.isReady, router.query.recId]);

  const runSearch = (nextPage = 1) => {
    if (!recId) return;
    setPage(nextPage);
    dispatch(fetchApplicantRankRequest({ recId, page: nextPage - 1, size: 10 }));
  };

  useEffect(() => {
    if (!recId) return;
    runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recId]);

  const columns = [
    {
      title: t("rank.table.rank"),
      key: "rank",
      width: 70,
      align: "center",
      render: (_, __, idx) => {
        const rankNo = (rankPaging?.number || 0) * (rankPaging?.size || 10) + idx + 1;
        return rankNo <= 3 ? (
          <TrophyFilled style={{ color: MEDAL_COLOR[rankNo - 1], fontSize: 18 }} />
        ) : (
          rankNo
        );
      },
    },
    {
      title: t("rank.table.name"),
      dataIndex: "apctName",
      key: "apctName",
      render: (v, record) => (
        <Link href={`/apct/detail?apctId=${record.apctId}`}>
          <b style={{ cursor: "pointer" }}>{v}</b>
        </Link>
      ),
    },
    { title: t("rank.table.email"), dataIndex: "apctEmail", key: "apctEmail", width: 200 },
    {
      title: t("rank.table.fitScore"),
      dataIndex: "rsmFitScore",
      key: "rsmFitScore",
      width: 140,
      align: "center",
      render: (v) =>
        v != null ? (
          <Tag color={v >= 80 ? "green" : v >= 50 ? "orange" : "default"}>{t("rank.fitScoreUnit", { score: v })}</Tag>
        ) : (
          <Tag>{t("rank.notAnalyzed")}</Tag>
        ),
    },
    {
      title: t("rank.table.status"),
      dataIndex: "apctStatus",
      key: "apctStatus",
      width: 110,
      align: "center",
    },
  ];

  return (
    <div className="sb-page">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <Link href="/apct/list">
            <Button type="text" className="sb-page-back" icon={<ArrowLeftOutlined />}>
              {t("rank.backBtn")}
            </Button>
          </Link>
          <div className="sb-breadcrumb">{t("rank.breadcrumb")}</div>
          <h1>{t("rank.title")}</h1>
          <p>{t("rank.subtitle")}</p>
        </div>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Select
            style={{ width: 300 }}
            placeholder={t("rank.recruitPlaceholder")}
            showSearch
            optionFilterProp="label"
            value={recId}
            onChange={(v) => setRecId(v)}
            options={(recruitOptions || []).map((r) => ({
              value: r.recId,
              label: r.recTitle,
            }))}
          />
        </div>

        {!recId && <Empty description={t("rank.selectRecruitEmpty")} />}

        {recId && (
          <>
            <Table
              rowKey="apctId"
              columns={columns}
              dataSource={rankList}
              loading={rankLoading}
              pagination={false}
              locale={{ emptyText: t("rank.emptyTable") }}
            />
            {rankPaging && rankPaging.totalElements > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 12,
                }}
              >
                <span style={{ color: "#999", fontSize: 12.5 }}>
                  {t("rank.totalCountPrefix")}<b>{rankPaging.totalElements}</b>{t("rank.totalCountSuffix")}
                </span>
                <Pagination
                  size="small"
                  current={page}
                  total={rankPaging.totalElements}
                  pageSize={rankPaging.size || 10}
                  showSizeChanger={false}
                  onChange={runSearch}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
