// pages/dept/detail.js
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
import { ArrowLeftOutlined, RightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  fetchDeptDetailRequest,
  fetchDeptEmpListRequest,
} from "../../reducers/dept/deptReducer";
import DeptDetailView from "../../components/DeptDetailView";

export default function DeptDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["dept", "common"]);

  const { detail, deptEmpList } = useSelector((state) => state.dept);
  const { user } = useSelector((state) => state.auth);

  const deptId = router.query.deptId ? String(router.query.deptId) : "";

  useEffect(() => {
    if (!router.isReady || !deptId) return;
    dispatch(fetchDeptDetailRequest(deptId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, deptId]);

  const dept = detail?.dept;
  const ancestorChain = detail?.ancestorChain || [];
  const isMyDept = !!(
    dept &&
    user?.deptId &&
    String(user.deptId) === String(dept.deptId)
  );

  // dept 가 확정된 이후에만 소속 사원 목록을 조회한다.
  // (GET /api/dept/{deptId}/emp - 하위 부서 포함, 페이징 없이 전체 반환)
  useEffect(() => {
    if (dept?.deptId) {
      dispatch(fetchDeptEmpListRequest(dept.deptId));
    }
  }, [dispatch, dept?.deptId]);

  if (!dept) return null;

  return (
    <div className="sb-content">
      {/* 페이지 헤더 */}
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("detail.breadcrumbHome")}</Link> <RightOutlined />{" "}
            <Link
              href={{
                pathname: "/dept/detail",
                query: { deptId: dept.deptId },
              }}
            >
              {t("detail.breadcrumbTitle")}
            </Link>{" "}
            <RightOutlined /> {dept.deptName}
          </div>
          <h1>{dept.deptName}</h1>
          <p>{dept.deptCode}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link
            href={{
              pathname: "/dept/list",
              query: dept.comId ? { comId: dept.comId } : {},
            }}
          >
            <Button icon={<ArrowLeftOutlined />}>
              {t("detail.backBtn")}
            </Button>
          </Link>
        </div>
      </div>

      <DeptDetailView
        dept={dept}
        ancestorChain={ancestorChain}
        deptEmpList={deptEmpList}
        isMyDept={isMyDept}
      />
    </div>
  );
}
