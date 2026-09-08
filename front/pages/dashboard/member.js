import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Row, Col, Table, Button, Spin, Empty} from "antd";
import { loadUserRequest } from "../../reducers/auth/authReducer";
import { fetchWriterInfoRequest } from "../../reducers/appr/apprDocReducer";
import { fetchSummaryRequest } from "../../reducers/dashboard/memberDashboardReducer";
import StatusBadge from "../../components/appr/StatusBadge";

// 대시보드 통계 카드
function StatCard({ icon, label, value}) {
    return (
        <div className="sb-stat">
            <div className="sb-stat__top">
                <span className="sb-stat__ico">
                    <i className={`bi ${icon}`}/>
                </span>
                <span className="sb-stat__label">{label}</span>
            </div>
            <div className="sb-stat__val">{value}</div>
        </div>
    );
}

export default function Home() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation(["dashboard", "common", "appr"]);

    const { user, accessToken } = useSelector((state) => state.auth);
    const { writerInfo } = useSelector((state) => state.apprDoc);
    const { summary, summaryLoading, summaryError} = useSelector((state) => state.memberDashboard);

    // 로그인 정보 로드
    useEffect(() => {
        dispatch(loadUserRequest());
        dispatch(fetchWriterInfoRequest());
    }, [dispatch]);

    // 대시보드 요약 조회
    useEffect(() => {
        dispatch(fetchSummaryRequest());
    }, [dispatch]);

    if (summaryLoading || !summary) {
        return (
            <div className="sb-page" style={{textAlign: "center", padding: "80px 0"}}>
                <Spin size="large"/>
            </div>
        );
    }

    if (summaryError) {
        return (
            <div className="sb-page" style={{padding: 24}}>
                <div className="sb-card" bordered="false">
                    <Empty description={summaryError}/>
                </div>
            </div>
        );
    }

    const {
        todoDocCnt,
        todoDocs,
        leaveBalance,
        todayAttendance,
        evalOpen,
        evalProgress,
        recentNotices,
        myProjects,
        myReservations,
    } = summary;

    const attStatusText = !todayAttendance
        ? t("member.attStatus.absent")
        : todayAttendance.checkOut
            ? t("member.attStatus.done")
            : t("member.attStatus.working");

    const todoDocColumns = [
        { title: t("member.todoDoc.docId"), dataIndex: "docId", key: "docId", width: 90 },
        { title: t("member.todoDoc.docTitle"), dataIndex: "docTitle", key: "docTitle", width: 180, ellipsis: true },
        { title: t("member.todoDoc.empName"), dataIndex: "empName", key: "empName", width: 100 },
        {
            title: t("member.todoDoc.docStatus"), dataIndex: "docStatus", key: "docStatus", width: 90,
            render: (status) => <StatusBadge domain="doc" status={status} />,
        },
        {
            title: "", key: "action", width: 90,
            render: (_, record) => (
                <Button size="small" onClick={() => router.push(`/appr/docs/detail?docId=${record.docId}`)}>
                    {t("member.todoDoc.approveBtn")}
                </Button>
            ),
        },
    ];

    return (
        <div className="sb-page">
            {/* 인사말 헤더 */}
            <div className="sb-page-head">
                <div className="sb-page-head__txt">
                    <h1>{t("member.greeting", { empName: user?.empName })}</h1>
                    <p>{writerInfo?.deptName} · {user?.posName} · {user?.comName}</p>
                </div>
                <div className="sb-page-head__actions">
                    <span className="sb-badge sb-badge--blue">
                        <i className="bi bi-calendar3"/>
                        {moment().format(i18n.language === "en" ? "MMM D, YYYY (ddd)" : "YYYY년 MM월 DD일 (ddd)")}
                    </span>
                </div>
            </div>

            {/* 진행중 인사평가 */}
            {evalOpen && evalProgress && (
                <div
                    className="sb-card"
                    style={{
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        background: "#2563eb",
                        color: "#fff",
                    }}
                >
                    <div style={{display: "flex", alignItems: "center", gap: 12}}>
                        <i className="bi bi-clipboard-data" style={{fontSize: 22}}/>
                        <div>
                            <div style={{fontWeight: 700}}>
                                {evalProgress.periodName} {t("member.evalOpen.titleSuffix")} <span className="sb-badge" style={{marginLeft: 6}}>{t("member.evalOpen.inProgressBadge")}</span>
                            </div>
                            <div style={{fontSize: 13, opacity: 0.85}}>
                                {t("member.evalOpen.progressText", {
                                    submittedCount: evalProgress.submittedCount,
                                    totalCount: evalProgress.totalCount,
                                })}
                            </div>
                        </div>
                    </div>
                    <Button onClick={() => router.push(`/eval/period/${evalProgress.periodId}`)}>
                        {t("member.evalOpen.goToEvalBtn")}
                    </Button>
                </div>
            )}
            {/* 통계카드 4개 */}
            <Row gutter={16} style={{marginBottom: 16}}>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon="bi-file-earmark-text"
                        label={t("member.stats.pendingApproval")}
                        value={t("member.stats.unitCase", { count: todoDocCnt })}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon="bi-calendar-check"
                        label={t("member.stats.leaveRemaining")}
                        value={leaveBalance ? t("member.stats.unitDay", { count: leaveBalance.remainingDays }) : t("member.stats.noData")}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon="bi-clock"
                        label={t("member.stats.todayAtt")}
                        value={attStatusText}
                    />
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <StatCard
                        icon="bi-kanban"
                        label={t("member.stats.myProjects")}
                        value={t("member.stats.unitCase", { count: myProjects?.length ?? 0 })}
                    />
                </Col>
            </Row>

            {/* 컨텐츠 그리드 */}
            <Row gutter={16} style={{marginBottom: 16}}>
                <Col xs={24} md={12}>
                    <div className="sb-card equal-height-card">
                        <div className="sb-card__head">
                            <h2>{t("member.pendingBoxHead")}</h2>
                            <Button
                                size="small"
                                onClick={() => router.push("/appr/docs?tab=todo")}
                            >
                                {t("member.viewAll")}
                            </Button>
                        </div>
                        <div className="sb-card__body">
                            <Table
                                rowKey="docId"
                                columns={todoDocColumns}
                                dataSource={todoDocs}
                                pagination={false}
                                size="small"
                                scroll={{ y: 240 }}
                                locale={{emptyText: t("member.pendingEmptyMsg")}}
                            />
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={12}>
                    <div className="sb-card equal-height-card">
                        <div className="sb-card__head">
                            <h2>{t("member.noticeHead")}</h2>
                            <Button
                                size="small"
                                onClick={() => router.push("/notice/list")}
                            >
                                {t("member.moreBtn")}
                            </Button>
                        </div>
                        <div className="sb-card__body scrollable-timeline">
                            {(!recentNotices || recentNotices.length === 0) ? (
                                <Empty description={t("member.noticeEmptyMsg")}/>
                            ) : (
                                recentNotices.map((n) => (
                                    <div
                                        key={n.bno}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "10px 0",
                                            borderBottom: "1px solid #f0f0f0",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <span style={{fontWeight: 500}}>{n.btitle}</span>
                                        <span style={{fontSize: 12, color: "#8a93a3"}}>
                                            {moment(n.createdAt).format("YYYY-MM-DD")}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <div className="sb-card equal-height-card">
                        <div className="sb-card__head">
                            <h2>{t("member.myProjectHead")}</h2>
                            <Button size="small" onClick={() => router.push("/proj/proj_list")}>
                                {t("member.viewAll")}
                            </Button>
                        </div>
                        <div className="sb-card__body scrollable-timeline">
                            {(!myProjects || myProjects.length === 0) ? (
                                <Empty description={t("member.myProjectEmptyMsg")}/>
                            ) : (
                                myProjects.map((p) => (
                                    <div key={p.proId} style={{marginBottom: 16}}>
                                        <div style={{display: "flex", justifyContent: "space-between", marginBottom: 6}}>
                                            <span style={{fontWeight: 600}}>{p.proName}</span>
                                            {p.endDate && (
                                                <span style={{fontSize: 12, color: "#8a93a3"}}>
                                                    ~{moment(p.endDate).format("YYYY-MM-DD")}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                                            <div style={{flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3}}>
                                                <div style={{
                                                    width: `${p.progressRate}%`,
                                                    height: "100%",
                                                    background: "#2563eb",
                                                    borderRadius: 3
                                                }}
                                                />
                                            </div>
                                            <span style={{fontSize: 12, color: "#8a93a3"}}>{p.progressRate}%</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={12}>
                    <div className="sb-card equal-height-card">
                        <div className="sb-card__head">
                            <h2>{t("member.myReservationHead")}</h2>
                            <Button
                                size="small"
                                onClick={() => router.push("/resv/my")}
                            >
                                {t("member.moreBtn")}
                            </Button>
                        </div>
                        <div className="sb-card__body scrollable-timeline">
                            {(!myReservations || myReservations.length === 0) ? (
                                <Empty description={t("member.reservationEmptyMsg")}/>
                            ) : (
                                myReservations.map((r) => (
                                    <div
                                        key={r.revId}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "10px 0",
                                            borderBottom: "1px solid #f0f0f0"
                                        }}
                                    >
                                        <div>
                                            <div style={{fontWeight: 500}}>{r.resName}</div>
                                            <div style={{fontSize: 12, color: "#8a93a3"}}>
                                                {moment(r.startDt).format("YYYY-MM-DD HH:mm")} ~ {moment(r.endDt).format("HH:mm")}
                                            </div>
                                        </div>
                                        <span className={`sb-badge ${r.status === "APP"
                                            ? "sb-badge--green" : r.status === "WAI"
                                            ? "sb-badge--amber" : "sb-badge--gray"}`}>
                                                {r.status === "APP" ? t("member.resvStatus.APP") : r.status === "WAI" ? t("member.resvStatus.WAI") : r.status}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
