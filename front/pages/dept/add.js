// pages/dept/add.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, InputNumber, Select, message } from "antd";
import { ApartmentOutlined, ArrowLeftOutlined, BlockOutlined, CheckOutlined, ExclamationCircleOutlined, RightOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  addDeptRequest,
  checkDeptCodeRequest,
  fetchDeptFlatRequest,
  resetDeptState,
} from "../../reducers/dept/deptReducer";
import { fetchCompanyDetailRequest, resetCompanyState } from "../../reducers/com/companyReducer";

export default function DeptAddPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t } = useTranslation(["dept", "common"]);

  const DEPTH_LABEL_KEYS = ["", "hq", "team", "cell", "part"];

  const { detail: companyDetail } = useSelector((state) => state.company);
  const {
    flatList: depts,
    deptCodeCheck,
    loading,
    error,
    success,
  } = useSelector((state) => state.dept);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(
    user?.roles?.includes("ROLE_ADMIN") || user?.roles?.includes("ROOT"),
  );

  const defaultComId = user?.comId ? String(user.comId) : "";
  const comId = router.query.comId ? String(router.query.comId) : defaultComId;
  const parentIdQuery = router.query.parentId ? String(router.query.parentId) : "";
  const returnUrl = router.query.returnUrl || "";
  const backUrl = returnUrl || (comId ? `/dept/list?comId=${comId}` : "/dept/list");

  // 화면에 소속 회사명만 보여주면 되므로, 회사 전체 목록을 가져올 필요 없이
  // comId 단건 상세(GET /api/com/{comId})만 조회한다.
  const com = companyDetail?.com;

  const [parentId, setParentId] = useState(parentIdQuery || "0");
  const [depth, setDepth] = useState(1);
  const [deptName, setDeptName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const prevLoading = useRef(false);

  useEffect(() => {
    if (!comId) return;
    dispatch(fetchCompanyDetailRequest(comId));
    dispatch(fetchDeptFlatRequest(comId));
    form.setFieldsValue({ sortOrder: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, comId]);

  useEffect(() => {
    if (depts && depts.length) {
      form.setFieldsValue({ sortOrder: depts.length + 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depts]);

  useEffect(() => {
    if (!submitting) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("add.successMsg"));
        setSubmitting(false);
        dispatch(resetDeptState());
        router.push(backUrl);
      } else if (error) {
        message.error(error);
        setSubmitting(false);
        dispatch(resetDeptState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, submitting]);

  useEffect(() => {
    prevLoading.current = loading;
  }, [loading]);

  useEffect(() => {
    return () => {
      dispatch(resetDeptState());
      dispatch(resetCompanyState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parentOptions = useMemo(
    () => [
      { value: "0", label: t("add.hierarchy.parentNoneOption"), depth: 0 },
      ...(depts || []).map((d) => ({
        value: String(d.deptId),
        label: `${"　".repeat(d.depth || 0)}${d.depth > 0 ? "└ " : ""}${d.deptName} (${d.deptCode})`,
        depth: d.depth,
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depts, t],
  );

  const handleParentChange = (value) => {
    setParentId(value);
    const opt = (depts || []).find((d) => String(d.deptId) === value);
    const parentDepth = opt ? opt.depth : 0;
    const nextDepth = !value || value === "0" ? 1 : parentDepth + 1;
    setDepth(nextDepth);
  };

  const handleCodeBlur = () => {
    const code = form.getFieldValue("deptCode");
    if (!code || !comId) return;
    dispatch(checkDeptCodeRequest({ comId, deptCode: code }));
  };

  // 계층 미리보기 노드 목록: [회사명, (상위부서명), (입력중인 부서명)]
  const hierNodes = useMemo(() => {
    const nodes = [com?.comName || t("add.hierarchy.defaultComName")];
    if (parentId && parentId !== "0") {
      const opt = parentOptions.find((o) => o.value === parentId);
      if (opt) nodes.push(opt.label.replace(/^[\s└]+/, "").trim());
    }
    return nodes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [com, parentId, parentOptions, t]);

  const depthLabel = DEPTH_LABEL_KEYS[depth]
    ? t(`depthLabels.${DEPTH_LABEL_KEYS[depth]}`)
    : t("depthLabels.fallback");

  const onFinish = (values) => {
    if (!comId) {
      message.error(t("add.noComError"));
      return;
    }
    if (deptCodeCheck?.checked && deptCodeCheck?.duplicate) {
      message.error(t("add.basicInfo.deptCodeDuplicate"));
      return;
    }
    setSubmitting(true);
    dispatch(
      addDeptRequest({
        comId,
        deptName: values.deptName,
        deptCode: (values.deptCode || "").toUpperCase(),
        parentId: parentId && parentId !== "0" ? parentId : 0,
        depth,
        sortOrder: values.sortOrder,
        returnUrl: returnUrl || undefined,
      }),
    );
  };

  // 부서 등록은 관리자(ROLE_ADMIN/ROOT)만 가능하도록 프론트에서도 접근을 막는다.
  // (실제 권한 검증은 백엔드에서 최종적으로 수행됨)
  if (!isAdmin) {
    return (
      <div className="sb-content">
        <div className="sb-page-head">
          <div className="sb-page-head__txt">
            <div className="sb-breadcrumb">
              <Link href="/">{t("add.breadcrumbHome")}</Link> <RightOutlined />{" "}
              <Link href={backUrl}>{t("add.breadcrumbList")}</Link>{" "}
              <RightOutlined /> {t("add.breadcrumbAdd")}
            </div>
            <h1>{t("add.title")}</h1>
          </div>
        </div>
        <div className="sb-card">
          <div className="sb-empty">
            <ExclamationCircleOutlined style={{ fontSize: 34, opacity: 0.5 }} />
            <p>{t("add.accessDenied.message")}</p>
            <Link href={backUrl}>
              <Button className="mt-2">{t("add.accessDenied.backBtn")}</Button>
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
            <Link href="/">{t("add.breadcrumbHome")}</Link> <RightOutlined />{" "}
            <Link href={backUrl}>{t("add.breadcrumbList")}</Link>{" "}
            <RightOutlined /> {t("add.breadcrumbAdd")}
          </div>
          <h1>{t("add.title")}</h1>
          <p>{t("add.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href={backUrl}>
            <Button icon={<ArrowLeftOutlined />}>
              {t("add.backBtn")}
            </Button>
          </Link>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={(changed) => {
          if ("deptName" in changed) setDeptName(changed.deptName);
        }}
        initialValues={{ parentId: parentIdQuery || "0", sortOrder: 1 }}
      >
        {/* ① 기본 정보 */}
        <div className="sb-card mb-3">
          <div className="sb-card__head">
            <h2>
              <ApartmentOutlined className="me-2 text-soft" />
              {t("add.basicInfo.title")}
            </h2>
          </div>
          <div className="sb-card__body">
            <div className="row g-3">
              <div className="col-md-8">
                <Form.Item
                  label={t("add.basicInfo.deptNameLabel")}
                  name="deptName"
                  rules={[{ required: true, message: t("add.basicInfo.deptNameRequired") }]}
                >
                  <Input placeholder={t("add.basicInfo.deptNamePlaceholder")} maxLength={100} />
                </Form.Item>
              </div>
              <div className="col-md-4">
                <Form.Item
                  label={t("add.basicInfo.deptCodeLabel")}
                  name="deptCode"
                  rules={[{ required: true, message: t("add.basicInfo.deptCodeRequired") }]}
                  validateStatus={deptCodeCheck?.checked && deptCodeCheck?.duplicate ? "error" : undefined}
                  help={
                    deptCodeCheck?.checked && deptCodeCheck?.duplicate
                      ? t("add.basicInfo.deptCodeDuplicate")
                      : t("add.basicInfo.deptCodeHint")
                  }
                >
                  <Input
                    placeholder={t("add.basicInfo.deptCodePlaceholder")}
                    maxLength={45}
                    style={{ textTransform: "uppercase" }}
                    onChange={(e) => {
                      const upper = e.target.value.toUpperCase();
                      form.setFieldsValue({ deptCode: upper });
                    }}
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
              {t("add.hierarchy.title")}
            </h2>
          </div>
          <div className="sb-card__body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="sb-form-label">{t("add.hierarchy.comLabel")}</label>
                <Input value={com?.comName || ""} readOnly style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }} />
              </div>

              <div className="col-md-6">
                <Form.Item label={t("add.hierarchy.parentLabel")} name="parentId">
                  <Select options={parentOptions} onChange={handleParentChange} />
                </Form.Item>
                <div className="text-faint mt-1" style={{ fontSize: 12 }}>
                  {t("add.hierarchy.parentHint")}
                </div>
              </div>

              <div className="col-md-6">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="sb-form-label">{t("add.hierarchy.depthLabel")}</label>
                    <div className="depth-info-box">
                      <BlockOutlined className="text-faint" />
                      <span>depth</span>
                      <span className="depth-val">{depth}</span>
                      <span className="text-faint">· {depthLabel}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <Form.Item label={t("add.hierarchy.sortOrderLabel")} name="sortOrder">
                      <InputNumber min={1} max={999} style={{ width: "100%" }} />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <label className="sb-form-label">{t("add.hierarchy.previewLabel")}</label>
                <div className="hier-preview">
                  {hierNodes.map((n, i) => (
                    <React.Fragment key={i}>
                      <span className="hier-node">{n}</span>
                      <RightOutlined className="hier-sep" />
                    </React.Fragment>
                  ))}
                  {deptName ? (
                    <span className="hier-node hier-node--new">{deptName}</span>
                  ) : (
                    <span className="text-faint" style={{ fontSize: 12.5 }}>
                      {t("add.hierarchy.previewTyping")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-faint mb-3" style={{ fontSize: 12.5 }}>
          {t("add.leaderHint")}
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Link href={backUrl}>
            <Button>{t("common:button.cancel")}</Button>
          </Link>
          <Button type="primary" htmlType="submit" icon={<CheckOutlined />} loading={submitting && loading}>
            {t("add.submitBtn")}
          </Button>
        </div>
      </Form>
    </div>
  );
}