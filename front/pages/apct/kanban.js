// pages/apct/kanban.js
// 지원자 칸반보드 (ROLE_ADMIN) - GET /api/admin/applicant/kanban?recId= (페이징 없음, 공고 하나 전체)
// 상태 변경은 기존 PUT /api/admin/applicant/{apctId}/status 재사용 (드래그 종료 시 호출)
// 검색/컬럼 그룹핑은 서버 재호출 없이 클라이언트에서 kanbanList를 필터링/분류
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { Card, Select, Input, Button, Tag, Empty, Skeleton, message } from "antd";
import { ArrowLeftOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import moment from "moment";

import {
  fetchApplicantKanbanRequest,
  updateApplicantStatusRequest,
  resetApplicantState,
} from "../../reducers/apct/applicantReducer";
import { fetchRecruitAdminListRequest } from "../../reducers/rec/recruitReducer";

const STATUS_ORDER = ["RECEIVED", "SCREENING", "INTERVIEW", "HIRED", "REJECTED"];

export default function ApplicantKanbanPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("apct");

  const { kanbanList, kanbanLoading, kanbanError, statusError } = useSelector(
    (state) => state.applicant,
  );
  const { list: recruitOptions } = useSelector((state) => state.recruit);

  const [recId, setRecId] = useState(undefined);
  const [search, setSearch] = useState("");

  // list.js/dashboard.js와 동일한 상태 라벨·색상 조합(색각이상 시뮬레이션 검증 완료 팔레트)을 그대로 사용
  const STATUS_META = {
    RECEIVED: { text: t("common.statusLabels.received"), color: "#8a93a3" },
    SCREENING: { text: t("common.statusLabels.screening"), color: "#2563eb" },
    INTERVIEW: { text: t("common.statusLabels.interview"), color: "#d97706" },
    HIRED: { text: t("common.statusLabels.hired"), color: "#16a34a" },
    REJECTED: { text: t("common.statusLabels.rejected"), color: "#dc2626" },
  };

  useEffect(() => {
    dispatch(fetchRecruitAdminListRequest({ onepagelist: 100, pstartno: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // 쿼리스트링(recId)로 진입한 경우 초기값 반영 (예: 지원자 목록 → "칸반보드")
  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.recId) setRecId(Number(router.query.recId));
  }, [router.isReady, router.query.recId]);

  useEffect(() => {
    if (!recId) return;
    dispatch(fetchApplicantKanbanRequest(recId));
    return () => dispatch(resetApplicantState());
  }, [recId, dispatch]);

  useEffect(() => {
    if (statusError) message.error(statusError);
  }, [statusError]);

  const filteredList = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return kanbanList;
    return kanbanList.filter((a) => (a.apctName || "").toLowerCase().includes(keyword));
  }, [kanbanList, search]);

  const columns = useMemo(() => {
    const grouped = {};
    STATUS_ORDER.forEach((status) => {
      grouped[status] = filteredList.filter((a) => a.apctStatus === status);
    });
    return grouped;
  }, [filteredList]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const apctId = Number(draggableId);
    const newStatus = destination.droppableId;
    dispatch(updateApplicantStatusRequest({ apctId, newStatus }));
  };

  return (
    <div className="sb-page">
      <div className="sb-page-head" style={{ marginBottom: 16 }}>
        <div className="sb-page-head__txt">
          <Link href={recId ? `/apct/list?recId=${recId}` : "/apct/list"}>
            <Button type="text" className="sb-page-back" icon={<ArrowLeftOutlined />}>
              {t("kanban.backBtn")}
            </Button>
          </Link>
          <div className="sb-breadcrumb">{t("kanban.breadcrumb")}</div>
          <h1>{t("kanban.title")}</h1>
          <p>{t("kanban.subtitle")}</p>
        </div>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Select
            style={{ width: 280 }}
            placeholder={t("kanban.recruitPlaceholder")}
            showSearch
            optionFilterProp="label"
            value={recId}
            onChange={(v) => setRecId(v)}
            options={(recruitOptions || []).map((r) => ({
              value: r.recId,
              label: r.recTitle,
            }))}
          />
          <Input.Search
            style={{ width: 240 }}
            placeholder={t("kanban.searchPlaceholder")}
            allowClear
            disabled={!recId}
            onChange={(e) => setSearch(e.target.value)}
          />
          {recId && (
            <Link href={`/apct/list?recId=${recId}`}>
              <Button icon={<UnorderedListOutlined />}>{t("kanban.listViewBtn")}</Button>
            </Link>
          )}
        </div>
      </Card>

      {!recId && (
        <Card>
          <Empty description={t("kanban.selectRecruitEmpty")} style={{ padding: "60px 0" }} />
        </Card>
      )}

      {recId && kanbanLoading && (
        <Card>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      )}

      {recId && !kanbanLoading && kanbanError && (
        <Card>
          <Empty description={kanbanError} />
        </Card>
      )}

      {recId && !kanbanLoading && !kanbanError && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status];
              const items = columns[status] || [];
              return (
                <Droppable droppableId={status} key={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        flex: "1 1 240px",
                        minWidth: 240,
                        background: snapshot.isDraggingOver ? "#f5f7fa" : "#fafbfc",
                        border: "1px solid #e6ebe8",
                        borderRadius: 10,
                        padding: 10,
                        minHeight: 480,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "4px 6px 12px",
                        }}
                      >
                        <Tag color={meta.color} style={{ margin: 0 }}>
                          {meta.text}
                        </Tag>
                        <span style={{ color: "#999", fontSize: 12.5 }}>{t("kanban.columnCount", { count: items.length })}</span>
                      </div>

                      {items.map((item, index) => (
                        <Draggable
                          key={item.apctId}
                          draggableId={String(item.apctId)}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <Link href={`/apct/detail?apctId=${item.apctId}`}>
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                style={{
                                  background: "#fff",
                                  border: "1px solid #e6ebe8",
                                  borderRadius: 8,
                                  padding: "10px 12px",
                                  marginBottom: 8,
                                  cursor: "pointer",
                                  boxShadow: dragSnapshot.isDragging
                                    ? "0 4px 12px rgba(0,0,0,.12)"
                                    : "none",
                                  ...dragProvided.draggableProps.style,
                                }}
                              >
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                  {item.apctName}
                                </div>
                                <div style={{ color: "#889", fontSize: 12.5 }}>
                                  {item.apctEmail || "-"}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 8,
                                  }}
                                >
                                  <span style={{ color: "#aab", fontSize: 12 }}>
                                    {item.apctDate
                                      ? moment(item.apctDate).format("MM-DD")
                                      : "-"}
                                  </span>
                                  {item.resumeCnt > 0 && (
                                    <Tag color="cyan" style={{ margin: 0 }}>
                                      {t("kanban.resumeTag")}
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            </Link>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {items.length === 0 && (
                        <div
                          style={{
                            textAlign: "center",
                            color: "#bbb",
                            fontSize: 12.5,
                            padding: "20px 0",
                          }}
                        >
                          {t("kanban.emptyColumn")}
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
