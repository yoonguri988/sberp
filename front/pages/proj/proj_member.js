// pages/proj/proj_member.js

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";
import api from "../../api/axios";

import {
  Table,
  Input,
  Button,
  Empty,
  message,
  Modal,
  Popconfirm
} from "antd";

import {
  UserAddOutlined,
  TeamOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import {
  fetchProjMemRequest,
  createProjMemRequest,
  deleteProjMemRequest,
  resetProjMemState
} from "../../reducers/proj/projMemReducer";

import {
  fetchProjDetailRequest
} from "../../reducers/proj/projReducer";

const { TextArea } = Input;

export default function ProjMemberPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation("proj");

  // 프로젝트 멤버 상태
  const {
    projectMems = [],
    loading,
    error,
    createSuccess,
    deleteSuccess
  } = useSelector((state) => state.projMem);

  // 로그인 사용자
  const user = useSelector((state) => state.auth.user);

  // 프로젝트 상세 정보
  const { currentProject } = useSelector((state) => state.proj);

  const detail = currentProject?.dto;

  const proId = router.query.proId;

  // 관리자 여부
  const isAdmin =
    user?.roles?.includes("ROOT") ||
    user?.roles?.includes("ROLE_ADMIN");

  // 프로젝트 생성자 여부
  const isCreator =
    Number(detail?.empId) === Number(user?.empId);

  // 멤버 추가/삭제 권한
  const canManageMembers = isAdmin || isCreator;

  const [modalOpen, setModalOpen] = useState(false);

  // 멤버 추가 폼 값
  const [empName, setEmpName] = useState("");
  const [empId, setEmpId] = useState("");
  const [memberRole, setMemberRole] = useState("");

  // 사원 검색 자동완성 결과
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  // 프로젝트 멤버 + 프로젝트 상세 조회
  useEffect(() => {
    if (!router.isReady || !proId) return;

    // 멤버 목록 조회
    dispatch(fetchProjMemRequest(proId));

    // 프로젝트 생성자 확인을 위한 프로젝트 상세 조회
    dispatch(
      fetchProjDetailRequest({
        proId,
        pstartno: 1,
      })
    );
  }, [router.isReady, proId, dispatch]);

  // 등록 성공 처리
  useEffect(() => {
    if (!createSuccess) return;

    message.success(t("member.createSuccessMsg"));

    resetForm();

    dispatch(fetchProjMemRequest(proId));
    dispatch(resetProjMemState());
  }, [createSuccess, dispatch, proId, t]);

  // 삭제 성공 처리
  useEffect(() => {
    if (!deleteSuccess) return;

    message.success(t("member.deleteSuccessMsg"));

    dispatch(fetchProjMemRequest(proId));
    dispatch(resetProjMemState());
  }, [deleteSuccess, dispatch, proId, t]);

  // 실패 처리
  useEffect(() => {
    if (!error) return;

    // 다른 회사 프로젝트 접근
    if (error === "FORBIDDEN") {
      message.error("해당 프로젝트에 접근할 권한이 없습니다.");

      const timer = setTimeout(() => {
        router.replace("/proj/proj_list");
      }, 1000);

      return () => {
        clearTimeout(timer);
        dispatch(resetProjMemState());
      };
    }

    // 등록/삭제 등 기타 오류
    message.error(error);
    dispatch(resetProjMemState());
  }, [error, dispatch, router]);

  // 폼 초기화
  const resetForm = () => {
    setEmpName("");
    setEmpId("");
    setMemberRole("");
    setSearchResults([]);
    setSearchOpen(false);
    setModalOpen(false);
  };

  // 사원 검색
  const handleEmpName = async (e) => {
    const value = e.target.value;

    setEmpName(value);
    setEmpId("");

    if (!value.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    try {
      const res = await api.get("/api/projects/empSearch", {
        params: {
          keyword: value,
        },
      });

      setSearchResults(res.data);
      setSearchOpen(true);
    } catch (err) {
      console.error("사원 검색 오류:", err);

      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  // 검색 결과에서 사원 선택
  const handleSelectEmp = (emp) => {
    setEmpName(emp.empName);
    setEmpId(emp.empId);
    setSearchOpen(false);
    setSearchResults([]);
  };

  // 멤버 추가
  const handleCreateSubmit = () => {
    if (!empId) {
      message.warning(t("member.empSelectRequired"));
      return;
    }

    if (!memberRole.trim()) {
      message.warning(t("member.roleRequired"));
      return;
    }

    dispatch(
      createProjMemRequest({
        projectProId: proId,
        empId,
        memberRole: memberRole.trim(),
      })
    );
  };

  // 멤버 삭제
  const handleDelete = (pmId) => {
    dispatch(
      deleteProjMemRequest({
        pmId,
        proId
      })
    );
  };

  const columns = [
    {
      title: t("member.table.name"),
      dataIndex: "proName",
      key: "proName",
      render: (name) => (
        <span
          className="sb-table__name"
          style={{ cursor: "pointer" }}
        >
          {name}
        </span>
      ),
    },
    {
      title: t("member.table.dept"),
      dataIndex: "deptName",
      key: "deptName",
      render: (name) => (
        <span
          className="sb-table__name"
          style={{ cursor: "pointer" }}
        >
          {name}
        </span>
      ),
    },
    {
      title: t("member.table.emp"),
      dataIndex: "empName",
      key: "empName",
      render: (name) => (
        <span
          className="sb-table__name"
          style={{ cursor: "pointer" }}
        >
          {name}
        </span>
      ),
    },
    {
      title: t("member.table.role"),
      dataIndex: "memberRole",
      key: "memberRole",
      render: (name) => (
        <span
          className="sb-table__name"
          style={{ cursor: "pointer" }}
        >
          {name}
        </span>
      ),
    },
    {
      title: t("member.table.joinedAt"),
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (value) =>
        value
          ? dayjs(value).format("YYYY-MM-DD")
          : "-",
    },

    // 관리자 / 생성자만 삭제 가능
    ...(canManageMembers
      ? [
          {
            title: t("member.table.deleteAction"),
            key: "action",
            align: "center",
            render: (_, record) => (
              <Popconfirm
                title={t("member.deleteConfirmTitle")}
                onConfirm={() => handleDelete(record.pmId)}
                okText={t("member.deleteBtn")}
                cancelText={t("common.cancelBtn")}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                >
                  {t("member.deleteBtn")}
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  return (
    <main className="sb-content">

      {/* 페이지 헤더 */}
      <div className="sb-page-head">

        <div className="sb-page-head__txt">

          <div className="sb-breadcrumb">
            <Link href="/">
              {t("common.breadcrumbHome")}
            </Link>

            <i className="bi bi-chevron-right"></i>

            {t("common.breadcrumbWork")}{" "}

            <i className="bi bi-chevron-right"></i>

            {t("common.breadcrumbProj")}{" "}

            <i className="bi bi-chevron-right"></i>

            {t("member.breadcrumbCurrent")}
          </div>

          <h1>{t("member.title")}</h1>

          <p>{t("member.subtitle")}</p>

        </div>

        <div className="sb-page-head__actions">

          {/* 프로젝트 목록 */}
          <Link href="/proj/proj_list">
            <Button icon={<TeamOutlined />}>
              {t("common.listBtn")}
            </Button>
          </Link>

          {/* 프로젝트 상세 */}
          <Link
            href={{
              pathname: "/proj/proj_detail",
              query: { proId },
            }}
          >
            <Button icon={<TeamOutlined />}>
              {t("member.detailBtn")}
            </Button>
          </Link>

          {/* 관리자 / 생성자만 멤버 추가 버튼 표시 */}
          {canManageMembers && (
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setModalOpen(true)}
            >
              {t("member.addBtn")}
            </Button>
          )}

        </div>
      </div>


      {/* 프로젝트 멤버 목록 */}
      <div
        className="sb-card mb-3"
        style={{ overflow: "hidden" }}
      >

        <div className="sb-toolbar">

          <div
            style={{
              display: "flex",
              alignItems: "center"
            }}
          >

            <strong style={{ fontSize: 14 }}>
              {t("member.listTitle")}
            </strong>

            <span className="sb-badge sb-badge--gray ms-2">
              {projectMems.length}
              {t("member.memberCountSuffix")}
            </span>

          </div>

        </div>

        <div className="sb-card__body--flush">

          <Table
            rowKey="pmId"
            columns={columns}
            dataSource={projectMems}
            loading={loading}
            pagination={false}
            locale={{
              emptyText: (
                <Empty
                  image={
                    <TeamOutlined
                      style={{ fontSize: 32 }}
                    />
                  }
                  description={t("member.emptyMsg")}
                />
              ),
            }}
          />

        </div>

      </div>


      {/* 멤버 추가 모달 */}
      <Modal
        title={t("member.addModalTitle")}
        open={modalOpen}
        onOk={handleCreateSubmit}
        onCancel={resetForm}
        okText={t("member.modalOkText")}
        cancelText={t("member.modalCancelText")}
        confirmLoading={loading}
      >

        <div
          className="mb-3"
          style={{ position: "relative" }}
        >

          <label
            htmlFor="empName"
            className="sb-form-label"
          >
            {t("member.empNameLabel")}
          </label>

          <Input
            id="empName"
            value={empName}
            onChange={handleEmpName}
            autoComplete="off"
          />

          {searchOpen && (
            <ul
              className="list-group position-absolute"
              style={{
                zIndex: 1050,
                width: "100%",
                maxHeight: 200,
                overflowY: "auto",
              }}
            >

              {searchResults.length === 0 ? (
                <li className="list-group-item text-muted">
                  {t("member.noSearchResult")}
                </li>
              ) : (
                searchResults.map((emp) => (
                  <li
                    key={emp.empId}
                    className="list-group-item list-group-item-action"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSelectEmp(emp)}
                  >
                    {emp.empName} ({emp.empNo})
                  </li>
                ))
              )}

            </ul>
          )}

        </div>


        <div className="mb-3">

          <label
            htmlFor="empId"
            className="sb-form-label"
          >
            {t("member.empNoLabel")}
          </label>

          <Input
            id="empId"
            value={empId}
            readOnly
          />

        </div>


        <div className="mb-3">

          <label
            htmlFor="memberRole"
            className="sb-form-label"
          >
            {t("member.roleLabel")}
          </label>

          <TextArea
            id="memberRole"
            value={memberRole}
            onChange={(e) =>
              setMemberRole(e.target.value)
            }
          />

        </div>

      </Modal>

    </main>
  );
}