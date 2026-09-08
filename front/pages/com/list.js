// pages/com/list.js
import React, { useEffect, useMemo, useState } from "react"; // 이벤트변경감지 , useState (변수변경)
import { useSelector, useDispatch } from "react-redux"; // 전역상태, 스토어알림
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Row,
  Col,
  Card,
  Table,
  AutoComplete,
  Select,
  Button,
  Pagination,
  Modal,
  Form,
  Input,
  Tag,
  Avatar,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  ApartmentOutlined,
  DeleteOutlined,
  RedoOutlined,
  BankOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import {
  fetchCompanyListRequest,
  fetchCompanyStatsRequest,
  suggestCompanyRequest,
  clearSuggestList,
  deleteCompanyRequest,
  restoreCompanyRequest,
  resetCompanyState,
} from "../../reducers/com/companyReducer";

import StatTile from "../../components/StatTile";
import resolveFileUrl from "../../constants/resolveFileUrl";
// 업종 대분류 코드 <-> 번역 key (com-list 화면 전용, 원본 list.html 기준)
// 실제 라벨 텍스트는 i18n/locales/{ko,en}/com.json 의 list.industry.* 키에서 조회합니다.
const INDUSTRY_GRP_CODES = [
  { value: "", key: "all" },
  { value: "C", key: "manufacturing" },
  { value: "F", key: "construction" },
  { value: "G", key: "wholesaleRetail" },
  { value: "H", key: "transportation" },
  { value: "I", key: "accommodationFood" },
  { value: "J", key: "informationCommunication" },
  { value: "K", key: "financeInsurance" },
  { value: "M", key: "professionalScientific" },
];

export default function ComListPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation(["com", "common"]);

  const {
    list,
    listTotal,
    stats,
    suggestList,
    paging,
    loading,
    error,
    success,
    message: companyMessage,
  } = useSelector((state) => state.company);

  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    industryGrpCode: "",
    pstartno: 1,
    onepagelist: 10,
  });

  // 삭제 모달 (companyReducer 에는 모달 상태가 없으므로 페이지 로컬 상태로 관리)
  const [deleteTarget, setDeleteTarget] = useState(null); // { comId, comName }
  const [deleting, setDeleting] = useState(false); // 삭제 요청 진행중 플래그
  const [deleteError, setDeleteError] = useState("");

  // 재활성화(복구) — 비밀번호 확인이 필요 없어 별도 모달 없이 confirm으로 처리
  const [restoring, setRestoring] = useState(false); // 재활성화 요청 진행중 플래그(어떤 delete/restore 결과인지 구분용)

  // 통계는 최초 1회만 조회
  useEffect(() => {
    dispatch(fetchCompanyStatsRequest());
  }, [dispatch]);

  // URL 쿼리 -> 목록 조회 (검색조건이 바뀔 때마다 재조회)
  useEffect(() => {
    if (!router.isReady) return;
    const {
      keyword: kw = "",
      industryGrpCode = "",
      pstartno = "1",
      onepagelist = "10",
    } = router.query;
    const next = {
      keyword: kw,
      industryGrpCode,
      pstartno: Number(pstartno),
      onepagelist: Number(onepagelist),
    };
    setKeyword(kw);
    setFilters(next);
    dispatch(fetchCompanyListRequest(next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  // 삭제 요청 결과 처리 (deleting 플래그로 "지금 삭제 액션에 대한 loading/success/error인지" 구분)
  useEffect(() => {
    if (!deleting || loading) return;

    if (success) {
      message.success(companyMessage || t("edit.messages.deleteSuccess"));
      setDeleteTarget(null);
      setDeleting(false);
      setDeleteError("");
      dispatch(resetCompanyState());
      // 통계 숫자(전체 회사/임직원 수)도 갱신
      dispatch(fetchCompanyStatsRequest());
    } else if (error) {
      setDeleteError(error);
      setDeleting(false);
      dispatch(resetCompanyState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, deleting]);

  // 재활성화 요청 결과 처리 (restoring 플래그로 구분)
  useEffect(() => {
    if (!restoring || loading) return;

    if (success) {
      message.success(companyMessage || t("edit.messages.restoreSuccess"));
      setRestoring(false);
      dispatch(resetCompanyState());
      dispatch(fetchCompanyStatsRequest());
    } else if (error) {
      message.error(error);
      setRestoring(false);
      dispatch(resetCompanyState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, success, error, restoring]);

  const handleRestore = (record) => {
    Modal.confirm({
      title: t("list.restore.modalTitleWithName", { name: record.comName }),
      content: t("list.restore.confirmContent", { name: record.comName }),
      okText: t("list.restore.okText"),
      cancelText: t("list.restore.cancelText"),
      onOk: () => {
        setRestoring(true);
        dispatch(restoreCompanyRequest(record.comId));
      },
    });
  };

  const pushQuery = (next) => {
    router.push({ pathname: "/com/list", query: { ...router.query, ...next } });
  };

  const handleSearch = (value) => {
    dispatch(clearSuggestList());
    pushQuery({ keyword: value ?? keyword, pstartno: 1 });
  };

  const handleKeywordChange = (value) => {
    setKeyword(value);
    if (value && value.trim()) {
      dispatch(suggestCompanyRequest(value.trim()));
    } else {
      dispatch(clearSuggestList());
    }
  };

  const handleIndustryChange = (value) =>
    pushQuery({ industryGrpCode: value, pstartno: 1 });
  const handlePageSizeChange = (value) =>
    pushQuery({ onepagelist: value, pstartno: 1 });
  const handlePageChange = (page) => pushQuery({ pstartno: page });

  const suggestOptions = useMemo(
    () =>
      (suggestList || []).map((it) => ({
        key: it.comId,
        value: it.comName,
        label: (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>
              <BankOutlined style={{ marginRight: 6, opacity: 0.5 }} />
              {it.comName}
            </span>
            <span style={{ color: "#999" }}>{it.bizNo}</span>
          </div>
        ),
      })),
    [suggestList],
  );

  const industryGrpOptions = useMemo(
    () =>
      INDUSTRY_GRP_CODES.map((item) => ({
        value: item.value,
        label: t(`list.industry.${item.key}`),
      })),
    [t],
  );
  const industryGrpMap = useMemo(
    () =>
      industryGrpOptions.reduce((acc, cur) => {
        if (cur.value) acc[cur.value] = cur.label;
        return acc;
      }, {}),
    [industryGrpOptions],
  );

  const openDelete = (record) => {
    setDeleteTarget({ comId: record.comId, comName: record.comName });
    setDeleteError("");
    form.resetFields();
  };

  const closeDelete = () => {
    setDeleteTarget(null);
    setDeleteError("");
  };

  const submitDelete = async () => {
    try {
      const { password } = await form.validateFields();
      setDeleting(true);
      setDeleteError("");
      dispatch(deleteCompanyRequest({ comId: deleteTarget.comId, password }));
    } catch (e) {
      // antd Form 자체 검증 실패 — 별도 처리 불필요
    }
  };

  const columns = [
    {
      title: t("list.columns.no"),
      key: "no",
      width: 60,
      render: (_, __, idx) =>
        listTotal - (filters.pstartno - 1) * filters.onepagelist - idx,
    },
    {
      title: t("list.columns.comName"),
      dataIndex: "comName",
      key: "comName",
      render: (name, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            shape="square"
            src={resolveFileUrl(record.comLogo) || undefined}
            icon={!record.comLogo && <BankOutlined />}
          />
          <span style={{ fontWeight: 600 }}>{name}</span>
        </div>
      ),
    },
    { title: t("list.columns.ceo"), dataIndex: "comCeo", key: "comCeo", width: 90 },
    { title: t("list.columns.bizNo"), dataIndex: "bizNo", key: "bizNo", width: 140 },
    {
      title: t("list.columns.industry"),
      dataIndex: "industryGrpCode",
      key: "industryGrpCode",
      render: (code) =>
        code ? (
          <Tag>{industryGrpMap[code] || t("list.industry.etc")}</Tag>
        ) : (
          <span style={{ color: "#bbb" }}>-</span>
        ),
    },
    {
      title: t("list.columns.empCount"),
      dataIndex: "empCount",
      key: "empCount",
      width: 110,
      align: "right",
    },
    {
      title: t("list.columns.status"),
      dataIndex: "comStatus",
      key: "comStatus",
      width: 90,
      align: "center",
      render: (status) =>
        status === "INACTIVE" ? (
          <Tag color="default">{t("list.status.inactive")}</Tag>
        ) : (
          <Tag color="green">{t("list.status.active")}</Tag>
        ),
    },
    {
      title: t("list.columns.actions"),
      key: "actions",
      width: 190,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
          <Link
            href={{ pathname: "/com/detail", query: { comId: record.comId } }}
          >
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              title={t("list.actionTitles.detail")}
            />
          </Link>
          <Link
            href={{ pathname: "/com/edit", query: { comId: record.comId } }}
          >
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              title={t("list.actionTitles.edit")}
            />
          </Link>
          <Link
            href={{ pathname: "/dept/list", query: { comId: record.comId } }}
          >
            <Button
              type="text"
              size="small"
              icon={<ApartmentOutlined />}
              title={t("list.actionTitles.org")}
            />
          </Link>
          {record.comStatus === "INACTIVE" ? (
            <Button
              type="text"
              size="small"
              icon={<RedoOutlined />}
              title={t("list.actionTitles.restore")}
              onClick={() => handleRestore(record)}
            />
          ) : (
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title={t("list.actionTitles.delete")}
              onClick={() => openDelete(record)}
            />
          )}
        </div>
      ),
    },
  ];

  //////
  return (
    <div className="sb-page">
      {/* 페이지 헤더 */}
      <div
        className="sb-page-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="sb-page-head__txt">
          <div className="sb-breadcrumb">
            {t("list.breadcrumb")}
          </div>
          <h1>{t("list.title")}</h1>
          <p>{t("list.subtitle")}</p>
        </div>
        <div className="sb-page-head__actions">
          <Link href="/com/add">
            <Button type="primary" icon={<PlusOutlined />}>
              {t("list.addButton")}
            </Button>
          </Link>
        </div>
      </div>

      {/* 통계 타일 — GET /api/com/stats */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} lg={6}>
          <StatTile
            icon={<BankOutlined />}
            tone="blue"
            label={t("list.stats.totalCompanies")}
            value={stats?.comTotal}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatTile
            icon={<TeamOutlined />}
            tone="green"
            label={t("list.stats.totalEmployees")}
            value={stats?.empTotal}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatTile
            icon={<AppstoreOutlined />}
            tone="violet"
            label={t("list.stats.industryCount")}
            value={stats?.industTotal}
          />
        </Col>
        <Col xs={12} lg={6}>
          <StatTile
            icon={<CalendarOutlined />}
            tone="amber"
            label={t("list.stats.latestCompany")}
            value={stats?.comLatest}
          />
        </Col>
      </Row>

      {/* 목록 카드 */}
      <Card>
        {/* 검색 / 필터 툴바 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <AutoComplete
            style={{ minWidth: 320, flex: 1 }}
            value={keyword}
            options={suggestOptions}
            onChange={handleKeywordChange}
            onSelect={(value) => handleSearch(value)}
            placeholder={t("list.searchPlaceholder")}
          >
            <Input.Search
              allowClear
              onSearch={(value) => handleSearch(value)}
              placeholder={t("list.searchPlaceholder")}
            />
          </AutoComplete>

          <Select
            style={{ width: 200 }}
            value={filters.industryGrpCode || ""}
            onChange={handleIndustryChange}
            options={industryGrpOptions}
          />

          <Select
            style={{ width: 130 }}
            value={filters.onepagelist || 10}
            onChange={handlePageSizeChange}
            options={[
              { value: 10, label: t("list.pageSize10") },
              { value: 30, label: t("list.pageSize30") },
              { value: 50, label: t("list.pageSize50") },
            ]}
          />

          <Button
            icon={<SearchOutlined />}
            onClick={() => handleSearch(keyword)}
          >
            {t("list.searchButton")}
          </Button>
          {filters.keyword ? (
            <Button onClick={() => pushQuery({ keyword: "", pstartno: 1 })}>
              {t("list.resetButton")}
            </Button>
          ) : null}
        </div>

        {/* 테이블 */}
        <Table
          rowKey="comId"
          columns={columns}
          dataSource={list}
          loading={loading && !deleting && !restoring}
          pagination={false}
          locale={{ emptyText: t("list.emptyText") }}
        />

        {/* 페이지네이션 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 12,
          }}
        >
          <span style={{ color: "#999", fontSize: 12.5 }}>
            {t("list.totalCountPrefix")} <b>{listTotal || 0}</b>
            {t("list.totalCountSuffix")}
          </span>
          {listTotal > filters.onepagelist && (
            <Pagination
              size="small"
              current={filters.pstartno}
              total={listTotal}
              pageSize={filters.onepagelist}
              showSizeChanger={false}
              onChange={handlePageChange}
            />
          )}
        </div>
      </Card>

      {/* 삭제 확인 모달 — DELETE /api/com/{comId}, payload: { comId, password } */}
      <Modal
        title={
          deleteTarget?.comName
            ? t("list.delete.modalTitleWithName", { name: deleteTarget.comName })
            : t("list.delete.modalTitle")
        }
        open={!!deleteTarget}
        onCancel={closeDelete}
        onOk={submitDelete}
        okText={t("list.delete.okText")}
        okButtonProps={{ danger: true, loading: deleting }}
        cancelText={t("list.delete.cancelText")}
        destroyOnClose
      >
        <p>
          {t("list.delete.confirmPrefix")}
          <b>{deleteTarget?.comName}</b>
          {t("list.delete.confirmSuffix")}
        </p>
        <Form form={form} layout="vertical" onFinish={submitDelete}>
          <Form.Item
            name="password"
            label={t("list.delete.passwordLabel")}
            validateStatus={deleteError ? "error" : ""}
            help={deleteError || undefined}
            rules={[{ required: true, message: t("list.delete.passwordRequired") }]}
          >
            <Input.Password autoFocus onPressEnter={submitDelete} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
