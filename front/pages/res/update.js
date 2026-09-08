// pages/res/update.js
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, InputNumber, Select, message } from "antd";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  fetchResourceDetailRequest,
  updateResourceRequest,
  resetResourceState,
} from "../../reducers/res/resourceReducer";
import EmployeePicker from "../../components/EmployeePicker";

// label 은 i18n/locales/{ko,en}/res.json 의 enum.resStatus 키와 매핑됩니다.
const RES_STATUS_VALUES = ["AVAILABLE", "MAINTENANCE", "DISABLED"];

export default function ResourceUpdatePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["res", "common"]);
  const [form] = Form.useForm();

  const resStatusOptions = RES_STATUS_VALUES.map((v) => ({
    value: v,
    label: t(`enum.resStatus.${v}`),
  }));

  const {
    detail: resource,
    loading,
    error,
    success,
  } = useSelector((state) => state.resource);

  const resId = router.query.resId ? String(router.query.resId) : "";

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady || !resId) return;
    dispatch(fetchResourceDetailRequest(resId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, resId]);

  useEffect(() => {
    if (!resource) return;
    form.setFieldsValue({
      location: resource.location,
      quantity: resource.quantity,
      capacity: resource.capacity,
      resStatus: resource.resStatus,
      remark: resource.remark,
      managerEmpId: resource.managerEmpId ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  useEffect(() => {
    if (!submitting) return;
    if (success) {
      message.success(t("update.successMessage"));
      setSubmitting(false);
      dispatch(resetResourceState());
      router.push("/res/list");
    } else if (error) {
      message.error(error);
      setSubmitting(false);
      dispatch(resetResourceState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, submitting]);

  useEffect(() => {
    return () => {
      dispatch(resetResourceState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = (values) => {
    if (resource?.resType === "ROOM" && !values.capacity) {
      message.error(t("shared.roomCapacityRequired"));
      return;
    }
    setSubmitting(true);
    dispatch(
      updateResourceRequest({
        resId,
        dto: {
          resCode: resource.resCode,
          resName: resource.resName,
          resType: resource.resType,
          location: values.location || null,
          quantity: values.quantity,
          capacity: values.capacity || null,
          resStatus: values.resStatus,
          remark: values.remark || null,
          managerEmpId: values.managerEmpId || null,
        },
      }),
    );
  };

  if (!resource) return null;

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/res/list">{t("shared.title")}</Link> ·{" "}
            {t("update.breadcrumbCurrent")}
          </div>
          <h1>{t("update.title")}</h1>
          <p>{t("update.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/res/list">
            <Button icon={<ArrowLeftOutlined />} size="small">
              {t("shared.backToList")}
            </Button>
          </Link>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="sb-card mb-3">
          <div className="sb-card__head">
            <h2>{t("shared.basicInfoTitle")}</h2>
            <span className="sub">{resource.resCode}</span>
          </div>
          <div className="sb-card__body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="sb-form-label">{t("field.resCode")}</label>
                <Input
                  value={resource.resCode}
                  readOnly
                  style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
                />
              </div>
              <div className="col-md-6">
                <label className="sb-form-label">{t("field.resName")}</label>
                <Input
                  value={resource.resName}
                  readOnly
                  style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
                />
              </div>
              <div className="col-md-3">
                <label className="sb-form-label">{t("field.resType")}</label>
                <Input
                  value={t(`enum.resType.${resource.resType}`, {
                    defaultValue: resource.resType,
                  })}
                  readOnly
                  style={{ background: "#fafbfc", color: "var(--sb-ink-soft)" }}
                />
              </div>

              <div className="col-md-4">
                <Form.Item label={t("field.location")} name="location">
                  <Input maxLength={200} />
                </Form.Item>
              </div>
              <div className="col-md-2">
                <Form.Item
                  label={t("field.quantity")}
                  name="quantity"
                  rules={[
                    {
                      required: true,
                      message: t("shared.quantityRequired"),
                    },
                  ]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </div>
              <div className="col-md-3">
                <Form.Item
                  label={t("field.capacity")}
                  name="capacity"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (resource.resType === "ROOM" && !value) {
                          return Promise.reject(
                            new Error(t("shared.roomCapacityRequired")),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    min={1}
                    placeholder={t("shared.capacityPlaceholder")}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <div className="text-faint mt-1" style={{ fontSize: 12 }}>
                  {t("shared.capacityHint")}
                </div>
              </div>
              <div className="col-md-3">
                <Form.Item label={t("field.resStatus")} name="resStatus">
                  <Select options={resStatusOptions} />
                </Form.Item>
              </div>

              <div className="col-12">
                <Form.Item label={t("field.remark")} name="remark">
                  <Input />
                </Form.Item>
              </div>

              <div className="col-12">
                <Form.Item label={t("field.manager")} name="managerEmpId">
                  <EmployeePicker placeholder={t("shared.managerPlaceholder")} />
                </Form.Item>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <Link href="/res/list">
            <Button>{t("common:button.cancel")}</Button>
          </Link>
          <Button
            type="primary"
            htmlType="submit"
            icon={<CheckOutlined />}
            loading={submitting && loading}
          >
            {t("update.submitButton")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
