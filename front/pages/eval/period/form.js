// pages/eval/period/form.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Form, Input, InputNumber, Select, DatePicker, Button, message } from "antd";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import moment from "moment";

import {
  detailPeriodRequest, createPeriodRequest, updatePeriodRequest,
  checkDuplicateRequest, clearCheckDuplicate, resetPeriodState,
} from "../../../reducers/eval/evalPeriodReducer";

export default function EvalPeriodFormPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { periodId } = router.query;
  const [form] = Form.useForm();
  const isEdit = !!periodId;

  // 평가 구분 옵션 (값은 백엔드와 동일한 한글 원본 유지, 라벨만 번역)
  const TERM_OPTIONS = [
    { value: "H1", label: t("period.form.termOptions.h1") },
    { value: "H2", label: t("period.form.termOptions.h2") },
    { value: "ANNUAL", label: t("period.form.termOptions.annual") },
  ];

  const { currentPeriod, checkDuplicate, loading, success, error } =
    useSelector((state) => state.period);

  // 수정 모드: 기존 데이터 로드
  useEffect(() => {
    if (!periodId) return;
    dispatch(detailPeriodRequest(Number(periodId)));
    return () => dispatch(clearCheckDuplicate());
  }, [dispatch, periodId]);

  // 기존 데이터 폼에 세팅
  useEffect(() => {
    if (!currentPeriod || !isEdit) return;
    form.setFieldsValue({
      evalYear: currentPeriod.evalYear,
      evalTerm: currentPeriod.evalTerm,
      title: currentPeriod.title,
      startDate: currentPeriod.startDate ? moment(currentPeriod.startDate) : null,
      endDate: currentPeriod.endDate ? moment(currentPeriod.endDate) : null,
    });
  }, [currentPeriod, isEdit, form]);

  // 결과 처리
  useEffect(() => {
    if (success) {
      message.success(isEdit ? t("period.form.editSuccessMsg") : t("period.form.addSuccessMsg"));
      dispatch(resetPeriodState());
      router.push("/eval/period/list");
    }
    if (error) {
      message.error(error);
      dispatch(resetPeriodState());
    }
  }, [success, error, dispatch, router, isEdit]);

  // 중복 확인 (연도+구분 변경 시)
  const handleDuplicateCheck = () => {
    const year = form.getFieldValue("evalYear");
    const term = form.getFieldValue("evalTerm");
    if (year && term) {
      dispatch(checkDuplicateRequest({ evalYear: year, evalTerm: term }));
    }
  };

  const dupHelp =
    checkDuplicate === true
      ? { validateStatus: "error", help: t("period.form.dupExistsMsg") }
      : checkDuplicate === false
        ? { validateStatus: "success", help: t("period.form.availableMsg") }
        : {};

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!isEdit && checkDuplicate === true) {
        message.warning(t("period.form.duplicateWarning"));
        return;
      }
      const data = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
      };
      if (isEdit) {
        dispatch(updatePeriodRequest({ periodId: Number(periodId), ...data }));
      } else {
        dispatch(createPeriodRequest(data));
      }
    } catch (e) {}
  };

  const mode = isEdit ? t("period.form.editMode") : t("period.form.createMode");

  //////
  return (
    <div className="sb-page">
      <div
        className="sb-page-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common.breadcrumbRoot")} &gt; {t("period.list.breadcrumbCurrent")} &gt; {mode}
          </div>
          <h1>{t("period.form.title", { mode })}</h1>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/eval/period/list">
            <Button icon={<ArrowLeftOutlined />}>{t("period.form.backToListBtn")}</Button>
          </Link>
        </div>
      </div>

      <Card>
        <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
          <Form.Item
            name="evalYear"
            label={t("period.form.yearLabel")}
            rules={[{ required: true, message: t("period.form.yearRequired") }]}
            {...(!isEdit ? dupHelp : {})}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={2020}
              max={2099}
              placeholder={t("period.form.yearPlaceholder")}
              disabled={isEdit}
              onBlur={!isEdit ? handleDuplicateCheck : undefined}
            />
          </Form.Item>

          <Form.Item
            name="evalTerm"
            label={t("period.form.termLabel")}
            rules={[{ required: true, message: t("period.form.termRequired") }]}
          >
            <Select
              options={TERM_OPTIONS}
              placeholder={t("period.form.termSelectPlaceholder")}
              disabled={isEdit}
              onChange={!isEdit ? handleDuplicateCheck : undefined}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label={t("period.form.titleLabel")}
            rules={[{ required: true, message: t("period.form.titleRequired") }]}
          >
            <Input placeholder={t("period.form.titlePlaceholder")} />
          </Form.Item>

          <Form.Item
            name="startDate"
            label={t("period.form.startDateLabel")}
            rules={[{ required: true, message: t("period.form.startDateRequired") }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label={t("period.form.endDateLabel")}
            rules={[{ required: true, message: t("period.form.endDateRequired") }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Link href="/eval/period/list">
              <Button>{t("common:button.cancel")}</Button>
            </Link>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              {mode}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
