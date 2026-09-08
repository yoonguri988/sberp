// pages/resv/my.js
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Input, Pagination, Select, message } from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  RollbackOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useTranslation } from "react-i18next";

import {
  fetchMyResvListRequest,
  fetchMyResvCountRequest,
  cancelResvRequest,
  returnResvRequest,
  resetResvState,
} from "../../reducers/resv/resvReducer";
import CancelResvModal from "../../components/CancelResvModal";
import ReturnResvModal from "../../components/ReturnResvModal";

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

export default function ResvMyPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["resv", "common"]);

  const { myList, myListCount, loading, error, success } = useSelector(
    (state) => state.resv,
  );

  const [resType, setResType] = useState("");
  const [startDt, setStartDt] = useState(null);
  const [endDt, setEndDt] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [target, setTarget] = useState(null); // { revId, resName }
  const [canceling, setCanceling] = useState(false);
  const [returnTarget, setReturnTarget] = useState(null); // { revId, resName }
  const [returning, setReturning] = useState(false);
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
    dispatch(fetchMyResvListRequest(search));
    dispatch(fetchMyResvCountRequest(search));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, router.query]);

  useEffect(() => {
    if (!canceling) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("my.cancelSuccess"));
        setTarget(null);
        setCanceling(false);
        dispatch(resetResvState());
      } else if (error) {
        message.error(error);
        setCanceling(false);
        dispatch(resetResvState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, canceling]);

  useEffect(() => {
    if (!returning) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("my.returnSuccess"));
        setReturnTarget(null);
        setReturning(false);
        dispatch(resetResvState());
      } else if (error) {
        message.error(error);
        setReturning(false);
        dispatch(resetResvState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, returning]);

  useEffect(() => {
    prevLoading.current = loading;
  }, [loading]);

  const runSearch = (page = 1) => {
    router.push({
      pathname: "/resv/my",
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
      pathname: "/resv/my",
      query: { ...(v ? { status: v } : {}) },
    });
  };

  const openCancel = (r) => {
    setTarget({ revId: r.revId, resName: r.resName });
    dispatch(resetResvState());
  };

  const confirmCancel = () => {
    if (!target) return;
    setCanceling(true);
    dispatch(cancelResvRequest(target.revId));
  };

  const openReturn = (r) => {
    setReturnTarget({ revId: r.revId, resName: r.resName });
    dispatch(resetResvState());
  };

  const confirmReturn = () => {
    if (!returnTarget) return;
    setReturning(true);
    dispatch(returnResvRequest(returnTarget.revId));
  };

  const startOffset = (currentPage - 1) * ONE_PAGE_LIST;

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("my.breadcrumbHome")}</Link> <span>&gt;</span>{" "}
            <Link href="/resv/my">{t("my.breadcrumbList")}</Link> <span>&gt;</span>{" "}
            {t("my.breadcrumbCurrent")}
          </div>
          <h1>{t("my.title")}</h1>
          <p>{t("my.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/resv/insert">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("my.newResvButton")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="sb-card">
        <div className="sb-card__head">
          <h2>{t("my.cardTitle")}</h2>
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
              {t("my.filterResType")}
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
              <CalendarOutlined /> {t("my.filterStartDt")}
            </label>
            <DatePicker
              style={{ width: "100%" }}
              value={startDt ? moment(startDt) : null}
              onChange={(d) => setStartDt(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 150 }}>
            <label className="form-label small fw-semibold mb-1">{t("my.filterEndDt")}</label>
            <DatePicker
              style={{ width: "100%" }}
              value={endDt ? moment(endDt) : null}
              onChange={(d) => setEndDt(d ? d.format("YYYY-MM-DD") : null)}
            />
          </div>
          <div className="col-auto" style={{ minWidth: 180 }}>
            <label className="form-label small fw-semibold mb-1">{t("my.filterResName")}</label>
            <Input
              style={{ width: "100%" }}
              placeholder={t("my.filterResNamePlaceholder")}
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
              {t("my.searchButton")}
            </Button>
          </div>
        </div>

        <div className="sb-search-note px-3">
          <InfoCircleOutlined /> {t("my.searchNotePrefix")}
          <b>{t("my.searchNoteEmphasis")}</b>
          {t("my.searchNoteSuffix")}
        </div>

        <div className="sb-card__body--flush">
          {(myList || []).length === 0 ? (
            <div className="sb-empty">
              <BookOutlined style={{ fontSize: 30, opacity: 0.5 }} />
              <p>{t("my.empty")}</p>
            </div>
          ) : (
            <table className="sb-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>{t("my.tableNo")}</th>
                  <th>{t("my.tableResName")}</th>
                  <th style={{ width: 90 }}>{t("my.tableType")}</th>
                  <th style={{ width: 130 }}>{t("my.tableLocation")}</th>
                  <th className="num" style={{ width: 60 }}>
                    {t("my.tableQuantity")}
                  </th>
                  <th style={{ width: 120 }}>{t("my.tableStartDt")}</th>
                  <th style={{ width: 120 }}>{t("my.tableEndDt")}</th>
                  <th style={{ width: 90 }}>{t("my.tableReturnDt")}</th>
                  <th style={{ width: 50 }}>{t("my.tableStatus")}</th>
                  <th style={{ width: 120 }}>{t("my.tableApproverOrReject")}</th>
                  <th style={{ width: 100, textAlign: "center" }}>{t("my.tableManage")}</th>
                </tr>
              </thead>
              <tbody>
                {myList.map((r, idx) => (
                  <tr key={r.revId}>
                    <td className="tnum">{myListCount - startOffset - idx}</td>
                    <td>
                      <b>{r.resName}</b>
                    </td>
                    <td>{typeBadge(r.resType, t)}</td>
                    <td className="text-faint" style={{ fontSize: 12.5 }}>
                      {r.location || "-"}
                    </td>
                    <td className="num">{r.quantity}</td>
                    <td>{moment(r.startDt).format("YYYY-MM-DD HH:mm:ss")}</td>
                    <td>{moment(r.endDt).format("YYYY-MM-DD HH:mm:ss")}</td>
                    <td>{returnCell(r, t)}</td>
                    <td>{statusBadge(r.status, t)}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.status === "APP" && (
                        <>
                          <div>{r.approvedEmpName}</div>
                          <div className="text-faint">
                            {moment(r.approvedAt).format("YYYY-MM-DD HH:mm:ss")}
                          </div>
                        </>
                      )}
                      {r.status === "REJ" && (
                        <span style={{ color: "var(--sb-red)" }}>
                          {r.rejectReason}
                        </span>
                      )}
                      {r.status === "WAI" && (
                        <span className="view-val-empty">-</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          href={{
                            pathname: "/resv/detail",
                            query: { revId: r.revId },
                          }}
                        >
                          <button
                            type="button"
                            className="sb-iconbtn"
                            title={t("my.detailButtonTitle")}
                          >
                            <BookOutlined />
                          </button>
                        </Link>
                        {r.status === "WAI" && (
                          <>
                            <Link
                              href={{
                                pathname: "/resv/edit",
                                query: { revId: r.revId },
                              }}
                            >
                              <button
                                type="button"
                                className="sb-iconbtn"
                                title={t("common:button.edit")}
                              >
                                <EditOutlined />
                              </button>
                            </Link>
                            <button
                              type="button"
                              className="sb-iconbtn"
                              style={{ color: "var(--sb-red)" }}
                              title={t("common:button.cancel")}
                              onClick={() => openCancel(r)}
                            >
                              <CloseCircleOutlined />
                            </button>
                          </>
                        )}
                        {(r.status === "APP" || r.status === "NORET") &&
                          !r.returnDt && (
                            <button
                              type="button"
                              className="sb-iconbtn"
                              style={{ color: "var(--sb-green, #389e0d)" }}
                              title={t("common:button.return")}
                              onClick={() => openReturn(r)}
                            >
                              <RollbackOutlined />
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {myListCount > 0 && (
            <div
              className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{ borderTop: "1px solid var(--sb-border)" }}
            >
              <span className="text-faint" style={{ fontSize: 12.5 }}>
                {t("my.totalCountPrefix")} <b>{myListCount}</b>{t("my.totalCountSuffix")}
              </span>
              <Pagination
                size="small"
                current={currentPage}
                total={myListCount}
                pageSize={ONE_PAGE_LIST}
                showSizeChanger={false}
                onChange={runSearch}
              />
            </div>
          )}
        </div>
      </div>

      <CancelResvModal
        target={target}
        open={!!target}
        loading={canceling && loading}
        onClose={() => setTarget(null)}
        onConfirm={confirmCancel}
      />
      <ReturnResvModal
        target={returnTarget}
        open={!!returnTarget}
        loading={returning && loading}
        onClose={() => setReturnTarget(null)}
        onConfirm={confirmReturn}
      />
    </div>
  );
}
