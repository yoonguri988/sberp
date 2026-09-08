// pages/eval/write.js
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import {  Card, Form, Radio, Input, Button, Divider, message, } from "antd";
import {  ArrowLeftOutlined, SaveOutlined, SendOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  detailEvalRequest, draftEvalRequest, submitEvalRequest, resetEvalState,
} from "../../reducers/eval/evalReducer";

export default function EvalWritePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["eval", "common"]);
  const { evalId, periodId, targetEmpId } = router.query;
  const [form] = Form.useForm();

  const SCORE_ITEMS = [
    { name: "scorePerformance", label: t("common.scoreLabel.performance"), desc: t("common.scoreDesc.performance") },
    { name: "scoreExpertise", label: t("common.scoreLabel.expertise"), desc: t("common.scoreDesc.expertise") },
    { name: "scoreTeamwork", label: t("common.scoreLabel.teamwork"), desc: t("common.scoreDesc.teamwork") },
    { name: "scoreAttitude", label: t("common.scoreLabel.attitude"), desc: t("common.scoreDesc.attitude") },
    { name: "scoreGrowth", label: t("common.scoreLabel.growth"), desc: t("common.scoreDesc.growth") },
  ];

  const { currentEval, loading, success, error } = useSelector(
    (state) => state.eval
  );
  const isEdit = !!evalId;

  // 기존 평가 로드 (수정 모드)
  useEffect(() => {
    if (!evalId) return;
    dispatch(detailEvalRequest(Number(evalId)));
    return () => { dispatch(resetEvalState()); };
  }, [dispatch, evalId]);

  // 기존 데이터 폼에 세팅
  useEffect(() => {
    if (!currentEval) return;
    form.setFieldsValue({
      scorePerformance: currentEval.scorePerformance,
      scoreExpertise: currentEval.scoreExpertise,
      scoreTeamwork: currentEval.scoreTeamwork,
      scoreAttitude: currentEval.scoreAttitude,
      scoreGrowth: currentEval.scoreGrowth,
      strengthComment: currentEval.strengthComment,
      improvementComment: currentEval.improvementComment,
    });
  }, [currentEval, form]);

  // 결과 처리
  useEffect(() => {
    if (!success) return;
    message.success(t("write.savedMsg"));
    dispatch(resetEvalState());
    router.push({
      pathname: "/eval/dashboard",
      query: { periodId: periodId || currentEval?.periodId },
    });
  }, [success, dispatch, router, periodId, currentEval]);

  useEffect(() => {
    if (!error) return;
    message.error(error);
    dispatch(resetEvalState());
  }, [error, dispatch]);

  const buildPayload = (values) => ({
    ...values,
    evalId: isEdit ? Number(evalId) : undefined,
    periodId: Number(periodId || currentEval?.periodId),
    targetEmpId: Number(targetEmpId || currentEval?.targetEmpId),
    evalType: currentEval?.evalType || "PEER",
  });

  const handleDraft = async () => {
    const values = form.getFieldsValue();
    dispatch(draftEvalRequest(buildPayload(values)));
  };

    const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 제출 시 필수값 검증 (임시저장은 빈 값 허용)
      const emptyScore = SCORE_ITEMS.find((item) => values[item.name] == null);
      if (emptyScore) {
        message.warning(t("write.scoreRequiredMsg"));
        return;
      }
      if (!values.strengthComment?.trim() || !values.improvementComment?.trim()) {
        message.warning(t("write.commentRequiredMsg"));
        return;
      }

      dispatch(submitEvalRequest(buildPayload(values)));
    } catch (e) {}
  };

  const mode = isEdit ? t("write.editMode") : t("write.createMode");

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
            {t("common.breadcrumbRoot")} &gt; {t("dashboard.breadcrumbCurrent")} &gt; {mode}
          </div>
          <h1>{t("write.title", { mode })}</h1>
          {currentEval && (
            <p>
              {t("write.targetLabel", { name: currentEval.targetEmpName, dept: currentEval.targetDeptName })}
            </p>
          )}
        </div>
        <div className="sb-page-head__actions">
          <Link
            href={{
              pathname: "/eval/dashboard",
              query: { periodId: periodId || currentEval?.periodId },
            }}
          >
            <Button icon={<ArrowLeftOutlined />}>{t("write.backBtn")}</Button>
          </Link>
        </div>
      </div>

      <Card loading={loading && !currentEval && isEdit}>
        <Form form={form} layout="vertical" style={{ maxWidth: 640 }}>
          {/* 점수 5항목 */}
          {SCORE_ITEMS.map((item) => (
            <Form.Item
              key={item.name}
              name={item.name}
              label={item.label}
              extra={item.desc}
              rules={[
                {
                  required: false,
                  // 제출 시에만 required. 임시저장은 빈 값 허용
                },
              ]}
            >
              <Radio.Group
                className="sb-score-group"
                buttonStyle="solid"
                optionType="button"
                options={[1, 2, 3, 4, 5].map((n) => ({ label: n, value: n }))}
              />
            </Form.Item>
          ))}

          <Divider />

          {/* 코멘트 */}
          <Form.Item name="strengthComment" label={t("write.strengthCommentLabel")}>
            <Input.TextArea rows={3} placeholder={t("write.strengthCommentPlaceholder")} />
          </Form.Item>

          <Form.Item name="improvementComment" label={t("write.improvementCommentLabel")}>
            <Input.TextArea rows={3} placeholder={t("write.improvementCommentPlaceholder")} />
          </Form.Item>

          {/* 버튼 */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 24,
            }}
          >
            <Button icon={<SaveOutlined />} onClick={handleDraft} loading={loading}>
              {t("write.draftBtn")}
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSubmit}
              loading={loading}
            >
              {t("write.submitBtn")}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
