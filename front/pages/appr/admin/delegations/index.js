import { useEffect, useState } from "react";
import { useDispatch, useSelector} from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
    Table, Select, Button, Space, Tabs,
    DatePicker, InputNumber, Modal, message,
} from "antd";
import {
    fetchPendingDelegReqRequest,
    approveDelegReqRequest,
    rejectDelegReqRequest,
    resetProcessState,
    fetchDelegHistoryRequest,
} from "../../../../reducers/appr/apprLineDelegationReducer";
import { fetchApprLogRequest } from "../../../../reducers/appr/apprLogReducer";
import StatusBadge from "../../../../components/appr/StatusBadge";
import PageHeader from "../../../../components/appr/PageHeader";
import { useServerTable } from "../../../../components/appr/useServerTable";
import moment from "moment";

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function DelegationAdminPage() {
    const dispatch = useDispatch();
    const { t } = useTranslation(["appr", "common"]);

    const {
        pendingRequests, pendingLoading, pendingError,
        history, historyTotal, historyLoading, historyError,
        processSubmitting, processSuccess, processError,
    } = useSelector((state) => state.apprLineDelegation);

    const {
        logs, logsTotal, logsLoading, logsError,
    } = useSelector((state) => state.apprLog);

    // 승/반
    const [tab, setTab] = useState("pending");
    const [confirmAction, setConfirmAction] = useState(null);

    // 처리이력 탭 필터/페이지
    const [histStatus, setHistStatus] = useState(undefined);
    const [histEmpId, setHistEmpId] = useState(undefined);
    const [histDateRange, setHistDateRange] = useState([null, null]);

    // 감사로그 탭 필터/페이지
    const [logDocId, setLogDocId] = useState(undefined);
    const [logEmpId, setLogEmpId] = useState(undefined);
    const [logDateRange, setLogDateRange] = useState([null, null]);

    // 날짜 문자열 포맷
    const formatDateTime = (value) => (value ? moment(value).format("YYYY-MM-DD HH:mm") : "-");

    // 대기중 요청 조회
    useEffect(() => {
        if (tab === "pending") {
            dispatch(fetchPendingDelegReqRequest());
        }
    }, [dispatch, tab]);

    // 처리이력 조회
    const { page: histPage, setPage: setHistPage, pageSize: histPageSize } = useServerTable({
        active: tab === "history",
        cond: { reqStatus: histStatus, reqEmpId: histEmpId, startDate: histDateRange[0], endDate: histDateRange[1] },
        onFetch: (page, size) => dispatch(fetchDelegHistoryRequest({
            cond: { reqStatus: histStatus, reqEmpId: histEmpId, startDate: histDateRange[0], endDate: histDateRange[1] },
            page,
            size,
        })),
        deps: [histStatus, histEmpId, histDateRange],
    });

    // 감사로그 조회
    const { page: logPage, setPage: setLogPage, pageSize: logPageSize } = useServerTable({
        active: tab === "logs",
        cond: { docId: logDocId, empId: logEmpId, startDate: logDateRange[0], endDate: logDateRange[1] },
        onFetch: (page, size) => dispatch(fetchApprLogRequest({
            cond: { docId: logDocId, empId: logEmpId, startDate: logDateRange[0], endDate: logDateRange[1] },
            page,
            size,
        })),
        deps: [logDocId, logEmpId, logDateRange],
    });

    // 승인/반려 처리 결과 반영
    useEffect(() => {
        if (processSuccess) {
            message.success(t("docs.detail.processedMsg"));
            setConfirmAction(null);
            dispatch(fetchPendingDelegReqRequest());
            dispatch(resetProcessState());
        }
    }, [processSuccess]);

    useEffect(() => {
        if (processError) {
            message.error(processError);
            dispatch(resetProcessState());
        }
    }, [processError]);

    const handleApprove = (reqId) => {
        dispatch(approveDelegReqRequest({reqId: confirmAction.reqId}));
    };
    const handleReject = (reqId) => {
        dispatch(rejectDelegReqRequest({reqId: confirmAction.reqId}));
    };

    // 대기중 요청 탭
    const pendingColumns = [
        { title: t("admin.delegations.columns.reqId"), dataIndex: "reqId", key: "reqId", width: 80 },
        { title: t("admin.delegations.columns.docTitle"), dataIndex: "docTitle", key: "docTitle" },
        { title: t("admin.delegations.columns.oriEmpName"), dataIndex: "oriEmpName", key: "oriEmpName", width: 110 },
        { title: t("admin.delegations.columns.newEmpName"), dataIndex: "newEmpName", key: "newEmpName", width: 110 },
        { title: t("admin.delegations.columns.reqEmpName"), dataIndex: "reqEmpName", key: "reqEmpName", width: 110 },
        { title: t("admin.delegations.columns.reqReason"), dataIndex: "reqReason", key: "reqReason", ellipsis: true },
        { title: t("admin.delegations.columns.createdAt"), dataIndex: "createdAt", key: "createdAt", width: 160, render: formatDateTime },
        {
            title: t("admin.delegations.columns.action"),
            key: "action",
            width: 170,
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        onClick={() => setConfirmAction({type: "approve", reqId: record.reqId})}
                    >
                        {t("docs.detail.approveBtn")}
                    </Button>
                    <Button
                        size="small"
                        danger
                        onClick={() => setConfirmAction({type: "reject", reqId: record.reqId})}
                    >
                        {t("docs.detail.rejectBtn")}
                    </Button>
                </Space>
            ),
        },
    ];

    // 처리이력 탭
    const historyColumns = [
        { title: t("admin.delegations.columns.reqId"), dataIndex: "reqId", key: "reqId", width: 80 },
        { title: t("admin.delegations.columns.docTitle"), dataIndex: "docTitle", key: "docTitle" },
        { title: t("admin.delegations.columns.oriEmpName"), dataIndex: "oriEmpName", key: "oriEmpName", width: 110 },
        { title: t("admin.delegations.columns.newEmpName"), dataIndex: "newEmpName", key: "newEmpName", width: 110 },
        { title: t("admin.delegations.columns.reqEmpName"), dataIndex: "reqEmpName", key: "reqEmpName", width: 110 },
        { title: t("admin.delegations.columns.proEmpName"), dataIndex: "proEmpName", key: "proEmpName", width: 110 },
        {
            title: t("admin.delegations.columns.status"), dataIndex: "reqStatus", key: "reqStatus", width: 90,
            render: (status) => <StatusBadge domain="delegReq" status={status} />,
        },
        { title: t("admin.delegations.columns.createdAt"), dataIndex: "createdAt", key: "createdAt", width: 160, render: formatDateTime },
        { title: t("admin.delegations.columns.processedAt"), dataIndex: "processedAt", key: "processedAt", width: 160, render: formatDateTime },
    ];

    // 감사로그 탭
    const logColumns = [
        { title: t("admin.delegations.columns.logId"), dataIndex: "logId", key: "logId", width: 80 },
        { title: t("admin.delegations.columns.docId"), dataIndex: "docId", key: "docId", width: 90 },
        { title: t("admin.delegations.columns.oriEmpName"), dataIndex: "oriEmpName", key: "oriEmpName", width: 110 },
        { title: t("admin.delegations.columns.actEmpName"), dataIndex: "actEmpName", key: "actEmpName", width: 110 },
        { title: t("admin.delegations.columns.perEmpName"), dataIndex: "perEmpName", key: "perEmpName", width: 130 },
        { title: t("admin.delegations.columns.occurredAt"), dataIndex: "createdAt", key: "createdAt", width: 160, render: formatDateTime },
    ];

    return (
        <div className="sb-page">
            <PageHeader
                breadcrumb={[
                    { label: t("common.breadcrumbRoot"), href: "/appr/docs" },
                    { label: t("admin.delegations.breadcrumbCurrent") },
                ]}
                title={t("admin.delegations.title")}
                subtitle={t("admin.delegations.subtitle")}
            />

            <Tabs
                activeKey={tab}
                onChange={setTab}
                items={[
                    {key: "pending", label: `${t("admin.delegations.tabs.pending")}${pendingRequests?.length ? `(${pendingRequests.length})` : ""} `},
                    {key: "history", label: t("admin.delegations.tabs.history")},
                    {key: "logs", label: t("admin.delegations.tabs.logs")},
                ]}
            />

            {tab === "pending" && (
                <>
                <Table
                    rowKey="reqId"
                    columns={pendingColumns}
                    dataSource={pendingRequests}
                    loading={pendingLoading}
                    pagination={false}
                    scroll={{x: 1200}}
                />
                {pendingError && <div style={{color: "red", marginTop: 8}}>{pendingError}</div>}
                </>
            )}

            {tab === "history" && (
                <>
                <Space style={{marginBottom: 16}} wrap>
                    <Select
                        placeholder={t("admin.delegations.statusPlaceholder")}
                        allowClear
                        style={{width: 120}}
                        onChange={setHistStatus}
                    >
                        <Option value="REQ">{t("admin.delegations.statusReq")}</Option>
                        <Option value="APP">{t("admin.delegations.statusApp")}</Option>
                        <Option value="REJ">{t("admin.delegations.statusRej")}</Option>
                    </Select>
                    <InputNumber
                        placeholder={t("admin.delegations.reqEmpIdPlaceholder")}
                        style={{width: 140}}
                        onChange={(v) => setHistEmpId(v || undefined)}
                    />
                    <RangePicker
                        format="YYYY-MM-DD"
                        onChange={(dates, dateStrings) => {
                            setHistDateRange(dates ? dateStrings : [null, null])
                        }}
                    />
                </Space>
                <Table
                    rowKey="reqId"
                    columns={historyColumns}
                    dataSource={history}
                    loading={historyLoading}
                    pagination={{
                        current: histPage,
                        pageSize: histPageSize,
                        total: historyTotal,
                        onChange: setHistPage,
                    }}
                    scroll={{x: 1250}}
                />
                {historyError && <div style={{color: "red", marginTop: 8}}>{historyError}</div>}
                </>
            )}

            {tab === "logs" && (
                 <>
                    <Space style={{ marginBottom: 16 }} wrap>
                        <InputNumber
                            placeholder={t("admin.delegations.docIdPlaceholder")}
                            style={{ width: 140 }}
                            onChange={(v) => setLogDocId(v || undefined)}
                        />
                        <InputNumber
                            placeholder={t("admin.delegations.empIdPlaceholder")}
                            style={{ width: 140 }}
                            onChange={(v) => setLogEmpId(v || undefined)}
                        />
                        <RangePicker
                            format="YYYY-MM-DD"
                            onChange={(dates, dateStrings) => {
                                setLogDateRange(dates ? dateStrings : [null, null]);
                            }}
                        />
                    </Space>
                    <Table
                        rowKey="logId"
                        columns={logColumns}
                        dataSource={logs}
                        loading={logsLoading}
                        pagination={{
                            current: logPage,
                            pageSize: logPageSize,
                            total: logsTotal,
                            onChange: setLogPage,
                        }}
                        scroll={{x: 800}}
                    />
                    {logsError && <div style={{ color: "red", marginTop: 8 }}>{logsError}</div>}
                </>
            )}
            <Modal
                title={confirmAction?.type === "approve" ? t("docs.detail.approveBtn") : t("docs.detail.rejectBtn")}
                open={confirmAction !== null}
                onCancel={() => setConfirmAction(null)}
                onOk={confirmAction?.type === "approve" ? handleApprove : handleReject}
                confirmLoading={processSubmitting}
                okText={confirmAction?.type === "approve" ? t("docs.detail.approveBtn") : t("docs.detail.rejectBtn")}
                cancelText={t("docs.write.cancelBtn")}
                okButtonProps={{danger: confirmAction?.type === "reject"}}
            >
                <p>
                    {confirmAction?.type === "approve"
                        ? t("admin.delegations.approveConfirmTitle")
                        : t("admin.delegations.rejectConfirmTitle")}
                </p>
            </Modal>
        </div>
    );
}