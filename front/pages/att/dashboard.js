// pages/att/dashboard.js

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Card, Button, Descriptions, Tag, Modal, message } from "antd";
import { LoginOutlined, LogoutOutlined, CheckCircleOutlined, } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import moment from "moment";

import { checkInRequest, checkOutRequest, myAttRequest, resetAttState, } from "../../reducers/att/attReducer";

const STATUS_COLOR = {
  NORMAL: "green",
  LATE: "orange",
  EARLY_LEAVE: "gold",
  ABSENT: "red",
  AM_HALF: "cyan",
  PM_HALF: "blue",
  ANNUAL: "purple",
};

export default function AttDashboardPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation(["att", "common"]);

  const { myAttList, todayAtt, loading, success, error } = useSelector((state) => state.att);

  const today = moment().format("YYYY-MM-DD");
  const effectiveTodayAtt = todayAtt || (myAttList && myAttList.find(
        (att) => moment(att.attDate).format("YYYY-MM-DD") === today
    )) || null;

  useEffect(() => {
    dispatch(myAttRequest());
    return () => {
      dispatch(resetAttState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // todayAtt checkOut 유무로 출근/퇴근 구분
      if (todayAtt?.checkOut) {
        message.success(t("att:msg.checkOutSuccess"));
      } else {
        message.success(t("att:msg.checkInSuccess"));
      }
      dispatch(resetAttState());
    }
  }, [success, effectiveTodayAtt, dispatch, t]);

  useEffect(() => {
  if (error) { message.error(error); dispatch(resetAttState()); }
  }, [error]);

  // ── 출근 버튼 핸들러 ──
  const handleCheckIn = () => {
    Modal.confirm({
      title: t("att:dashboard.confirmCheckIn"),
      onOk: () => {
        // dispatch(checkInRequest())
        //   → attReducer: loading=true
        //   → attSaga: POST /api/att/check-in
        //   → 성공: checkInSuccess → effectiveTodayAtt 세팅 + success=true
        dispatch(checkInRequest());
      },
    });
  };

  // ── 퇴근 버튼 핸들러 ──
  const handleCheckOut = () => {
    Modal.confirm({
      title: t("att:dashboard.confirmCheckOut"),
      onOk: () => {
        dispatch(checkOutRequest());
      },
    });
  };

  const renderStatus = () => {
    // ── Case 1: 출근 전 ──
    if (!effectiveTodayAtt) {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 16, marginBottom: 24 }}>
            {t("att:dashboard.notCheckedIn")}
          </p>
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={handleCheckIn}
            loading={loading}
          >
            {t("att:dashboard.btnCheckIn")}
          </Button>
        </div>
      );
    }

    // ── Case 2 & 3: 출근 후 (퇴근 여부로 분기) ──
    return (
      <>
        {/* Descriptions: Ant Design의 키-값 정보 표시 컴포넌트 */}
        {/* column=2 → 한 줄에 2개씩 표시 */}
        <Descriptions
          bordered
          column={2}
          title={
            effectiveTodayAtt.checkOut
              ? t("att:dashboard.checkedOut")
              : t("att:dashboard.checkedIn")
          }
        >
          <Descriptions.Item label={t("att:dashboard.todayDate")}>
            {effectiveTodayAtt.attDate
              ? moment(effectiveTodayAtt.attDate).format("YYYY-MM-DD")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("att:dashboard.status")}>
            {effectiveTodayAtt.attStatus && (
              <Tag color={STATUS_COLOR[effectiveTodayAtt.attStatus] || "default"}>
                {t(`att:status.${effectiveTodayAtt.attStatus}`, effectiveTodayAtt.attStatus)}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("att:dashboard.checkInTime")}>
            {effectiveTodayAtt.checkIn
              ? moment(effectiveTodayAtt.checkIn).format("HH:mm:ss")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label={t("att:dashboard.checkOutTime")}>
            {effectiveTodayAtt.checkOut
              ? moment(effectiveTodayAtt.checkOut).format("HH:mm:ss")
              : "—"}
          </Descriptions.Item>
          {effectiveTodayAtt.checkOut && (
            <Descriptions.Item label={t("att:dashboard.workMinutes")}>
              {effectiveTodayAtt.workMinutes != null ? effectiveTodayAtt.workMinutes : "—"}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* 퇴근 전이면 퇴근 버튼, 퇴근 후면 완료 메시지 */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          {!effectiveTodayAtt.checkOut ? (
            <Button
              type="primary"
              size="large"
              icon={<LogoutOutlined />}
              onClick={handleCheckOut}
              loading={loading}
            >
              {t("att:dashboard.btnCheckOut")}
            </Button>
          ) : (
            <p style={{ color: "#52c41a", fontSize: 16 }}>
              <CheckCircleOutlined /> {t("att:dashboard.workDone")}
            </p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("common:breadcrumbRoot")} &gt; {t("att:breadcrumb")} &gt; {t("att:dashboard.breadcrumb")}
          </div>
          <h1>{t("att:dashboard.title")}</h1>
          <p>{t("att:dashboard.subtitle")}</p>
        </div>
      </div>

      <Card>{renderStatus()}</Card>
    </div>
  );
}