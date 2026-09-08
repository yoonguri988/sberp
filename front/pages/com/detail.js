// pages/com/detail.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Card, Spin, Tag, Avatar } from "antd";
import {
  EditOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  IdcardOutlined,
  FileTextOutlined,
  PhoneOutlined,
  TagOutlined,
  ApartmentOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { fetchCompanyDetailRequest } from "../../reducers/com/companyReducer";
import { getGrpLabel, getCodeLabel } from "../../constants/industryCode";
import resolveFileUrl from "../../constants/resolveFileUrl";

const TONE_BY_DEPTH = { 0: "blue", 1: "green", 2: "amber" };

export default function ComDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation(["com", "common"]);
  const { detail, loading } = useSelector((state) => state.company);

  const comId = router.query.comId;
  const com = detail?.com;
  const stats = detail?.deptStats || {};
  const deptList = detail?.deptList || [];

  useEffect(() => {
    if (!router.isReady || !comId) return;
    dispatch(fetchCompanyDetailRequest(comId));
  }, [router.isReady, comId, dispatch]);

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
            {com.comName}
          </div>
          <h1>{t("detail.title", { name: com.comName })}</h1>
          <p>{t("detail.subtitle", { name: com.comName })}</p>
        </div>
        <div className="sb-page-head__actions" style={{ display: "flex", gap: 8 }}>
          <Link href={{ pathname: "/com/edit", query: { comId: com.comId } }}>
            <button type="button" className="btn btn-sb btn-sm">
              <EditOutlined /> {t("detail.editButton")}
            </button>
          </Link>
          <Link href="/com/list">
            <button type="button" className="btn btn-ghost btn-sm">
              <ArrowLeftOutlined /> {t("detail.listButton")}
            </button>
          </Link>
        </div>
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
            {t("detail.ceoPrefix")} {com.comCeo}
          </div>
        </div>
        <div className="mc-stat-divider" />
        <div className="mc-stat-col">
          <div className="mc-stat-col__label">{t("detail.totalEmp")}</div>
          <div className="mc-stat-col__val">
            {stats.empTotal ?? "-"}
            {t("detail.personSuffix")}
          </div>
        </div>
        <div className="mc-stat-col">
          <div className="mc-stat-col__label">{t("detail.dept")}</div>
          <div className="mc-stat-col__val">{stats.deptTotal ?? "-"}</div>
        </div>
        <div className="mc-stat-col">
          <div className="mc-stat-col__label">{t("detail.headOffice")}</div>
          <div className="mc-stat-col__val">{stats.dept1Total ?? "-"}</div>
        </div>
        <div className="mc-stat-col">
          <div className="mc-stat-col__label">{t("detail.deptTeam")}</div>
          <div className="mc-stat-col__val">{stats.dept2Total ?? "-"}</div>
        </div>
      </div>

      {/* 본문 2단 구성 */}
      <div className="row g-3">
        {/* 좌측: 회사 기본 정보 */}
        <div className="col-lg-5">
          <Card className="sb-card h-100" title={t("detail.basicInfoCard")}>
            <InfoRow icon={<BankOutlined />} label={t("detail.comNameLabel")} value={com.comName} />
            <InfoRow icon={<IdcardOutlined />} label={t("detail.ceoLabel")} value={com.comCeo} />
            <InfoRow icon={<FileTextOutlined />} label={t("detail.bizNoLabel")} value={com.bizNo} />
            <InfoRow icon={<PhoneOutlined />} label={t("detail.telLabel")} value={com.comTel} />
            <InfoRow
              icon={<TagOutlined />}
              label={t("detail.industryLabel")}
              value={
                <>
                  <span>
                    {getGrpLabel(com.industryGrpCode, i18n.language) || t("detail.uncategorized")}
                  </span>
                  {com.industryCode && (
                    <span className="text-faint" style={{ fontWeight: 500 }}>
                      {" "}
                      · {getCodeLabel(com.industryCode, i18n.language) || ""} ({com.industryCode})
                    </span>
                  )}
                </>
              }
            />
          </Card>
        </div>

        {/* 우측: 조직도 (읽기전용) */}
        <div className="col-lg-7">
          <Card className="sb-card h-100" title={t("detail.orgCard")} bodyStyle={{ padding: 0 }}>
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
                          {t("detail.deptLeaderLabel", { name: dept.leaderName })}
                        </span>
                      )}
                    </div>
                    <Tag>
                      {dept.empCount}
                      {t("detail.personSuffix")}
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