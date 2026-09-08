// pages/careers/apply.js
// 채용 공개 사이트 - 지원서 제출 (POST /api/public/applicant/apply, 로그인 필요)
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Form, Input, Button, Alert, Card, Result } from "antd";
import { SendOutlined, ArrowLeftOutlined } from "@ant-design/icons";

import ApplicantLayout from "../../components/ApplicantLayout";
import { fetchPublicRecruitDetailRequest } from "../../reducers/rec/recruitPublicReducer";
import {
  applyRequest,
  resetApplicantPublicState,
} from "../../reducers/apct/applicantPublicReducer";

export default function CareersApplyPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t } = useTranslation("careers");
  const { recId } = router.query;

  const { apctUser, apctAccessToken } = useSelector((state) => state.apctAuth);
  const { detail } = useSelector((state) => state.recruitPublic);
  const { applyLoading, applyError, applySuccess, appliedApplicant } = useSelector(
    (state) => state.applicantPublic,
  );

  useEffect(() => {
    if (!router.isReady || !recId || !apctAccessToken) return;
    dispatch(fetchPublicRecruitDetailRequest(Number(recId)));
    return () => dispatch(resetApplicantPublicState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, recId, apctAccessToken]);

  useEffect(() => {
    if (apctUser?.email) {
      form.setFieldsValue({ apctEmail: apctUser.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apctUser]);

  const onFinish = (values) => {
    dispatch(applyRequest({ recId: Number(recId), ...values }));
  };

  if (applySuccess) {
    return (
      <ApplicantLayout>
        <Card>
          <Result
            status="success"
            title={t("apply.successTitle")}
            subTitle={
              detail
                ? t("apply.successSubtitleWithTitle", { title: detail.recTitle })
                : t("apply.successSubtitleDefault")
            }
            extra={[
              <Link key="upload" href={`/careers/my?apctId=${appliedApplicant?.apctId || ""}`}>
                <Button type="primary">{t("apply.uploadResumeBtn")}</Button>
              </Link>,
              <Link key="my" href="/careers/my">
                <Button>{t("apply.viewMyApplicationsBtn")}</Button>
              </Link>,
            ]}
          />
        </Card>
      </ApplicantLayout>
    );
  }

  return (
    <ApplicantLayout>
      <Link href={{ pathname: "/careers/detail", query: { recId } }} passHref >
        <Button type="text" icon={<ArrowLeftOutlined />} style={{ paddingLeft: 0, marginBottom: 12 }}>
          {t("apply.backToDetailBtn")}
        </Button>
      </Link>

      <Card style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 19, fontWeight: 700, marginBottom: 4 }}>{t("apply.formTitle")}</h1>
        <p style={{ color: "#778", fontSize: 13.5, marginBottom: 20 }}>
          {detail ? t("apply.formSubtitleWithTitle", { title: detail.recTitle }) : t("apply.formSubtitleDefault")}
        </p>

        <Form layout="vertical" form={form} onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="apctName"
            label={t("apply.nameLabel")}
            rules={[{ required: true, message: t("apply.nameRequired") }]}
          >
            <Input placeholder={t("apply.namePlaceholder")} />
          </Form.Item>
          <Form.Item
            name="apctEmail"
            label={t("apply.emailLabel")}
            rules={[{ type: "email", message: t("apply.emailInvalid") }]}
          >
            <Input placeholder={t("apply.emailPlaceholder")} />
          </Form.Item>
          <Form.Item
            name="apctPhone"
            label={t("apply.phoneLabel")}
            rules={[{ required: true, message: t("apply.phoneRequired") }]}
          >
            <Input placeholder={t("apply.phonePlaceholder")} />
          </Form.Item>

          {applyError && (
            <Alert
              type="error"
              showIcon
              message={typeof applyError === "string" ? applyError : t("apply.submitErrorDefault")}
              style={{ marginBottom: 16 }}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={applyLoading}
            block
          >
            {t("apply.submitBtn")}
          </Button>
        </Form>
      </Card>
    </ApplicantLayout>
  );
}
