// pages/dept/edit.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, InputNumber, Select, message } from "antd";
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  BlockOutlined,
  CheckOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  RightOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  updateDeptRequest,
  checkDeptCodeRequest,
  deleteDeptRequest,
  fetchDeptDetailRequest,
  fetchDeptFlatRequest,
  fetchDeptEmpListRequest,
  resetDeptState,
} from "../../reducers/dept/deptReducer";
import {
  fetchCompanyDetailRequest,
  resetCompanyState,
} from "../../reducers/com/companyReducer";
import DeptDeleteModal from "../../components/DeptDeleteModal";
import { empStatusLabel } from "../../utils/empStatus";

export default function DeptEditPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t } = useTranslation(["dept", "common"]);

  const DEPTH_LABEL_KEYS = ["", "hq", "team", "cell", "part"];

  const { detail: companyDetail } = useSelector((state) => state.company);
  const {
    flatList: depts,
    detail,
    deptCodeCheck,
    deptEmpList,
    loading,
    error,
    success,
    pendingTransfer,
  } = useSelector((state) => state.dept);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(
    user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ROOT"),
  );

  const deptId = router.query.deptId ? String(router.query.deptId) : "";
  const comId = router.query.comId
    ? String(router.query.comId)
    : detail?.dept?.comId
      ? String(detail.dept.comId)
      : "";
  const returnUrl = router.query.returnUrl || "";
  const backUrl =
    returnUrl || (comId ? `/dept/list?comId=${comId}` : "/dept/list");

  // 화면에 소속 회사명만 보여주면 되므로, 회사 전체 목록을 가져올 필요 없이
  // comId 단건 상세(GET /api/com/{comId})만 조회한다.
  const com = companyDetail?.com;

  const dept = detail?.dept || null;

  const [parentId, setParentId] = useState("0");
  const [depth, setDepth] = useState(1);
  const [deptName, setDeptName] = useState("");
  const [leaderName, setLeaderName] = useState(null);
  const [leaderPos, setLeaderPos] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const prevLoading = useRef(false);

  useEffect(() => {
    if (!router.isReady || !deptId) return;
    dispatch(fetchDeptDetailRequest(deptId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, deptId]);

  // dept 가 확정된 이후에만 소속 사원 목록을 조회한다.
  // (GET /api/dept/{deptId}/emp - 하위 부서 포함, 페이징 없이 전체 반환)
  useEffect(() => {
    if (dept?.deptId) {
      dispatch(fetchDeptEmpListRequest(dept.deptId));
    }
  }, [dispatch, dept?.deptId]);

  useEffect(() => {
    if (!comId) return;
    dispatch(fetchCompanyDetailRequest(comId));
    dispatch(fetchDeptFlatRequest(comId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comId]);

  // 상세 로드 후 폼 초기값 세팅
  useEffect(() => {
    if (!dept) return;
    form.setFieldsValue({
      deptName: dept.deptName,
      deptCode: dept.deptCode,
      parentId: dept.parentId ? String(dept.parentId) : "0",
      sortOrder: dept.sortOrder || 1,
      empId: dept.leaderId ? String(dept.leaderId) : undefined,
    });
    setDeptName(dept.deptName || "");
    setParentId(dept.parentId ? String(dept.parentId) : "0");
    setDepth(dept.depth || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept]);

  useEffect(() => {
    if (!dept?.leaderId) return;
    const emp = deptEmpList.find(
      (e) => String(e.empId) === String(dept.leaderId),
    );
    if (emp) {
      setLeaderName(emp.empName);
      setLeaderPos(emp.posName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept, deptEmpList]);

  useEffect(() => {
    if (!submitting) return;
    if (success) {
      message.success(t("edit.saveSuccessMsg"));
      setSubmitting(false);
      dispatch(resetDeptState());
      router.push(backUrl);
    } else if (error) {
      message.error(error);
      setSubmitting(false);
      dispatch(resetDeptState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, submitting]);

  useEffect(() => {
    if (!deleting) return;
    if (success) {
      if (pendingTransfer) {
        message.info(t("edit.transferRequiredMsg"));
        setConfirmOpen(false);
        setDeleting(false);
        dispatch(resetDeptState());
        router.push({ pathname: "/dept/transfer/list", query: { deptId } });
        return;
      }
      message.success(t("edit.deleteSuccessMsg"));
      setConfirmOpen(false);
      setDeleting(false);
      dispatch(resetDeptState());
      router.push(backUrl);
    } else if (error) {
      message.error(error);
      setDeleting(false);
      dispatch(resetDeptState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, deleting]);

  useEffect(() => {
    return () => {
      dispatch(resetDeptState());
      dispatch(resetCompanyState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectableParents = useMemo(
    () => (depts || []).filter((d) => String(d.deptId) !== deptId),
    [depts, deptId],
  );

  const parentOptions = useMemo(
    () => [
      { value: "0", label: t("edit.hierarchy.parentNoneOption") },
      ...selectableParents.map((d) => ({
        value: String(d.deptId),
        label: `${"　".repeat(d.depth || 0)}${d.depth > 0 ? "└ " : ""}${d.deptName} (${d.deptCode})`,
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectableParents, t],
  );

  const handleParentChange = (value) => {
    setParentId(value);
    const opt = selectableParents.find((d) => String(d.deptId) === value);
    const parentDepth = opt ? opt.depth : 0;
    const nextDepth = !value || value === "0" ? 1 : parentDepth + 1;
    setDepth(nextDepth);
  };

  const handleLeaderChange = (value) => {
    const emp = deptEmpList.find((e) => String(e.empId) === value);
    if (!emp) {
      setLeaderName(null);
      setLeaderPos(null);
      return;
    }
    setLeaderName(emp.empName);
    setLeaderPos(emp.posName);
  };

  const handleCodeBlur = () => {
    const code = form.getFieldValue("deptCode");
    if (!code || !comId) return;
    if (dept && code === dept.deptCode) return;
    dispatch(checkDeptCodeRequest({ comId, deptCode: code, deptId }));
  };

  // 계층 경로: 선택된 상위부서부터 parentId 체인을 따라 회사명까지 역순으로 구성
  const hierNodes = useMemo(() => {
    const chain = [];
    let curId = parentId;
    let guard = 0;
    while (curId && curId !== "0" && guard < 20) {
      const opt = selectableParents.find((d) => String(d.deptId) === curId);
      if (!opt) break;
      chain.unshift(`${opt.deptName} (${opt.deptCode})`);
      curId = opt.parentId ? String(opt.parentId) : "0";
      guard++;
    }
    return [com?.comName || t("edit.hierarchy.defaultComName"), ...chain];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId, selectableParents, com, t]);

  const depthLabel = DEPTH_LABEL_KEYS[depth]
    ? t(`depthLabels.${DEPTH_LABEL_KEYS[depth]}`)
    : t("depthLabels.fallback");

  const onFinish = (values) => {
    if (deptCodeCheck?.checked && deptCodeCheck?.duplicate) {
      message.error(t("edit.basicInfo.deptCodeDuplicate"));
      return;
    }
    setSubmitting(true);
    dispatch(
      updateDeptRequest({
        deptId,
        dto: {
          comId,
          deptName: values.deptName,
          deptCode: (values.deptCode || "").toUpperCase(),
          parentId: parentId && parentId !== "0" ? parentId : 0,
          depth,
          sortOrder: values.sortOrder,
          empId: values.empId || null,
          returnUrl: returnUrl || undefined,
        },
      }),
    );
  };

  const confirmDelete = () => {
    setDeleting(true);
    dispatch(deleteDeptRequest(deptId));
  };

  // 사원 상태(empStatus)는 백엔드에서 내려오는 값 그대로 비교/표시하므로 번역하지 않습니다.
  const statusBadgeClass = (status) => {
    if (status === "재직") return "sb-badge sb-badge--green";
    if (status === "휴직") return "sb-badge sb-badge--amber";
    if (status === "퇴직") return "sb-badge sb-badge--cyan";
    return "sb-badge sb-badge--gray";
  };

  // 부서 수정/삭제는 관리자(ROLE_ADMIN/ROOT)만 가능하도록 프론트에서도 접근을 막는다.
  // (실제 권한 검증은 백엔드에서 최종적으로 수행됨)
  if (router.isReady && !isAdmin) {
    return (
      <div className="sb-content">
        <div className="sb-page-head">
          <div className="sb-page-head__txt">
            <div className="sb-breadcrumb">
              <Link href="/">{t("edit.breadcrumbHome")}</Link> <RightOutlined />{" "}
              <Link href="/dept/list">{t("edit.breadcrumbList")}</Link>{" "}
              <RightOutlined /> {t("edit.breadcrumbEdit")}
            </div>
            <h1>{t("edit.title")}</h1>
          </div>
        </div>
        <div className="sb-card">
          <div className="sb-empty">
            <ExclamationCircleOutlined style={{ fontSize: 34, opacity: 0.5 }} />
            <p>{t("edit.accessDenied.message")}</p>
            <Link href="/dept/list">
              <Button className="mt-2">{t("edit.accessDenied.backBtn")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (router.isReady && !dept && !loading) {
    return (
      <div className="sb-content">
        <div className="sb-page-head">
          <div className="sb-page-head__txt">
            <div className="sb-breadcrumb">
              <Link href="/">{t("edit.breadcrumbHome")}</Link> <RightOutlined />{" "}
              <Link href="/dept/list">{t("edit.breadcrumbList")}</Link>{" "}
              <RightOutlined /> {t("edit.breadcrumbEdit")}
            </div>
            <h1>{t("edit.title")}</h1>
          </div>
        </div>
        <div className="sb-card">
          <div className="sb-empty">
            <ExclamationCircleOutlined style={{ fontSize: 34, opacity: 0.5 }} />
            <p>{t("edit.notFoundMsg")}</p>
            <Link href="/dept/list">
              <Button className="mt-2">{t("edit.backToListBtn")}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sb-content">
      {/* 페이지 헤더 */}
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/">{t("edit.breadcrumbHome")}</Link> <RightOutlined />{" "}
            <Link href={backUrl}>{t("edit.breadcrumbList")}</Link>{" "}
            <RightOutlined /> {t("edit.breadcrumbEdit")}{" "}
            <span className="admin-tag ms-2">{t("edit.adminBadge")}</span>
          </div>
          <h1>
            {dept
              ? t("edit.titleWithName", { deptName: dept.deptName })
              : t("edit.title")}
          </h1>
          <p>
            {dept &&
              t("edit.subtitleWithId", {
                id: String(dept.deptId).padStart(3, "0"),
              })}
          </p>
        </div>
        <div className="sb-page-head__actions">
          <Link href={backUrl}>
            <Button icon={<ArrowLeftOutlined />}>{t("edit.backBtn")}</Button>
          </Link>
        </div>
      </div>

      {dept && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={(changed) => {
            if ("deptName" in changed) setDeptName(changed.deptName);
          }}
          className="form-wide"
        >
          {/* ① 기본 정보 */}
          <div className="sb-card mb-3">
            <div className="sb-card__head">
              <h2>
                <ApartmentOutlined className="me-2 text-soft" />
                {t("edit.basicInfo.title")}
              </h2>
              <div className="right">
                <span className="sb-badge sb-badge--gray">
                  DEPT-{String(dept.deptId).padStart(3, "0")}
                </span>
              </div>
            </div>
            <div className="sb-card__body">
              <div className="row g-3">
                <div className="col-md-8">
                  <Form.Item
                    label={t("edit.basicInfo.deptNameLabel")}
                    name="deptName"
                    rules={[
                      {
                        required: true,
                        message: t("edit.basicInfo.deptNameRequired"),
                      },
                    ]}
                  >
                    <Input maxLength={100} />
                  </Form.Item>
                </div>
                <div className="col-md-4">
                  <Form.Item
                    label={t("edit.basicInfo.deptCodeLabel")}
                    name="deptCode"
                    rules={[
                      {
                        required: true,
                        message: t("edit.basicInfo.deptCodeRequired"),
                      },
                    ]}
                    validateStatus={
                      deptCodeCheck?.checked && deptCodeCheck?.duplicate
                        ? "error"
                        : undefined
                    }
                    help={
                      deptCodeCheck?.checked && deptCodeCheck?.duplicate
                        ? t("edit.basicInfo.deptCodeDuplicate")
                        : undefined
                    }
                  >
                    <Input
                      maxLength={45}
                      style={{ textTransform: "uppercase" }}
                      onChange={(e) =>
                        form.setFieldsValue({
                          deptCode: e.target.value.toUpperCase(),
                        })
                      }
                      onBlur={handleCodeBlur}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* ② 소속 및 계층 */}
          <div className="sb-card mb-3">
            <div className="sb-card__head">
              <h2>
                <ApartmentOutlined className="me-2 text-soft" />
                {t("edit.hierarchy.title")}
              </h2>
            </div>
            <div className="sb-card__body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="sb-form-label">
                    {t("edit.hierarchy.comLabel")}
                  </label>
                  <Input
                    value={com?.comName || ""}
                    readOnly
                    style={{
                      background: "#fafbfc",
                      color: "var(--sb-ink-soft)",
                    }}
                  />
                  <div className="text-faint mt-1" style={{ fontSize: 12 }}>
                    {t("edit.hierarchy.comHint")}
                  </div>
                </div>

                <div className="col-md-6">
                  <Form.Item
                    label={t("edit.hierarchy.parentLabel")}
                    name="parentId"
                  >
                    <Select
                      options={parentOptions}
                      onChange={handleParentChange}
                    />
                  </Form.Item>
                  <div className="text-faint mt-1" style={{ fontSize: 12 }}>
                    <InfoCircleOutlined className="me-1" />
                    {t("edit.hierarchy.parentHint")}
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="sb-form-label">
                    {t("edit.hierarchy.depthLabel")}
                  </label>
                  <div className="depth-info-box">
                    <BlockOutlined className="text-faint" />
                    <span>depth</span>
                    <span className="depth-val">{depth}</span>
                    <span className="text-faint">· {depthLabel}</span>
                  </div>
                </div>

                <div className="col-md-4">
                  <Form.Item
                    label={t("edit.hierarchy.sortOrderLabel")}
                    name="sortOrder"
                  >
                    <InputNumber min={1} max={999} style={{ width: "100%" }} />
                  </Form.Item>
                </div>

                <div className="col-12">
                  <label className="sb-form-label">
                    {t("edit.hierarchy.previewLabel")}
                  </label>
                  <div className="hier-preview">
                    {hierNodes.map((n, i) => (
                      <React.Fragment key={i}>
                        <span className="hier-node">{n}</span>
                        <RightOutlined className="hier-sep" />
                      </React.Fragment>
                    ))}
                    {deptName ? (
                      <span className="hier-node hier-node--new">
                        {deptName}
                      </span>
                    ) : (
                      <span className="text-faint" style={{ fontSize: 12.5 }}>
                        {t("edit.hierarchy.previewTyping")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ③ 부서장 */}
          <div className="sb-card mb-3">
            <div className="sb-card__head">
              <h2>
                <UserSwitchOutlined className="me-2 text-soft" />
                {t("edit.leader.title")}
              </h2>
              <span className="sub">{t("edit.leader.optionalTag")}</span>
            </div>
            <div className="sb-card__body">
              <div className="row g-3 align-items-center">
                <div className="col-md-6">
                  <Form.Item label={t("edit.leader.selectLabel")} name="empId">
                    <Select
                      allowClear
                      placeholder={t("edit.leader.selectPlaceholder")}
                      onChange={handleLeaderChange}
                      options={deptEmpList.map((e) => ({
                        value: String(e.empId),
                        label: `${e.empName} (${e.posName})`,
                      }))}
                    />
                  </Form.Item>
                </div>
                {leaderName && (
                  <div className="col-md-6">
                    <label className="sb-form-label">&nbsp;</label>
                    <div>
                      <span className="lead-chip">
                        <span className="sb-avatar">
                          {leaderName.charAt(0)}
                        </span>
                        <span>
                          {leaderName} · {leaderPos}
                        </span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 소속 사원 현황 (읽기전용) */}
          <div className="sb-card mb-3">
            <div className="sb-card__head">
              <h2>
                <TeamOutlined className="me-2 text-soft" />
                {t("edit.empStatus.title")}
              </h2>
              <span className="sub">
                {t("edit.empStatus.totalCount", { count: deptEmpList.length })}
              </span>
            </div>
            <div className="sb-card__body--flush">
              {deptEmpList.length > 0 ? (
                <table className="sb-table">
                  <thead>
                    <tr>
                      <th style={{ width: 80 }}>
                        {t("edit.empStatus.table.empNo")}
                      </th>
                      <th>{t("edit.empStatus.table.empName")}</th>
                      <th style={{ width: 100 }}>
                        {t("edit.empStatus.table.position")}
                      </th>
                      <th style={{ width: 160 }}>
                        {t("edit.empStatus.table.email")}
                      </th>
                      <th style={{ width: 90 }}>
                        {t("edit.empStatus.table.status")}
                      </th>
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
                              style={{ width: 28, height: 28, fontSize: 12 }}
                            >
                              {(e.empName || "").charAt(0)}
                            </span>
                            <span className="sb-table__name">{e.empName}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className="sb-badge sb-badge--gray"
                            style={{ fontSize: 11.5 }}
                          >
                            {e.posName}
                          </span>
                        </td>
                        <td className="sb-hr-cell" style={{ fontSize: 12.5 }}>
                          {e.empEmail}
                        </td>
                        <td>
                          <span className={statusBadgeClass(e.empStatus)}>
                            {empStatusLabel(t, e.empStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="sb-empty">
                  <TeamOutlined style={{ fontSize: 30, opacity: 0.5 }} />
                  <p>{t("edit.empStatus.emptyMsg")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-between">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setConfirmOpen(true)}
            >
              {t("edit.deleteBtn")}
            </Button>
            <div className="d-flex gap-2">
              <Link href={backUrl}>
                <Button>{t("common:button.cancel")}</Button>
              </Link>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckOutlined />}
                loading={submitting && loading}
              >
                {t("edit.saveBtn")}
              </Button>
            </div>
          </div>
        </Form>
      )}

      <DeptDeleteModal
        target={
          dept
            ? {
                deptId: dept.deptId,
                deptName: dept.deptName,
                deptCode: dept.deptCode,
                empCount: deptEmpList.length,
                childCount: (depts || []).filter(
                  (d) => String(d.parentId) === String(dept.deptId),
                ).length,
              }
            : null
        }
        open={confirmOpen}
        loading={deleting && loading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
