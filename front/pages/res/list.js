// pages/res/list.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Input, Select, Pagination } from "antd";
import {
  BookOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  fetchResourceListRequest,
  fetchResourceCountRequest,
  deleteResourceRequest,
  resetResourceState,
} from "../../reducers/res/resourceReducer";
import ResourceDeleteModal from "../../components/ResourceDeleteModal";
const ONE_PAGE_LIST = 10;

export default function ResourceListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["res", "common"]);

  const { list, listCount, loading, error, success, deleteReason } =
    useSelector((state) => state.resource);
  const isAdmin = useSelector((state) =>
    state.auth?.user?.roles?.some((r) => r === "ROLE_ADMIN"),
  );

  const [keyword, setKeyword] = useState("");
  const [resType, setResType] = useState("");
  const [resStatus, setResStatus] = useState("");
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const routeError = router.query.error;

  const search = useMemo(() => {
    const q = router.query;
    return {
      keyword: q.keyword || "",
      resType: q.resType || "",
      resStatus: q.resStatus || "",
      pstartno: Number(q.pstartno) || 1,
      onepagelist: ONE_PAGE_LIST,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);

  useEffect(() => {
    if (!router.isReady) return;
    setKeyword(search.keyword);
    setResType(search.resType);
    setResStatus(search.resStatus);
    dispatch(fetchResourceListRequest(search));
    dispatch(
      fetchResourceCountRequest({
        keyword: search.keyword,
        resType: search.resType,
        resStatus: search.resStatus,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, search]);

  useEffect(() => {
    if (!deleting) return;
    if (success) {
      setTarget(null);
      setDeleting(false);
      dispatch(resetResourceState());
      dispatch(fetchResourceListRequest(search));
      dispatch(
        fetchResourceCountRequest({
          keyword: search.keyword,
          resType: search.resType,
          resStatus: search.resStatus,
        }),
      );
    } else if (error) {
      // 모달은 열어둔 채 에러만 표시 (비밀번호 재입력 유도)
      setDeleting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, deleting]);

  const runSearch = (page = 1) => {
    router.push({
      pathname: "/res/list",
      query: {
        ...(keyword ? { keyword } : {}),
        ...(resType ? { resType } : {}),
        ...(resStatus ? { resStatus } : {}),
        pstartno: page,
      },
    });
  };

  const paging = useMemo(() => {
    const pagetotal = Math.max(1, Math.ceil((listCount || 0) / ONE_PAGE_LIST));
    const current = Math.min(search.pstartno, pagetotal);
    return {
      current,
      listtotal: listCount || 0,
    };
  }, [listCount, search.pstartno]);

  const openDelete = (r) => {
    setTarget({
      resId: r.resId,
      resName: r.resName,
      resvCount: r.resvCount || 0,
    });
    dispatch(resetResourceState());
  };

  const confirmDelete = (password) => {
    if (!target) return;
    setDeleting(true);
    dispatch(deleteResourceRequest({ resId: target.resId, password }));
  };

  const typeBadge = (type) => {
    if (type === "ROOM")
      return (
        <span className="sb-badge sb-badge--blue">
          {t("enum.resType.ROOM")}
        </span>
      );
    if (type === "EQUIPMENT")
      return (
        <span className="sb-badge sb-badge--amber">
          {t("enum.resType.EQUIPMENT")}
        </span>
      );
    if (type === "VEHICLE")
      return (
        <span className="sb-badge sb-badge--green">
          {t("enum.resType.VEHICLE")}
        </span>
      );
    return <span className="sb-badge">{type}</span>;
  };

  const statusBadge = (status) => {
    if (status === "AVAILABLE")
      return (
        <span className="sb-badge sb-badge--green">
          {t("enum.resStatus.AVAILABLE")}
        </span>
      );
    if (status === "MAINTENANCE")
      return (
        <span className="sb-badge sb-badge--amber">
          {t("enum.resStatus.MAINTENANCE")}
        </span>
      );
    if (status === "DISABLED")
      return (
        <span className="sb-badge sb-badge--gray">
          {t("enum.resStatus.DISABLED")}
        </span>
      );
    return <span className="sb-badge sb-badge--gray">{status}</span>;
  };

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("list.breadcrumbHome")} · {t("list.breadcrumbAsset")} ·{" "}
            {t("shared.title")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/res/insert">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("list.addButton")}
            </Button>
          </Link>
        </div>
      </div>

      {routeError === "badPassword" && (
        <Alert
          className="a-alert on mb-3"
          type="error"
          message={t("list.alert.badPassword")}
          showIcon
        />
      )}
      {routeError === "hasReservations" && (
        <Alert
          className="a-alert on mb-3"
          type="error"
          message={t("list.alert.hasReservations")}
          showIcon
        />
      )}

      <div className="sb-card">
        <div className="sb-card__head">
          <h2>{t("list.cardTitle")}</h2>
          <span className="sub">{t("list.cardSubtitle")}</span>
        </div>
        <div className="sb-card__body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-4">
              <Input
                placeholder={t("list.searchPlaceholder")}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={() => runSearch(1)}
              />
            </div>
            <div className="col-6 col-md-2">
              <Select
                style={{ width: "100%" }}
                value={resType || ""}
                onChange={setResType}
                options={[
                  { value: "", label: t("list.allType") },
                  { value: "ROOM", label: t("enum.resType.ROOM") },
                  { value: "EQUIPMENT", label: t("enum.resType.EQUIPMENT") },
                  { value: "VEHICLE", label: t("enum.resType.VEHICLE") },
                ]}
              />
            </div>
            <div className="col-6 col-md-2">
              <Select
                style={{ width: "100%" }}
                value={resStatus || ""}
                onChange={setResStatus}
                options={[
                  { value: "", label: t("list.allStatus") },
                  {
                    value: "AVAILABLE",
                    label: t("enum.resStatus.AVAILABLE"),
                  },
                  {
                    value: "MAINTENANCE",
                    label: t("enum.resStatus.MAINTENANCE"),
                  },
                  { value: "DISABLED", label: t("enum.resStatus.DISABLED") },
                ]}
              />
            </div>
            <div className="col-12 col-md-auto">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => runSearch(1)}
              >
                {t("common:button.search")}
              </Button>
            </div>
          </div>
        </div>

        <div className="sb-card__body--flush">
          <table className="sb-table">
            <thead>
              <tr>
                <th style={{ width: 160 }}>{t("field.resCode")}</th>
                <th>{t("field.resName")}</th>
                <th style={{ width: 90 }}>{t("list.columns.resType")}</th>
                <th style={{ width: 160 }}>{t("field.location")}</th>
                <th className="num" style={{ width: 70 }}>
                  {t("field.quantity")}
                </th>
                <th style={{ width: 100 }}>{t("field.resStatus")}</th>
                <th style={{ width: 110 }}>{t("field.manager")}</th>
                <th style={{ width: 80, textAlign: "center" }}>
                  {t("list.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {(list || []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-faint py-4">
                    {t("list.emptyText")}
                  </td>
                </tr>
              ) : (
                list.map((r) => (
                  <tr key={r.resId}>
                    <td>
                      <b>{r.resCode}</b>
                    </td>
                    <td>{r.resName}</td>
                    <td>{typeBadge(r.resType)}</td>
                    <td className="text-faint" style={{ fontSize: 12.5 }}>
                      {r.location || "-"}
                    </td>
                    <td className="num">{r.quantity}</td>
                    <td>{statusBadge(r.resStatus)}</td>
                    <td style={{ fontSize: 12.5 }}>
                      {r.managerEmpName || "-"}
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <Link
                          href={{
                            pathname: "/res/detail",
                            query: { resId: r.resId },
                          }}
                        >
                          <button
                            type="button"
                            className="sb-iconbtn"
                            title={t("list.detailTooltip")}
                          >
                            <BookOutlined />
                          </button>
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              href={{
                                pathname: "/res/update",
                                query: { resId: r.resId },
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
                              title={t("common:button.delete")}
                              onClick={() => openDelete(r)}
                            >
                              <DeleteOutlined />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      <div
        className="d-flex align-items-center justify-content-between px-3 py-2"
        style={{ borderTop: "1px solid var(--sb-border)" }}
      >
        <span className="text-faint" style={{ fontSize: 12.5 }}>
          {t("list.totalCountPrefix")} <b>{paging.listtotal}</b>
          {t("list.totalCountSuffix")}
        </span>

        {paging.listtotal > ONE_PAGE_LIST && (
          <Pagination
            size="small"
            current={paging.current}
            total={paging.listtotal}
            pageSize={ONE_PAGE_LIST}
            showSizeChanger={false}
            onChange={(page) => runSearch(page)}
          />
        )}
      </div>

      <ResourceDeleteModal
        target={target}
        open={!!target}
        loading={deleting && loading}
        errorMessage={!deleting && error ? error : null}
        onClose={() => {
          setTarget(null);
          dispatch(resetResourceState());
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
