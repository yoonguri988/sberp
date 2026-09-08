// pages/com/my.js
import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Card, Spin, Tag, Avatar } from "antd";
import {
  EditOutlined,
  BankOutlined,
  IdcardOutlined,
  FileTextOutlined,
  PhoneOutlined,
  TagOutlined,
  ApartmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { fetchMyCompanyRequest } from "../../reducers/com/companyReducer";
import { getGrpLabel } from "../../constants/industryCode";
import resolveFileUrl from "../../constants/resolveFileUrl";

const TONE_BY_DEPTH = { 0: "blue", 1: "green", 2: "amber" };

export default function ComMyPage() {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation(["com", "common"]);
  const { myCompany, loading } = useSelector((state) => state.company);
  const { user } = useSelector((state) => state.auth);

  const com = myCompany?.com;
  const stats = myCompany?.deptStats || {};
  const deptList = myCompany?.deptList || [];
  const canEdit = user?.roles?.includes("ADMIN") || user?.roles?.includes("ROOT");

  useEffect(() => {
    dispatch(fetchMyCompanyRequest());
  }, [dispatch]);

  if (loading || !com) {
    return (
      <div className="sb-page" style={{ textAlign: "center", padding: 80 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div className="sb-page">
      {/* 페이지 헤더 */}
      <div className="sb-page-head" style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("breadcrumb.home")}</Link> <span>&gt;</span>{" "}
            <Link href="/com/my">{t("breadcrumb.comInfo")}</Link> <span>&gt;</span>{" "}
            {t("my.current")}
          </div>
          <h1>{t("my.title")}</h1>
          <p>{t("my.subtitle")}</p>
        </div>
        {canEdit && (
          <div className="sb-page-head__actions">
            <Link href={{ pathname: "/com/edit", query: { comId: com.comId } }}>
              <button type="button" className="btn btn-sb btn-sm">
                <EditOutlined /> {t("my.editButton")}
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* 회사 요약 카드 */}
      <div
        className="sb-card mc-summary mb-3"
        style={{ display: "flex", alignItems: "center", gap: 20, padding: 20 }}
      >
        <div className="mc-logo">
          {com.comLogo ? (
            <Avatar shape="square" size={56} src={resolveFileUrl(com.comLogo)} />
          ) : (
            <Avatar shape="square" size={56}>
              {com.comName?.charAt(0)}
            </Avatar>
          )}
        </div>
        <div className="mc-summary__main" style={{ flex: 1 }}>
          <div className="mc-summary__name" style={{ fontSize: 18, fontWeight: 700 }}>
            {com.comName}
          </div>
          <div className="mc-summary__sub" style={{ color: "#888" }}>
            {t("my.ceoPrefix")} {com.comCeo}
          </div>
        </div>
        <div className="mc-stat-divider" />
        <div className="mc-stat-col">
          <div className="mc-stat-col__label">{t("my.totalEmp")}</div>
          <div className="mc-stat-col__val">
            {stats.empTotal ?? "-"}
            {t("my.personSuffix")}
          </div>
        </div>
        <div className="mc-stat-col">
          <div className="mc-stat-col__label">{t("my.headOffice")}</div>
          <div className="mc-stat-col__val">{stats.dept0Total ?? "-"}</div>
        </div>
        <div className="mc-stat-col">
          <div className="mc-stat-col__label">{t("my.deptTeam")}</div>
          <div className="mc-stat-col__val">{stats.dept1Total ?? "-"}</div>
        </div>
      </div>

      {/* 본문 2단 구성 */}
      <div className="row g-3">
        <div className="col-lg-5">
          <Card className="sb-card h-100" title={t("my.basicInfoCard")}>
            <InfoRow icon={<BankOutlined />} label={t("my.comNameLabel")} value={com.comName} />
            <InfoRow icon={<IdcardOutlined />} label={t("my.ceoLabel")} value={com.comCeo} />
            <InfoRow icon={<FileTextOutlined />} label={t("my.bizNoLabel")} value={com.bizNo} />
            <InfoRow icon={<PhoneOutlined />} label={t("my.telLabel")} value={com.comTel} />
            <InfoRow
              icon={<TagOutlined />}
              label={t("my.industryLabel")}
              value={
                <>
                  <span>
                    {getGrpLabel(com.industryGrpCode, i18n.language) || t("my.uncategorized")}
                  </span>
                  <span className="text-faint" style={{ fontWeight: 500 }}>
                    {" "}
                    ({com.industryCode})
                  </span>
                </>
              }
            />
          </Card>
        </div>

        <div className="col-lg-7">
          <Card className="sb-card h-100" title={t("my.orgCard")} bodyStyle={{ padding: 0 }}>
            <div className="mc-org">
              {deptList.map((dept, idx) => {
                const tone = TONE_BY_DEPTH[dept.depth] ?? "cyan";
                return (
                  <div
                    key={dept.deptId ?? idx}
                    className={`mc-org-row depth-${dept.depth} tone-${tone}`}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px" }}
                  >
                    <div className="mc-org-icon">
                      {dept.depth === 1 ? <ApartmentOutlined /> : <TeamOutlined />}
                    </div>
                    <div className="mc-org-name" style={{ flex: 1 }}>
                      <span>{dept.deptName}</span>
                      {dept.leaderName && (
                        <span className="mc-org-lead" style={{ marginLeft: 8, color: "#999" }}>
                          {t("my.deptLeaderLabel", { name: dept.leaderName })}
                        </span>
                      )}
                    </div>
                    <Tag>
                      {dept.empCount}
                      {t("my.personSuffix")}
                    </Tag>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="mc-info-row" style={{ display: "flex", gap: 12, marginBottom: 16 }}>
      <div className="mc-info-icon" style={{ fontSize: 18, color: "#999" }}>
        {icon}
      </div>
      <div>
        <div className="mc-info-label" style={{ fontSize: 12, color: "#999" }}>
          {label}
        </div>
        <div className="mc-info-val" style={{ fontWeight: 600 }}>
          {value}
        </div>
      </div>
    </div>
  );
}