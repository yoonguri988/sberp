// pages/admin/resv/detail.js
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Button, message } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import { fetchResvDetailRequest } from "../../../reducers/resv/resvReducer";
import {
  approveResvRequest,
  rejectResvRequest,
  resetAdminResvState,
} from "../../../reducers/resv/adminResvReducer";
import ResvDetailView, {
  statusBadge,
} from "../../../components/ResvDetailView";
import ApproveResvModal from "../../../components/ApproveResvModal";
import RejectResvModal from "../../../components/RejectResvModal";

export default function AdminResvDetailPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation(["resv", "common"]);

  const { detail: resv } = useSelector((state) => state.resv);
  const { loading, error, success } = useSelector((state) => state.adminResv);

  const revId = router.query.revId ? String(router.query.revId) : "";

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const prevLoading = useRef(false);

  useEffect(() => {
    if (!router.isReady || !revId) return;
    dispatch(fetchResvDetailRequest(revId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, router.isReady, revId]);

  useEffect(() => {
    if (!approving) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("adminDetail.approveSuccess"));
        setApproveTarget(null);
        setApproving(false);
        dispatch(resetAdminResvState());
        dispatch(fetchResvDetailRequest(revId));
      } else if (error) {
        message.error(error);
        setApproving(false);
        dispatch(resetAdminResvState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, approving]);

  useEffect(() => {
    if (!rejecting) return;
    if (prevLoading.current && !loading) {
      if (success) {
        message.success(t("adminDetail.rejectSuccess"));
        setRejectTarget(null);
        setRejecting(false);
        dispatch(resetAdminResvState());
        dispatch(fetchResvDetailRequest(revId));
      } else if (error) {
        message.error(error);
        setRejecting(false);
        dispatch(resetAdminResvState());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, rejecting]);

  useEffect(() => {
    prevLoading.current = loading;
  }, [loading]);

  if (!resv) return null;

  const showActions = resv.status === "WAI";

  const confirmApprove = () => {
    if (!approveTarget) return;
    setApproving(true);
    dispatch(approveResvRequest(approveTarget.revId));
  };
  const confirmReject = (rejectReason) => {
    if (!rejectTarget) return;
    setRejecting(true);
    dispatch(rejectResvRequest({ revId: rejectTarget.revId, rejectReason }));
  };

  return (
    <div className="sb-content">
      <div className="sb-page-head">
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            <div className="sb-breadcrumb">
              <Link href="/">{t("adminDetail.breadcrumbHome")}</Link> <span>&gt;</span>
              <Link href="/admin/resv/list?status=WAI">
                {t("adminDetail.breadcrumbList")}
              </Link>{" "}
              <span>&gt;</span>
              {t("adminDetail.breadcrumbCurrent")}
            </div>
          </div>
          <h1>
            {t("adminDetail.heading", { revId: resv.revId })}{" "}
            <span className="ms-2">{statusBadge(resv.status, t)}</span>
          </h1>
          <p>{resv.resName}</p>
        </div>
        <div className="sb-page-head__actions">
          <div className="d-flex gap-2">
            {showActions && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() =>
                    setApproveTarget({
                      revId: resv.revId,
                      resName: resv.resName,
                    })
                  }
                >
                  {t("common:button.approve")}
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() =>
                    setRejectTarget({
                      revId: resv.revId,
                      resName: resv.resName,
                    })
                  }
                >
                  {t("common:button.reject")}
                </Button>
              </>
            )}
            <Link href="/admin/resv/list?status=WAI">
              <Button icon={<ArrowLeftOutlined />}>{t("adminDetail.backToList")}</Button>
            </Link>
          </div>
        </div>
      </div>

      <ResvDetailView resv={resv} />

      <ApproveResvModal
        target={approveTarget}
        open={!!approveTarget}
        loading={approving && loading}
        onClose={() => setApproveTarget(null)}
        onConfirm={confirmApprove}
      />
      <RejectResvModal
        target={rejectTarget}
        open={!!rejectTarget}
        loading={rejecting && loading}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
      />
    </div>
  );
}
