// pages/dept/transfer/pending.js
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, Input } from "antd";
import {
  ArrowRightOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { fetchPendingListRequest } from "../../../reducers/dept/deptTransferReducer";

export default function DeptTransferPendingPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["dept", "common"]);

  const { pendingList } = useSelector((state) => state.deptTransfer);

  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.keyword || "";
    setKeyword(q);
    dispatch(fetchPendingListRequest(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, router.query.keyword]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push({
      pathname: "/dept/transfer/pending",
      query: keyword ? { keyword } : {},
    });
  };

  const rows = pendingList || [];

  return (
    <div className="sb-content">
      <div className="sb-card mb-3">
        <div className="sb-toolbar">
          <span className="fw-semibold">
            <BranchesOutlined /> {t("transfer.pending.title")}
          </span>
          <div className="grow" />
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <Input
              placeholder={t("transfer.pending.searchPlaceholder")}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ minWidth: 200 }}
            />
            <Button htmlType="submit" icon={<SearchOutlined />}>
              {t("common:button.search")}
            </Button>
          </form>
        </div>

        <div
          className="px-3 pt-3"
          style={{ fontSize: 12, color: "var(--sb-ink-faint)" }}
        >
          <InfoCircleOutlined /> {t("transfer.pending.infoNote")}
        </div>

        <div className="sb-card__body--flush mt-2">
          {rows.length > 0 ? (
            <table className="sb-table">
              <thead>
                <tr>
                  <th>{t("transfer.pending.table.deptName")}</th>
                  <th style={{ width: 140 }}>{t("transfer.pending.table.deptCode")}</th>
                  <th style={{ width: 120 }}>{t("transfer.pending.table.empCount")}</th>
                  <th style={{ width: 180 }}>{t("transfer.pending.table.pendingSince")}</th>
                  <th style={{ width: 160 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.deptId}>
                    <td>{d.deptName}</td>
                    <td>
                      <span className="dept-code-chip">{d.deptCode}</span>
                    </td>
                    <td>
                      <span className="sb-badge sb-badge--amber">
                        {t("transfer.pending.table.empCountValue", { count: d.empCount })}
                      </span>
                    </td>
                    <td>{d.updatedAt}</td>
                    <td>
                      <Link
                        href={{
                          pathname: "/dept/transfer/list",
                          query: { deptId: d.deptId },
                        }}
                      >
                        <Button
                          type="primary"
                          size="small"
                          icon={<ArrowRightOutlined />}
                        >
                          {t("transfer.pending.continueBtn")}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sb-empty">
              <CheckCircleOutlined style={{ fontSize: 30, opacity: 0.5 }} />
              {keyword ? (
                <p>{t("transfer.pending.noMatchEmpty", { keyword })}</p>
              ) : (
                <p>{t("transfer.pending.emptyMsg")}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
