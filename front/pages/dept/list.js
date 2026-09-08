// pages/dept/list.js
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AutoComplete, Button, Select, message } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  BookOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  BuildOutlined,
  TeamOutlined,
  UserOutlined,
  ApartmentOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  fetchDeptListRequest,
  fetchDeptFlatRequest,
  deleteDeptRequest,
  resetDeptState,
} from "../../reducers/dept/deptReducer";
import { fetchCompanyListRequest } from "../../reducers/com/companyReducer";
import StatTile from "../../components/StatTile";
import DeptDeleteModal from "../../components/DeptDeleteModal";

export default function DeptListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["dept", "common"]);

  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(
    user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ROOT"),
  );
  const { list: companies } = useSelector((state) => state.company);
  const {
    flatList: depts,
    stats,
    loading,
    error,
    success,
    message: deptMessage,
    pendingTransfer,
  } = useSelector((state) => state.dept);

  const [comId, setComId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [target, setTarget] = useState(null); // { deptId, deptName, deptCode, empCount, childCount }
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCompanyListRequest({ onepagelist: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (!router.isReady) return;
    const qComId = router.query.comId || user?.comId || "";
    setComId(qComId);
    if (qComId) {
      dispatch(fetchDeptListRequest(qComId));
      dispatch(fetchDeptFlatRequest(qComId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.comId]);

  useEffect(() => {
    if (!deleting || loading) return;
    if (success) {
      if (pendingTransfer && target) {
        // 완전삭제가 아니라 "이관 대기" 상태로 전환된 경우 → 사원 이관 화면으로 바로 이동
        message.info(deptMessage || t("list.transferRequiredMsg"));
        const deptIdForTransfer = target.deptId;
        setTarget(null);
        setDeleting(false);
        dispatch(resetDeptState());
        router.push({
          pathname: "/dept/transfer/list",
          query: { deptId: deptIdForTransfer },
        });
        return;
      }
      message.success(deptMessage || t("common:message.success"));
      setTarget(null);
      setDeleting(false);
      dispatch(resetDeptState());
      dispatch(fetchDeptListRequest(comId));
      dispatch(fetchDeptFlatRequest(comId));
    } else if (error) {
      message.error(error);
      setDeleting(false);
      dispatch(resetDeptState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, deleting]);

  const handleComChange = (value) => {
    router.push({
      pathname: "/dept/list",
      query: value ? { comId: value } : {},
    });
  };

  const filteredRows = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return depts || [];
    return (depts || []).filter(
      (d) =>
        (d.deptName || "").toLowerCase().includes(q) ||
        (d.deptCode || "").toLowerCase().includes(q),
    );
  }, [depts, keyword]);

  const suggestOptions = useMemo(
    () =>
      (depts || [])
        .filter((d) => {
          const q = keyword.trim().toLowerCase();
          return (
            q &&
            ((d.deptName || "").toLowerCase().includes(q) ||
              (d.deptCode || "").toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
        .map((d) => ({
          key: d.deptId,
          value: d.deptName,
          label: `${d.deptName} · ${d.deptCode}`,
        })),
    [depts, keyword],
  );

  const openDelete = (dept) => {
    const childCount = (depts || []).filter(
      (d) => d.parentId === dept.deptId,
    ).length;
    setTarget({
      deptId: dept.deptId,
      deptName: dept.deptName,
      deptCode: dept.deptCode,
      empCount: dept.empCount || 0,
      childCount,
    });
  };

  const confirmDelete = () => {
    if (!target) return;
    setDeleting(true);
    dispatch(deleteDeptRequest(target.deptId));
  };

  const rowClass = (d) => {
    if (d.depth === 0) return "dept-row-lv1";
    if (d.depth === 1) return "dept-row-lv2";
    if (d.depth === 2) return "dept-row-lv3";
    return "dept-row-lv4";
  };

  return (
    <div className="sb-content">
      {/* 페이지 헤더 */}
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("list.breadcrumbHome")}</Link> <RightOutlined />{" "}
            {t("list.breadcrumbOrg")} <RightOutlined /> {t("list.breadcrumbDept")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>
      </div>

      {/* 통계 타일 */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatTile
            icon={<ApartmentOutlined />}
            tone="blue"
            label={t("list.stats.totalDept")}
            value={comId ? stats?.deptTotal : "—"}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatTile
            icon={<BankOutlined />}
            tone="violet"
            label={t("list.stats.hq")}
            value={comId ? stats?.dept1Total : "—"}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatTile
            icon={<TeamOutlined />}
            tone="green"
            label={t("list.stats.deptTeam")}
            value={comId ? stats?.dept2Total : "—"}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatTile
            icon={<UserOutlined />}
            tone="amber"
            label={t("list.stats.totalEmp")}
            value={comId ? stats?.empTotal : "—"}
          />
        </div>
      </div>

      {/* 부서 트리 카드 */}
      <div className="sb-card">
        <div className="sb-toolbar">
          {companies?.length > 0 && (
            <div className="sb-field">
              <Select
                style={{ minWidth: 200 }}
                placeholder={t("list.comSelectPlaceholder")}
                value={comId || undefined}
                onChange={handleComChange}
                options={(companies || [])
                  // 비활성화(soft delete)된 회사는 부서 신규 등록 대상에서 제외
                  .filter((c) => c.comStatus !== "INACTIVE")
                  .map((c) => ({
                    value: c.comId,
                    label: c.comName,
                  }))}
                allowClear
              />
            </div>
          )}

          <div className="ac-wrap" style={{ maxWidth: 320, flex: "1 1 auto" }}>
            <AutoComplete
              style={{ width: "100%" }}
              value={keyword}
              options={suggestOptions}
              onChange={setKeyword}
              onSelect={(v) => setKeyword(v)}
            >
              <div
                className="sb-field sb-field--search"
                style={{ width: "100%" }}
              >
                <SearchOutlined />
                <input
                  placeholder={t("list.searchPlaceholder")}
                  autoComplete="off"
                  style={{ width: "100%" }}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </AutoComplete>
          </div>
          <div className="grow" />

          <span className="text-faint" style={{ fontSize: 12.5 }}>
            {t("list.resultCount", { count: filteredRows.length })}
          </span>

          {isAdmin && (
            <Link href={{ pathname: "/dept/add", query: comId ? { comId } : {} }}>
              <Button type="primary" icon={<PlusOutlined />}>
                {t("list.addBtn")}
              </Button>
            </Link>
          )}
        </div>

        <div className="sb-card__body--flush">
          {!comId ? (
            <div className="sb-empty">
              <BankOutlined style={{ fontSize: 34, opacity: 0.5 }} />
              <p>{t("list.selectCompanyEmpty")}</p>
              <p style={{ fontSize: 12.5, marginTop: 4 }}>
                {t("list.selectCompanyHint")}
              </p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="sb-empty">
              <ApartmentOutlined style={{ fontSize: 34, opacity: 0.5 }} />
              <p>{t("list.noMatchEmpty")}</p>
            </div>
          ) : (
            <table className="sb-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>{t("list.table.no")}</th>
                  <th style={{ minWidth: 180 }}>{t("list.table.deptName")}</th>
                  <th style={{ width: 80 }}>{t("list.table.code")}</th>
                  <th style={{ width: 130 }}>{t("list.table.parentDept")}</th>
                  <th style={{ width: 130 }}>{t("list.table.leader")}</th>
                  <th className="num" style={{ width: 72 }}>
                    {t("list.table.empCount")}
                  </th>
                  <th style={{ width: 80, textAlign: "center" }}>
                    {t("list.table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((d, idx) => (
                  <tr key={d.deptId} className={rowClass(d)}>
                    <td className="sb-hr-cell tnum">{idx + 1}</td>
                    <td className="dept-name-col">
                      <div className="dept-cell-name">
                        {d.depth === 0 ? (
                          <BankOutlined
                            className="dept-depth-icon"
                            style={{ color: "var(--sb-accent)" }}
                          />
                        ) : (
                          <RightOutlined className="dept-depth-icon" />
                        )}
                        <div>
                          <span className="dept-name-text">{d.deptName}</span>
                          {d.parentId ? (
                            <span
                              className="text-faint ms-1"
                              style={{ fontSize: 11.5 }}
                            >
                              ↳ {d.parentName}
                            </span>
                          ) : (
                            <span
                              className="sb-badge sb-badge--blue ms-1"
                              style={{ fontSize: 10.5, padding: "1px 7px" }}
                            >
                              {t("list.topLevelBadge")}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dept-code-chip">{d.deptCode}</span>
                    </td>
                    <td className="text-faint" style={{ fontSize: 13 }}>
                      {d.parentId ? d.parentName : "—"}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {d.leaderName || <span className="text-faint">—</span>}
                    </td>
                    <td className="num tnum">
                      {t("list.table.empCountValue", { count: d.empCount })}
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 4,
                        }}
                      >
                        <Link
                          href={{
                            pathname: "/dept/detail",
                            query: { deptId: d.deptId },
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
                          <Link
                            href={{
                              pathname: "/dept/edit",
                              query: { deptId: d.deptId, comId },
                            }}
                          >
                            <button
                              type="button"
                              className="sb-iconbtn"
                              title={t("list.editTooltip")}
                            >
                              <EditOutlined />
                            </button>
                          </Link>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            className="sb-iconbtn"
                            style={{ color: "var(--sb-red)" }}
                            title={t("list.deleteTooltip")}
                            onClick={() => openDelete(d)}
                          >
                            <DeleteOutlined />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {comId && (
          <div
            style={{
              borderTop: "1px solid var(--sb-border)",
              fontSize: 12,
              color: "var(--sb-ink-faint)",
            }}
            className="px-3 py-2 d-flex align-items-center gap-2"
          >
            <BuildOutlined />
            <span>
              {t("list.footerSummary", { count: filteredRows.length })}{" "}
              <code style={{ fontSize: 11 }}>{t("list.footerHierLabel")}</code>{" "}
              {t("list.footerNote")}
            </span>
          </div>
        )}
      </div>

      <DeptDeleteModal
        target={target}
        open={!!target}
        loading={deleting && loading}
        onClose={() => setTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
