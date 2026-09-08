import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import {
    Table, Input, Select, Button, Space, Tag,
    Tabs, Row, Col, Card
} from "antd";
import {
    FolderOpenOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { fetchDocListRequest } from "../../../reducers/appr/apprDocReducer";
import PageHeader from "../../../components/appr/PageHeader";
import StatusBadge from "../../../components/appr/StatusBadge";

const { Option } = Select;

// 대시보드 통계 카드
function StatCard({ icon: Icon, label, value, bg, color}) {
    return (
        <Card 
            bodyStyle={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16
            }}
        >
            <div
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon style={{fontSize: 20, color }} />
            </div>
            <div>
                <div style={{fontSize: 13, color: "rgba(0,0,0,0.45)"}}>{label}</div>
                <div style={{fontSize: 22, fontWeight: 500 }}>{value}</div>
            </div>
        </Card>
    )
}

export default function DocListPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { t } = useTranslation(["appr", "common"]);

    const {
        hisDocs, todoDocs, docCnts, myTodoCnt,
        paging, activeTab, listLoading, listError,
    } = useSelector( (state) => state.apprDoc );

    const [tab, setTab] = useState("history");
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState(undefined);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect( () => {
        dispatch(fetchDocListRequest({tab, keyword, status, page: currentPage}))
    }, [dispatch, tab, keyword, status, currentPage]);

    const handleTabChange = (key) => {
        setTab(key);
        setCurrentPage(1);
    }

    // forms 에서 사용한 columns와 동일
    const columns = [
        {title: t("docs.list.table.docId"), dataIndex: "docId", key: "docId", width: 90},
        {title: t("docs.list.table.docTitle"), dataIndex: "docTitle", key: "docTitle"},
        {title: t("docs.list.table.empName"), dataIndex: "empName", key: "empName", width: 120},
        {
            title: t("docs.list.table.important"),
            dataIndex: "important",
            key: "important",
            width: 80,
            render: (important) => (important ? <Tag color="red">{t("docs.list.importantTag")}</Tag> : null)
        },
        {
            title: t("docs.list.table.status"),
            dataIndex: "docStatus",
            key: "docStatus",
            width: 100,
            render: (docStatus) => (
                <StatusBadge domain="doc" status={docStatus} i18nKeyPrefix="docs.list.docStatus" />
            ),
        },
        // todo 탭에서만 내 결재 상태 표시
        ...(tab === "todo"
            ? [{title: t("docs.list.table.myLinStatus"), dataIndex: "linStatus", key: "linStatus", width: 110}]
            : []),
        {title: t("docs.list.table.createdAt"), dataIndex: "createdAt", key: "createdAt", width: 160},
        {
            title: t("docs.list.table.actions"),
            key: "action",
            width: 100,
            render: (_, record) => (
                <Button size="small" onClick={() => router.push(`/appr/docs/detail?docId=${record.docId}`)}>
                    {t("docs.list.detailBtn")}
                </Button>
            ),
        },
    ];

    const dataSource = tab === "todo" ? todoDocs : hisDocs;

    return(<>
        <div className="sb-page">
            <PageHeader
                breadcrumb={[
                    { label: t("common.breadcrumbRoot"), href: "/appr/docs" },
                    { label: t("docs.list.breadcrumbCurrent") },
                ]}
                title={t("docs.list.title")}
                subtitle={t("docs.list.subtitle")}
                actions={
                    <Button
                        type="primary"
                        icon={<PlusOutlined/>}
                        onClick={() => router.push("/appr/docs/write")}
                    >
                        {t("docs.list.writeBtn")}
                    </Button>
                }
            />

            {/* 대시보드 통계 카드 */}
            <Row gutter={16} style={{marginBottom: 24}}>
                <Col span={6}>
                    <StatCard
                        icon={FolderOpenOutlined}
                        label={t("docs.list.stat.total")}
                        value={docCnts?.TOTALCNT ?? 0}
                        bg="#e6f4ff"
                        color="#1677ff"
                    />
                </Col>
                <Col span={6}>
                    <StatCard
                        icon={ClockCircleOutlined}
                        label={t("docs.list.stat.ing")}
                        value={docCnts?.INGCNT ?? 0}
                        bg="#fff7e6"
                        color="#fa8c16"
                    />
                </Col>
                <Col span={6}>
                    <StatCard
                        icon={CheckCircleOutlined}
                        label={t("docs.list.stat.app")}
                        value={docCnts?.APPCNT ?? 0}
                        bg="#f6ffed"
                        color="#52c41a"
                    />
                </Col>
                <Col span={6}>
                    <StatCard
                        icon={CloseCircleOutlined}
                        label={t("docs.list.stat.rej")}
                        value={docCnts?.REJCNT ?? 0}
                        bg="#fff1f0"
                        color="#f5222d"
                    />
                </Col>

            </Row>

            <Space>
                <Input.Search
                    onSearch={(value) => {
                        setKeyword(value);
                        setCurrentPage(1);
                    }}
                    style={{width: 240}}
                    allowClear
                />
                {/* status 필터는 history 탭에서만 todo는 항상 ING+WAI */}
                {tab === "history" && (
                    <Select
                        placeholder={t("docs.list.statusPlaceholder")}
                        allowClear
                        style={{width: 120}}
                        onChange={(value) => {
                            setStatus(value);
                            setCurrentPage(1);
                        }}
                    >
                        <Option value="ING">{t("docs.list.docStatus.ing")}</Option>
                        <Option value="APP">{t("docs.list.docStatus.app")}</Option>
                        <Option value="REJ">{t("docs.list.docStatus.rej")}</Option>
                    </Select>
                )}
            </Space>

            <Tabs
                activeKey={tab}
                onChange={handleTabChange}
                items={[
                    {key: "history", label: t("docs.list.tabs.history")},
                    {key: "todo", label: `${t("docs.list.tabs.todo")}${myTodoCnt ? `(${myTodoCnt})` : ""}`},
                ]}
            />
            <Table
                rowKey="docId"
                columns={columns}
                dataSource={dataSource}
                loading={listLoading}
                pagination={{
                    current: paging?.current || currentPage,
                    pageSize: paging?.onepagelist || 10,
                    total: paging?.listtotal || 0,
                    onChange: (p) => setCurrentPage(p),
                }}
            />

            {listError && <div style={{color: "red", marginTop: 8}}>{listError}</div>}
        </div>
    </>);
}