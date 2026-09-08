// components/DeptDetailView.js
import React from "react";
import {
  ApartmentOutlined,
  RightOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { empStatusLabel } from "../utils/empStatus";

// 사원 상태(empStatus)는 백엔드에서 내려오는 값 그대로 비교/표시하므로 번역하지 않습니다.
const statusBadgeClass = (status) => {
  if (status === "재직") return "sb-badge sb-badge--green";
  if (status === "휴직") return "sb-badge sb-badge--amber";
  if (status === "퇴직") return "sb-badge sb-badge--cyan";
  return "sb-badge sb-badge--gray";
};

export default function DeptDetailView({
  dept,
  ancestorChain = [],
  deptEmpList = [],
  isMyDept = false,
}) {
  const { t } = useTranslation(["dept", "common"]);

  return (
    <>
      {isMyDept && (
        <div className="my-dept-banner">
          <CheckCircleOutlined /> {t("detailView.myDeptBanner")}
        </div>
      )}

      {/* 부서 기본 정보 */}
      <div className="sb-card mb-3">
        <div className="sb-card__head">
          <h2>
            <ApartmentOutlined className="me-2 text-soft" />
            {t("detailView.basicInfo.title")}
          </h2>
        </div>
        <div className="sb-card__body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="dd-label">{t("detailView.basicInfo.deptNameLabel")}</label>
              <div
                className="view-val view-val--accent"
                style={{ fontWeight: 700 }}
              >
                {dept.deptName}
              </div>
            </div>

            <div className="col-md-6">
              <label className="dd-label">{t("detailView.basicInfo.deptCodeLabel")}</label>
              <div className="view-val">
                <span className="dept-code-chip">{dept.deptCode}</span>
              </div>
            </div>

            <div className="col-md-6">
              <label className="dd-label">{t("detailView.basicInfo.parentDeptLabel")}</label>
              <div className="view-val">
                {dept.parentId ? (
                  <span
                    className="dept-code-chip"
                    style={{
                      background: "var(--sb-accent-soft)",
                      color: "var(--sb-accent)",
                    }}
                  >
                    {dept.parentName}
                  </span>
                ) : (
                  <>
                    <span className="dept-code-chip">{t("detailView.basicInfo.topLevelChip")}</span>
                    <span className="view-val-empty ms-1">NULL</span>
                  </>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <label className="dd-label">{t("detailView.basicInfo.leaderLabel")}</label>
              <div className="view-val">
                {dept.leaderId ? (
                  <>
                    <span
                      className="sb-avatar"
                      style={{ width: 22, height: 22, fontSize: 11 }}
                    >
                      {(dept.leaderName || "").charAt(0)}
                    </span>
                    <span className="ms-1">
                      {dept.leaderName} {dept.leaderPosName}
                    </span>
                    <span
                      className="text-faint ms-1"
                      style={{ fontSize: 11.5 }}
                    >
                      #{dept.leaderEmpNo}
                    </span>
                  </>
                ) : (
                  <span className="view-val-empty">{t("detailView.basicInfo.noLeader")}</span>
                )}
              </div>
            </div>

            <div className="col-12">
              <label className="dd-label">{t("detailView.basicInfo.hierPathLabel")}</label>
              <div className="hier-preview">
                {ancestorChain.map((node, i) => (
                  <React.Fragment key={i}>
                    <span
                      className={`hier-node${i === ancestorChain.length - 1 ? " hier-node--new" : ""}`}
                    >
                      {node}
                    </span>
                    {i !== ancestorChain.length - 1 && (
                      <RightOutlined className="hier-sep" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 소속 사원 */}
      <div className="sb-card">
        <div className="sb-card__head">
          <h2>
            <TeamOutlined className="me-2 text-soft" />
            {t("detailView.empSection.title")}
          </h2>
          <div className="right">
            <span className="sb-badge sb-badge--gray">
              {t("detailView.empSection.countValue", { count: deptEmpList.length })}
            </span>
          </div>
        </div>
        <div className="sb-card__body--flush">
          {deptEmpList.length > 0 ? (
            <table className="sb-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>{t("detailView.empSection.table.empNo")}</th>
                  <th>{t("detailView.empSection.table.empName")}</th>
                  <th style={{ width: 110 }}>{t("detailView.empSection.table.position")}</th>
                  <th style={{ width: 180 }}>{t("detailView.empSection.table.email")}</th>
                  <th style={{ width: 130 }}>{t("detailView.empSection.table.mobile")}</th>
                  <th style={{ width: 100 }}>{t("detailView.empSection.table.status")}</th>
                  <th style={{ width: 110 }}>{t("detailView.empSection.table.hireDate")}</th>
                </tr>
              </thead>
              <tbody>
                {deptEmpList.map((e) => (
                  <tr key={e.empId}>
                    <td className="sb-hr-cell tnum">{e.empNo}</td>
                    <td>
                      <div className="sb-rowuser">
                        <span
                          className="sb-avatar"
                          style={{ width: 26, height: 26, fontSize: 11.5 }}
                        >
                          {(e.empName || "").charAt(0)}
                        </span>
                        <span className="sb-table__name">{e.empName}</span>
                      </div>
                    </td>
                    <td>
                      <span>{e.posName}</span>
                      <span className="text-faint" style={{ fontSize: 11 }}>
                        #{e.posId}
                      </span>
                    </td>
                    <td className="sb-hr-cell" style={{ fontSize: 12.5 }}>
                      {e.empEmail}
                    </td>
                    <td className="sb-hr-cell tnum" style={{ fontSize: 12.5 }}>
                      {e.empMobile}
                    </td>
                    <td>
                      <span className={statusBadgeClass(e.empStatus)}>
                        {empStatusLabel(t, e.empStatus)}
                      </span>
                    </td>
                    <td className="sb-hr-cell" style={{ fontSize: 12.5 }}>
                      {e.hireDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="sb-empty">
              <TeamOutlined style={{ fontSize: 30, opacity: 0.5 }} />
              <p>{t("detailView.empSection.emptyMsg")}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
