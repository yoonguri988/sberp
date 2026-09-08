// pages/res/insert.js
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Input, InputNumber, Select, message } from "antd";
import { ArrowLeftOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  addResourceRequest,
  checkResCodeRequest,
  resetResourceState,
} from "../../reducers/res/resourceReducer";
import EmployeePicker from "../../components/EmployeePicker";

// label 은 i18n/locales/{ko,en}/res.json 의 enum.resType / enum.resStatus 키와 매핑됩니다.
const RES_TYPE_VALUES = ["ROOM", "EQUIPMENT", "VEHICLE"];
const RES_STATUS_VALUES = ["AVAILABLE", "MAINTENANCE", "DISABLED"];

export default function ResourceInsertPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["res", "common"]);
  const [form] = Form.useForm();

  const resTypeOptions = RES_TYPE_VALUES.map((v) => ({
    value: v,
    label: t(`enum.resType.${v}`),
  }));
  const resStatusOptions = RES_STATUS_VALUES.map((v) => ({
    value: v,
    label: t(`enum.resStatus.${v}`),
  }));

  const { resCodeCheck, loading, error, success } = useSelector(
    (state) => state.resource,
  );

  const returnUrl = router.query.returnUrl || "";
  const backUrl = returnUrl || "/res/list";

  const [resType, setResType] = useState("ROOM");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!submitting) return;
    if (success) {
      message.success(t("insert.successMessage"));
      setSubmitting(false);
      dispatch(resetResourceState());
      router.push(backUrl);
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

  const handleCodeBlur = () => {
    const code = form.getFieldValue("resCode");
    if (!code) return;
    dispatch(checkResCodeRequest(code));
  };

  const onFinish = (values) => {
    if (resCodeCheck?.checked && resCodeCheck?.duplicate) {
      message.error(t("insert.duplicateCodeError"));
      return;
    }
    if (values.resType === "ROOM" && !values.capacity) {
      message.error(t("shared.roomCapacityRequired"));
      return;
    }
    setSubmitting(true);
    dispatch(
      addResourceRequest({
        resCode: values.resCode,
        resName: values.resName,
        resType: values.resType,
        location: values.location || null,
        quantity: values.quantity,
        capacity: values.capacity || null,
        resStatus: values.resStatus,
        remark: values.remark || null,
        managerEmpId: values.managerEmpId || null,
      }),
    );
  };

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/res/list">{t("shared.title")}</Link> ·{" "}
            {t("insert.breadcrumbCurrent")}
          </div>
          <h1>{t("insert.title")}</h1>
          <p>{t("insert.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href={backUrl}>
            <Button icon={<ArrowLeftOutlined />} size="small">
              {t("shared.backToList")}
            </Button>
          </Link>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={(changed) => {
          if ("resType" in changed) setResType(changed.resType);
        }}
        initialValues={{ resType: "ROOM", resStatus: "AVAILABLE", quantity: 1 }}
      >
        <div className="sb-card mb-3">
          <div className="sb-card__head">
            <h2>{t("shared.basicInfoTitle")}</h2>
            <span className="sub">{t("insert.requiredNote")}</span>
          </div>
          <div className="sb-card__body">
            <div className="row g-3">
              <div className="col-md-3">
                <Form.Item
                  label={t("field.resCode")}
                  name="resCode"
                  required
                  rules={[
                    {
                      required: true,
                      message: t("insert.validation.resCodeRequired"),
                    },
                  ]}
                  validateStatus={
                    resCodeCheck?.checked && resCodeCheck?.duplicate
                      ? "error"
                      : undefined
                  }
                  help={
                    resCodeCheck?.checked && resCodeCheck?.duplicate
                      ? t("insert.duplicateCodeError")
                      : undefined
                  }
                >
                  <Input
                    placeholder={t("insert.placeholder.resCode")}
                    maxLength={50}
                    onBlur={handleCodeBlur}
                  />
                </Form.Item>
              </div>
              <div className="col-md-6">
                <Form.Item
                  label={t("field.resName")}
                  name="resName"
                  required
                  rules={[
                    {
                      required: true,
                      message: t("insert.validation.resNameRequired"),
                    },
                  ]}
                >
                  <Input
                    placeholder={t("insert.placeholder.resName")}
                    maxLength={100}
                  />
                </Form.Item>
              </div>
              <div className="col-md-3">
                <Form.Item label={t("field.resType")} name="resType">
                  <Select options={resTypeOptions} />
                </Form.Item>
              </div>

              <div className="col-md-4">
                <Form.Item label={t("field.location")} name="location">
                  <Input
                    placeholder={t("insert.placeholder.location")}
                    maxLength={200}
                  />
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
                        if (resType === "ROOM" && !value) {
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
                  <Input placeholder={t("insert.placeholder.remark")} />
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
          <Link href={backUrl}>
            <Button>{t("common:button.cancel")}</Button>
          </Link>
          <Button
            type="primary"
            htmlType="submit"
            icon={<CheckOutlined />}
            loading={submitting && loading}
          >
            {t("insert.submitButton")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
