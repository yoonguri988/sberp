// pages/admin/resv/list.js
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Input, Pagination, Select, message } from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HourglassOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  StopOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useTranslation } from "react-i18next";

import {
  fetchAdminResvListRequest,
  fetchAdminResvCountRequest,
  fetchAdminResvStatsRequest,
  approveResvRequest,
  rejectResvRequest,
  resetAdminResvState,
} from "../../../reducers/resv/adminResvReducer";
import ApproveResvModal from "../../../components/ApproveResvModal";
import RejectResvModal from "../../../components/RejectResvModal";
import StatTile from "../../../components/StatTile";

const ONE_PAGE_LIST = 10;

const STATUS_TABS = [
  { value: "", labelKey: "common:label.all" },
  { value: "WAI", labelKey: "status.waiting" },
  { value: "APP", labelKey: "status.approved" },
  { value: "REJ", labelKey: "status.rejected" },
  { value: "NORET", labelKey: "status.notReturned" },
];

function typeBadge(type, t) {
  if (type === "ROOM")
    return <span className="sb-badge sb-badge--blue">{t("resType.room")}</span>;
  if (type === "EQUIPMENT")
    return <span className="sb-badge sb-badge--violet">{t("resType.equipment")}</span>;
  if (type === "VEHICLE")
    return <span className="sb-badge sb-badge--cyan">{t("resType.vehicle")}</span>;
  return <span className="sb-badge">{type}</span>;
}

function statusBadge(status, t) {
  if (status === "WAI")
    return <span className="sb-badge sb-badge--amber">{t("status.waiting")}</span>;
  if (status === "APP")
    return <span className="sb-badge sb-badge--green">{t("status.approved")}</span>;
  if (status === "REJ")
    return <span className="sb-badge sb-badge--red">{t("status.rejected")}</span>;
  if (status === "NORET")
    return <span className="sb-badge sb-badge--red">{t("status.notReturned")}</span>;
  return <span className="sb-badge sb-badge--gray">{status}</span>;
}

function returnCell(r, t) {
  if (r.returnDt)
    return (
      <span className="sb-badge sb-badge--green">
        {moment(r.returnDt).format("YYYY-MM-DD HH:mm:ss")}
      </span>
    );
  if ((r.status === "APP" || r.status === "NORET") && !r.returnDt)
    return <span className="sb-badge sb-badge--amber">{t("returnStatus.notReturned")}</span>;
  return <span className="view-val-empty">{t("returnStatus.notApplicable")}</span>;
}

// 노쇼/미반납 알림이 나간 건에 한해 계산되는 이력 기반 위험도(0~1) 뱃지.
// riskScore는 학습된 확률이 아니라 규칙 기반 가중합 값이라 "예측"이 아닌 "위험도"로 표기한다.
function riskBadge(r, t) {
  if (!r.noshowAlertAt || r.riskScore === null || r.riskScore === undefined) {
    return <span className="view-val-empty">{t("returnStatus.notApplicable")}</span>;
  }
  const pct = Math.round(r.riskScore * 100);
  if (r.riskScore >= 0.66)
    return (
      <span className="sb-badge sb-badge--red" title={t("risk.highDesc")}>
        {t("risk.high")} {pct}%
      </span>
    );
  if (r.riskScore >= 0.33)
    return (
      <span className="sb-badge sb-badge--amber" title={t("risk.mediumDesc")}>
        {t("risk.medium")} {pct}%
      </span>
    );
  return (
    <span className="sb-badge sb-badge--gray" title={t("risk.lowDesc")}>
      {t("risk.low")} {pct}%
    </span>
  );
}

export default function AdminResvListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["resv", "common"]);

  const { list, listCount, stats, loading, error, success } = useSelector(
    (state) => state.adminResv,
  );

  const [resType, setResType] = useState("");
  const [startDt, setStartDt] = useState(null);
  const [endDt, setEndDt] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [approveTarget, setApproveTarget] = useState(null); // { revId, resName }
  const [rejectTarget, setRejectTarget] = useState(null); // { revId, resName }
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const prevLoading = useRef(false);

  const status = router.query.status || "";
  const currentPage = Number(router.query.pstartno) || 1;

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;

    const defaultEndDt = moment().format("YYYY-MM-DD");
    const defaultStartDt = moment().subtract(29, "days").format("YYYY-MM-DD");
    const resolvedStartDt = q.startDt || defaultStartDt;
    const resolvedEndDt = q.endDt || defaultEndDt;

    setResType(q.resType || "");
    setStartDt(resolvedStartDt);
    setEndDt(resolvedEndDt);
    setKeyword(q.keyword || "");

    const search = {
      status: q.status || "",
      resType: q.resType || "",
      startDt: resolvedStartDt,
      endDt: resolvedEndDt,
      keyword: q.keyword || "",
      pstartno: Number(q.pstartno) || 1,
      onepagelist: ONE_PAGE_LIST,
    };
    dispatch(fetchAdminResvListRequest(search));
    dispatch(fetchAdminResvCountRequest(search));
    dispatch(fetchAdminResvStatsRequest(search));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, router.query]);

  useEffect(() => {
    if (!approving) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("adminList.approveSuccess"));
        setApproveTarget(null);
        setApproving(false);
        dispatch(resetAdminResvState());
      } else if (error) {
        message.error(error);
        setApproving(false);
        dispatch(resetAdminResvState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, approving]);

  useEffect(() => {
    if (!rejecting) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("adminList.rejectSuccess"));
        setRejectTarget(null);
        setRejecting(false);
        dispatch(resetAdminResvState());
      } else if (error) {
        message.error(error);
        setRejecting(false);
        dispatch(resetAdminResvState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, rejecting]);

  useEffect(() => {
    prevLoading.current = loading;
  }, [loading]);

  const runSearch = (page = 1) => {
    router.push({
      pathname: "/admin/resv/list",
      query: {
        ...(status ? { status } : {}),
        ...(resType ? { resType } : {}),
        ...(startDt ? { startDt } : {}),
        ...(endDt ? { endDt } : {}),
        ...(keyword ? { keyword } : {}),
        pstartno: page,
      },
    });
  };

  const goStatus = (v) => {
    router.push({
      pathname: "/admin/resv/list",
      query: { ...(v ? { status: v } : {}) },
    });
  };

  const openApprove = (r) => {
    setApproveTarget({ revId: r.revId, resName: r.resName });
    dispatch(resetAdminResvState());
  };
  const confirmApprove = () => {
    if (!approveTarget) return;
    setApproving(true);
    dispatch(approveResvRequest(approveTarget.revId));
  };

  const openReject = (r) => {
    setRejectTarget({ revId: r.revId, resName: r.resName });
    dispatch(resetAdminResvState());
  };
  const confirmReject = (rejectReason) => {
    if (!rejectTarget) return;
    setRejecting(true);
    dispatch(rejectResvRequest({ revId: rejectTarget.revId, rejectReason }));
  };

  const startOffset = (currentPage - 1) * ONE_PAGE_LIST;

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("adminList.breadcrumbHome")}</Link> <span>&gt;</span>
            <Link href="/admin/resv/list?status=WAI">
              {t("adminList.breadcrumbList")}
            </Link>{" "}
            <span>&gt;</span>
            {t("adminList.breadcrumbCurrent")}
          </div>
          <h1>{t("adminList.title")}</h1>
          <p>{t("adminList.subtitle")}</p>
        </div>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <StatTile
              icon={<BookOutlined />}
              tone="blue"
              label={t("adminList.statsTotal")}
              value={stats.resvTotal}
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatTile
              icon={<HourglassOutlined />}
              tone="amber"
              label={t("status.waiting")}
              value={stats.waiTotal}
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatTile
              icon={<CheckCircleOutlined />}
              tone="green"
              label={t("status.approved")}
              value={stats.appTotal}
            />
          </div>
          <div className="col-sm-6 col-lg-3">
            <StatTile
              icon={<StopOutlined />}
              tone="red"
              label={t("status.rejected")}
              value={stats.rejTotal}
            />
          </div>
        </div>
      )}

      <div className="sb-card">
        <div className="sb-card__head">
          <h2>{t("adminList.cardTitle")}</h2>
          <div className="right">
            <div className="sb-segment">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  className={status === tab.value ? "active" : ""}
                  onClick={() => goStatus(tab.value)}
                >
                  {t(tab.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="row align-items-end g-2"
          style={{
            padding: "16px 18px",
            borderTop: "1px solid var(--sb-border)",
            margin: 0,
          }}
        >
          <div className="col-auto" style={{ minWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">
              {t("adminList.filterResType")}
            </label>
            <Select
              style={{ width: "100%" }}
              value={resType || ""}
              onChange={setResType}
              options={[
                { value: "", label: t("common:label.all") },
                { value: "ROOM", label: t("resType.room") },
                { value: "EQUIPMENT", label: t("resType.equipment") },
                { value: "VEHICLE", label: t("resType.vehicle") },
              ]}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">
              <CalendarOutlined /> {t("adminList.filterStartDt")}
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={startDt ? moment(startDt) : null}
              onChange={(d) => setStartDt(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">{t("adminList.filterEndDt")}</label>
            <DatePicker
              style={{ width: "100%" }}
              value={endDt ? moment(endDt) : null}
              onChange={(d) => setEndDt(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 180 }}>
            <label className="form-label small fw-semibold mb-1">{t("adminList.filterResName")}</label>
            <Input
              style={{ width: "100%" }}
              placeholder={t("adminList.filterResNamePlaceholder")}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={() => runSearch(1)}
            />
          </div>
          <div className="col-auto">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => runSearch(1)}
            >
              {t("adminList.searchButton")}
            </Button>
          </div>
        </div>

        <div className="sb-search-note px-3">
          <InfoCircleOutlined /> {t("adminList.searchNotePrefix")}
          <b>{t("adminList.searchNoteEmphasis")}</b>
          {t("adminList.searchNoteSuffix")}
        </div>

        <div className="sb-card__body--flush">
          {(list || []).length === 0 ? (
            <div className="sb-empty">
              <BookOutlined style={{ fontSize: 30, opacity: 0.5 }} />
              <p>{t("adminList.empty")}</p>
            </div>
          ) : (
            <table className="sb-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>{t("adminList.tableNo")}</th>
                  <th>{t("adminList.tableResName")}</th>
                  <th style={{ width: 90 }}>{t("adminList.tableType")}</th>
                  <th style={{ width: 130 }}>{t("adminList.tableLocation")}</th>
                  <th style={{ width: 100 }}>{t("adminList.tableApplicant")}</th>
                  <th className="num" style={{ width: 60 }}>
                    {t("adminList.tableQuantity")}
                  </th>
                  <th style={{ width: 120 }}>{t("adminList.tableStartDt")}</th>
                  <th style={{ width: 120 }}>{t("adminList.tableEndDt")}</th>
                  <th style={{ width: 90 }}>{t("adminList.tableReturnDt")}</th>
                  <th style={{ width: 100 }}>{t("adminList.tableRisk")}</th>
                  <th style={{ width: 50 }}>{t("adminList.tableStatus")}</th>
                  <th style={{ width: 100, textAlign: "center" }}>{t("adminList.tableManage")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r, idx) => (
                  <tr key={r.revId}>
                    <td className="tnum">{listCount - startOffset - idx}</td>
                    <td>
                      <b>{r.resName}</b>
                    </td>
                    <td>{typeBadge(r.resType, t)}</td>
                    <td className="text-faint" style={{ fontSize: 12.5 }}>
                      {r.location || "-"}
                    </td>
                    <td>
                      <span className="ms-1">{r.empName}</span>
                    </td>
                    <td className="num">{r.quantity}</td>
                    <td>{moment(r.startDt).format("YYYY-MM-DD HH:mm:ss")}</td>
                    <td>{moment(r.endDt).format("YYYY-MM-DD HH:mm:ss")}</td>
                    <td>{returnCell(r, t)}</td>
                    <td>{riskBadge(r, t)}</td>
                    <td>{statusBadge(r.status, t)}</td>
                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          href={{
                            pathname: "/admin/resv/detail",
                            query: { revId: r.revId },
                          }}
                        >
                          <button
                            type="button"
                            className="sb-iconbtn"
                            title={t("adminList.detailButtonTitle")}
                          >
                            <BookOutlined />
                          </button>
                        </Link>
                        {r.status === "WAI" && (
                          <>
                            <button
                              type="button"
                              className="sb-iconbtn"
                              style={{ color: "var(--sb-green, #389e0d)" }}
                              title={t("common:button.approve")}
                              onClick={() => openApprove(r)}
                            >
                              <CheckCircleOutlined />
                            </button>
                            <button
                              type="button"
                              className="sb-iconbtn"
                              style={{ color: "var(--sb-red)" }}
                              title={t("common:button.reject")}
                              onClick={() => openReject(r)}
                            >
                              <CloseCircleOutlined />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {listCount > 0 && (
            <div
              className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ borderTop: "1px solid var(--sb-border)" }}
            >
              <span className="text-faint" style={{ fontSize: 12.5 }}>
                {t("adminList.totalCountPrefix")} <b>{listCount}</b>{t("adminList.totalCountSuffix")}
              </span>
              <Pagination
                size="small"
                current={currentPage}
                total={listCount}
                pageSize={ONE_PAGE_LIST}
                showSizeChanger={false}
                onChange={runSearch}
              />
            </div>
          )}
        </div>
      </div>

      <ApproveResvModal
        target={approveTarget}
        open={!!approveTarget}
        loading={approving && loading}
        onClose={() => setApproveTarget(null)}
        onConfirm={confirmApprove}
      />
      <RejectResvModal
        target={rejectTarget}
        open={!!rejectTarget}
        loading={rejecting && loading}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}