// reducers/dept/deptReducer.js
import { createSlice } from "@reduxjs/toolkit";

// =========================================================
//  - GET    /api/dept                    : 부서 조직도(트리) + 통계 조회 (list)
//  - GET    /api/dept/flat                : 부서 목록 평탄화 조회 (flat)
//  - POST   /api/dept                    : 부서 등록 (add)
//  - GET    /api/dept/{deptId}            : 부서 상세 조회 + breadcrumb (detail)
//  - GET    /api/dept/my                  : 내 부서 상세 조회 (myDept)
//  - PUT    /api/dept/{deptId}            : 부서 수정 (update)
//  - DELETE /api/dept/{deptId}            : 부서 삭제 (완전삭제 또는 이관대기 전환)
//  - GET    /api/dept/check-deptcode      : 부서코드 중복확인
//  - GET    /api/dept/{deptId}/ancestors  : 상위 계층 부서 목록
//  - GET    /api/dept/{deptId}/emp        : 부서(+하위부서) 소속 사원 목록
// =========================================================

const initialState = {
  // 조직도(트리) 조회 (list)
  comId: null,
  stats: null,      // 부서 통계
  orgTree: [],       // DeptResponse[] (트리)

  // 평탄화 목록 조회 (flat) - 셀렉트박스용
  flatList: [],       // DeptResponse[] (1차원, depth 포함)

  // 상세 조회 (detail / my)
  detail: null,       // DeptDetailResponse { dept, ancestorChain }
  myDept: null,        // DeptDetailResponse

  // 부서(+하위부서) 소속 사원 목록 (detail / my 화면 공용)
  deptEmpList: [],     // EmpResponse[]

  // 부서코드 중복확인 (check-deptcode)
  deptCodeCheck: {
    checked: false,
    duplicate: false,
  },

  // 상위 계층 부서 목록 (ancestors) - 조직도 범위 제한 셀렉트박스용
  ancestorDepts: [],    // DeptResponse[]

  // 삭제 결과 (완전삭제 / 이관대기 전환 구분)
  pendingTransfer: false,

  // 공통 상태
  loading: false,
  error: null,
  success: false,
  message: null,
};

const deptReducer = createSlice({
  name: "dept",
  initialState,
  reducers: {
    // ---------------------------------------------------
    // 1) 부서 조직도 조회 GET /api/dept?comId=
    // payload: comId (number | undefined)
    // ---------------------------------------------------
    fetchDeptListRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDeptListSuccess(state, action) {
      // action.payload: DeptListResponse { comId, stats, items }
      state.loading = false;
      state.comId = action.payload.comId ?? null;
      state.stats = action.payload.stats ?? null;
      state.orgTree = action.payload.items ?? [];
    },
    fetchDeptListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 2) 부서 목록 평탄화 조회 GET /api/dept/flat?comId=
    // payload: comId
    // ---------------------------------------------------
    fetchDeptFlatRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDeptFlatSuccess(state, action) {
      // action.payload: DeptResponse[]
      state.loading = false;
      state.flatList = action.payload ?? [];
    },
    fetchDeptFlatFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 3) 부서 등록 POST /api/dept
    // payload: DeptRequest
    // ---------------------------------------------------
    addDeptRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    addDeptSuccess(state, action) {
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "부서 등록에 성공하였습니다.";
    },
    addDeptFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 4) 부서 상세 조회 GET /api/dept/{deptId}
    // payload: deptId
    // ---------------------------------------------------
    fetchDeptDetailRequest(state) {
      state.loading = true;
      state.error = null;
      state.detail = null;
    },
    fetchDeptDetailSuccess(state, action) {
      // action.payload: DeptDetailResponse { dept, ancestorChain }
      state.loading = false;
      state.detail = action.payload;
    },
    fetchDeptDetailFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 5) 내 부서 상세 조회 GET /api/dept/my
    // ---------------------------------------------------
    fetchMyDeptRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMyDeptSuccess(state, action) {
      // action.payload: DeptDetailResponse
      state.loading = false;
      state.myDept = action.payload;
    },
    fetchMyDeptFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 6) 부서 수정 PUT /api/dept/{deptId}
    // payload: { deptId, dto: DeptRequest }
    // ---------------------------------------------------
    updateDeptRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    updateDeptSuccess(state, action) {
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "부서 수정에 성공하였습니다.";
    },
    updateDeptFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 7) 부서 삭제 DELETE /api/dept/{deptId}
    // payload: deptId
    // 응답: 완전삭제 { message } 또는 이관대기 { message, pendingTransfer: true, deptId }
    // ---------------------------------------------------
    deleteDeptRequest(state) {
      state.loading = true;
      state.error = null;
      state.success = false;
      state.pendingTransfer = false;
    },
    deleteDeptSuccess(state, action) {
      state.loading = false;
      state.success = true;
      state.message = action.payload?.message ?? "부서 삭제에 성공하였습니다.";
      state.pendingTransfer = !!action.payload?.pendingTransfer;
      // 완전 삭제된 경우에만 트리/평탄화 목록에서 즉시 제거 (이관대기 전환 시에는 상태값 유지 필요)
      if (!action.payload?.pendingTransfer && action.payload?.deptId) {
        state.flatList = state.flatList.filter((d) => d.deptId !== action.payload.deptId);
      }
    },
    deleteDeptFailure(state, action) {
      state.loading = false;
      state.success = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 8) 부서코드 중복확인 GET /api/dept/check-deptcode
    // payload: DeptSearchRequest (deptCode 등)
    // ---------------------------------------------------
    checkDeptCodeRequest(state) {
      state.loading = true;
      state.error = null;
      state.deptCodeCheck = { checked: false, duplicate: false };
    },
    checkDeptCodeSuccess(state, action) {
      // action.payload: { duplicate: boolean }
      state.loading = false;
      state.deptCodeCheck = { checked: true, duplicate: !!action.payload.duplicate };
    },
    checkDeptCodeFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 9) 상위 계층 부서 목록 GET /api/dept/{deptId}/ancestors
    // payload: deptId
    // ---------------------------------------------------
    fetchAncestorDeptsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAncestorDeptsSuccess(state, action) {
      // action.payload: DeptResponse[]
      state.loading = false;
      state.ancestorDepts = action.payload ?? [];
    },
    fetchAncestorDeptsFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAncestorDepts(state) {
      state.ancestorDepts = [];
    },

    // ---------------------------------------------------
    // 10) 부서(+하위부서) 소속 사원 목록 GET /api/dept/{deptId}/emp
    // payload: deptId
    // - detail.js / my.js 공용: 부서가 확정된 이후에만 호출해야 함
    // - 요청 시작 시 이전 부서의 목록이 잠깐 보이지 않도록 즉시 비운다
    // ---------------------------------------------------
    fetchDeptEmpListRequest(state) {
      state.loading = true;
      state.error = null;
      state.deptEmpList = [];
    },
    fetchDeptEmpListSuccess(state, action) {
      // action.payload: EmpResponse[]
      state.loading = false;
      state.deptEmpList = action.payload ?? [];
    },
    fetchDeptEmpListFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------------------------------------------
    // 공통: 상태 초기화 (모달 닫기, 폼 리셋 등에 사용)
    // ---------------------------------------------------
    resetDeptState(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = null;
      state.pendingTransfer = false;
    },
  },
});

export const {
  fetchDeptListRequest,
  fetchDeptListSuccess,
  fetchDeptListFailure,

  fetchDeptFlatRequest,
  fetchDeptFlatSuccess,
  fetchDeptFlatFailure,

  addDeptRequest,
  addDeptSuccess,
  addDeptFailure,

  fetchDeptDetailRequest,
  fetchDeptDetailSuccess,
  fetchDeptDetailFailure,

  fetchMyDeptRequest,
  fetchMyDeptSuccess,
  fetchMyDeptFailure,

  updateDeptRequest,
  updateDeptSuccess,
  updateDeptFailure,

  deleteDeptRequest,
  deleteDeptSuccess,
  deleteDeptFailure,

  checkDeptCodeRequest,
  checkDeptCodeSuccess,
  checkDeptCodeFailure,

  fetchAncestorDeptsRequest,
  fetchAncestorDeptsSuccess,
  fetchAncestorDeptsFailure,
  clearAncestorDepts,

  fetchDeptEmpListRequest,
  fetchDeptEmpListSuccess,
  fetchDeptEmpListFailure,

  resetDeptState,
} = deptReducer.actions;

export default deptReducer.reducer;