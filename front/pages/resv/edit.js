// pages/resv/edit.js
// 원본: edit.html 기준 (insert.js와 동일한 필드 순서/문구/레이아웃 틀을 그대로 재사용)
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, DatePicker, Form, Input, InputNumber, message } from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  LockOutlined,
  RightOutlined,
  TeamOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useTranslation } from "react-i18next";

import {
  fetchResvDetailRequest,
  updateResvRequest,
  fetchAvailableQtyRequest,
  resetResvState,
} from "../../reducers/resv/resvReducer";

const STATUS_MAP = {
  AVAILABLE: { tone: "green" },
  MAINTENANCE: { tone: "amber" },
  DISABLED: { tone: "red" },
};

function statusBadge(status, t) {
  if (status === "WAI") return <span className="sb-badge sb-badge--amber">{t("status.waiting")}</span>;
  if (status === "APP") return <span className="sb-badge sb-badge--green">{t("status.approved")}</span>;
  if (status === "REJ") return <span className="sb-badge sb-badge--red">{t("status.rejected")}</span>;
  if (status === "NORET") return <span className="sb-badge sb-badge--red">{t("status.notReturned")}</span>;
  return <span className="sb-badge sb-badge--gray">{status}</span>;
}

export default function ResvEditPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["resv", "common"]);
  const [form] = Form.useForm();

  const { detail: resv, availableQty, loading, error, success } = useSelector((state) => state.resv);

  const revId = router.query.revId ? String(router.query.revId) : "";

  const [startDt, setStartDt] = useState(null);
  const [endDt, setEndDt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const prevLoading = useRef(false);

  useEffect(() => {
    if (!router.isReady || !revId) return;
    dispatch(fetchResvDetailRequest(revId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, revId]);

  useEffect(() => {
    if (!resv) return;
    form.setFieldsValue({
      startDt: resv.startDt ? moment(resv.startDt) : null,
      endDt: resv.endDt ? moment(resv.endDt) : null,
      quantity: resv.quantity ?? 1,
      remark: resv.remark,
    });
    setStartDt(resv.startDt || null);
    setEndDt(resv.endDt || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resv]);

  // 자원 + 시작일시 + 종료일시가 모두 채워지면 실제 잔여수량을 다시 조회한다
  // (insert.js와 동일한 방식. 단, 수정 중인 예약 자신은 잔여수량 계산에서 제외해야 하므로
  // excludeRevId를 함께 넘긴다).
  useEffect(() => {
    if (resv?.resId && startDt && endDt) {
      dispatch(
        fetchAvailableQtyRequest({
          resId: resv.resId,
          startDt,
          endDt,
          excludeRevId: revId,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, resv?.resId, startDt, endDt]);

  useEffect(() => {
    if (!submitting) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("edit.updateSuccess"));
        setSubmitting(false);
        dispatch(resetResvState());
        router.push("/resv/my");
      } else if (error) {
        message.error(error);
        setSubmitting(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, submitting]);

  useEffect(() => {
    prevLoading.current = loading;
  }, [loading]);

  useEffect(() => {
    return () => {
      dispatch(resetResvState());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!resv) return null;

  const editable = resv.status === "WAI";

  // 1차 상한: 예약 상세 조회 시점의 자원 총 보유수량(서버 조회 전 임시값).
  // availableQty가 조회되면(현재 예약 자신은 제외한) 실제 잔여수량으로 좁힌다.
  const quantityMax =
    availableQty && String(availableQty.resId ?? resv.resId) === String(resv.resId)
      ? availableQty.availableQty
      : (resv.resQuantity ?? null);

  const infoStatus =
    availableQty && availableQty.availableQty <= 0
      ? STATUS_MAP.DISABLED
      : STATUS_MAP[resv.resStatus] || null;
  const infoStatusText =
    availableQty && availableQty.availableQty <= 0
      ? t("resStatus.disabled")
      : {
          AVAILABLE: t("resStatus.available"),
          MAINTENANCE: t("resStatus.maintenance"),
          DISABLED: t("resStatus.disabled"),
        }[resv.resStatus] || "-";

  const handleStartChange = (d) => {
    const v = d ? d.format("YYYY-MM-DDTHH:mm") : null;
    setStartDt(v);
    if (v && endDt && moment(endDt).isBefore(moment(v))) {
      setEndDt(v);
      form.setFieldsValue({ endDt: moment(v) });
    }
  };
  const handleEndChange = (d) => setEndDt(d ? d.format("YYYY-MM-DDTHH:mm") : null);

  const onFinish = (values) => {
    if (moment(endDt).isBefore(moment(startDt))) {
      form.setFields([{ name: "endDt", errors: [t("edit.endBeforeStart")] }]);
      return;
    }
    if (availableQty && availableQty.availableQty <= 0) {
      form.setFields([
        { name: "quantity", errors: [t("edit.noAvailableQuantity")] },
      ]);
      return;
    }
    setSubmitting(true);
    dispatch(
      updateResvRequest({
        revId,
        dto: {
          resId: resv.resId,
          startDt,
          endDt,
          quantity: values.quantity,
          remark: values.remark || null,
        },
      }),
    );
  };

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <Link href="/resv/my">{t("edit.breadcrumbList")}</Link> <RightOutlined /> {t("edit.breadcrumbCurrent")}
          </div>
          <h1>{t("edit.title")}</h1>
          <p>{t("edit.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/resv/my">
            <Button icon={<ArrowLeftOutlined />}>
              {t("edit.backToList")}
            </Button>
          </Link>
        </div>
      </div>

      {!editable && (
        <Alert
          className="mb-3"
          type="error"
          showIcon
          message={
            resv.status === "APP"
              ? t("edit.alreadyApprovedAlert")
              : t("edit.rejectedAlert")
          }
        />
      )}

      {editable && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <div className="sb-card mb-3">
            <div className="sb-card__head">
              <h2>{t("edit.cardTitle")}</h2>
              <span className="sub">{t("edit.statusPrefix")} {statusBadge(resv.status, t)}</span>
            </div>
            <div className="sb-card__body">
              {/* 예약 자원 (수정 불가) */}
              <div className="mb-3">
                <label className="sb-form-label">{t("edit.resourceLabel")}</label>
                <Input value={`${resv.resName} (${resv.resCode})`} readOnly />
                <span className="sb-field-msg text-faint" style={{ display: "flex" }}>
                  <LockOutlined /> {t("edit.resourceLockedNote")}
                </span>
              </div>

              {/* 선택된 자원 상세 정보 : location / capacity / res_status */}
              <div className="mb-3 p-3" style={{ background: "var(--sb-accent-soft)", borderRadius: 10 }}>
                <div className="text-faint mb-1" style={{ fontSize: 12 }}>
                  {t("edit.selectedResourceInfo")}
                </div>
                <div className="d-flex flex-wrap gap-3" style={{ fontSize: 13 }}>
                  <span>
                    <EnvironmentOutlined className="text-faint" /> {t("edit.location")} <b>{resv.location || "-"}</b>
                  </span>
                  <span>
                    <TeamOutlined className="text-faint" /> {t("edit.capacity")}{" "}
                    <b>{resv.capacity ? t("edit.capacityValue", { capacity: resv.capacity }) : "-"}</b>
                  </span>
                  <span>
                    <InboxOutlined className="text-faint" /> {t("edit.ownedQuantity")}{" "}
                    <b>
                      {availableQty
                        ? `${availableQty.availableQty} / ${availableQty.totalQuantity}`
                        : (quantityMax ?? "-")}
                    </b>
                  </span>
                  <span>
                    <span className={`sb-badge sb-badge--${infoStatus?.tone || "gray"}`}>{infoStatusText}</span>
                  </span>
                </div>
                {infoStatus && infoStatus !== STATUS_MAP.AVAILABLE && (
                  <div className="text-danger mt-2" style={{ fontSize: 12.5 }}>
                    <ExclamationCircleOutlined /> {t("edit.maintenanceWarning")}
                  </div>
                )}
              </div>

              {/* 예약 기간 : START_DT ~ END_DT (기존값 프리필) */}
              <div className="row mb-1">
                <div className="col-6">
                  <Form.Item label={t("edit.startDtLabel")} name="startDt" rules={[{ required: true, message: t("edit.startDtRequired") }]}>
                    <DatePicker
                      showTime={{ format: "HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: "100%" }}
                      onChange={handleStartChange}
                    />
                  </Form.Item>
                </div>
                <div className="col-6">
                  <Form.Item label={t("edit.endDtLabel")} name="endDt" rules={[{ required: true, message: t("edit.endDtRequired") }]}>
                    <DatePicker
                      showTime={{ format: "HH:mm" }}
                      format="YYYY-MM-DD HH:mm"
                      style={{ width: "100%" }}
                      disabledDate={(d) => (startDt ? d && d.isBefore(moment(startDt), "day") : false)}
                      onChange={handleEndChange}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="mb-3 text-faint" style={{ fontSize: 12 }}>
                <InfoCircleOutlined /> {t("edit.overlapNote")}
              </div>

              {/* 예약 수량 */}
              <div className="mb-3">
                <Form.Item
                  label={t("edit.quantityLabel")}
                  name="quantity"
                  rules={[
                    { required: true, message: t("edit.quantityMin") },
                    {
                      validator: (_, value) => {
                        if (quantityMax != null && value > quantityMax) {
                          return Promise.reject(new Error(t("edit.quantityMaxExceeded", { max: quantityMax })));
                        }
                        if (value != null && value < 1) {
                          return Promise.reject(new Error(t("edit.quantityMin")));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <InputNumber min={1} max={quantityMax ?? undefined} style={{ width: "100%" }} />
                </Form.Item>
              </div>

              {/* 신청 사유 */}
              <div className="mb-4">
                <Form.Item label={t("edit.remarkLabel")} name="remark">
                  <Input.TextArea rows={4} placeholder={t("edit.remarkPlaceholder")} />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <Link href="/resv/my">
              <Button>{t("common:button.cancel")}</Button>
            </Link>
            <Button type="primary" htmlType="submit" icon={<CheckOutlined />} loading={submitting && loading}>
              {t("edit.saveButton")}
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}