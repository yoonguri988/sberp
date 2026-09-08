// sagas/com/companySaga.js
import { all, call, put, takeLatest, debounce } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 적용) - 경로는 실제 프로젝트에 맞게 수정

import {
  addCompanyRequest,
  addCompanySuccess,
  addCompanyFailure,

  fetchCompanyListRequest,
  fetchCompanyListSuccess,
  fetchCompanyListFailure,

  fetchCompanyDetailRequest,
  fetchCompanyDetailSuccess,
  fetchCompanyDetailFailure,

  updateCompanyRequest,
  updateCompanySuccess,
  updateCompanyFailure,

  deleteCompanyRequest,
  deleteCompanySuccess,
  deleteCompanyFailure,

  restoreCompanyRequest,
  restoreCompanySuccess,
  restoreCompanyFailure,

  checkBizNoRequest,
  checkBizNoSuccess,
  checkBizNoFailure,

  suggestCompanyRequest,
  suggestCompanySuccess,
  suggestCompanyFailure,

  fetchCompanyStatsRequest,
  fetchCompanyStatsSuccess,
  fetchCompanyStatsFailure,

  fetchMyCompanyRequest,
  fetchMyCompanySuccess,
  fetchMyCompanyFailure,
} from "../../reducers/com/companyReducer";

const COMPANY_API_BASE = "/api/com";

// ComRequest(dto) + logoFile 을 multipart/form-data 로 변환한다.
function buildCompanyFormData(dto, logoFile) {
  const formData = new FormData();
  Object.entries(dto ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  if (logoFile) {
    formData.append("logoFile", logoFile);
  }
  return formData;
}
// 에러 응답에서 서버 메시지를 최대한 안전하게 뽑아낸다.
function extractErrorMessage(error, fallback) {
  return error?.response?.data?.message ?? error?.message ?? fallback;
}

// =========================================================
// 1) 회사 등록 POST /api/com
// action.payload: { dto: ComRequest, logoFile: File | null }
// =========================================================
export const addCompanyApi = (dto, logoFile) => api.post(COMPANY_API_BASE, buildCompanyFormData(dto, logoFile), {
    headers: { "Content-Type": "multipart/form-data" },
  });
 
export function* addCompany(action) {
  try {
    const { dto, logoFile } = action.payload;
    const res = yield call(addCompanyApi, dto, logoFile);
 
    yield put(addCompanySuccess(res.data));
  } catch (err) {
    yield put(addCompanyFailure(err.response?.data?.message || "회사 등록에 실패하였습니다."));
  }
}

// =========================================================
// 2) 회사 목록 조회 GET /api/com
// action.payload: CompanySearchRequest
// =========================================================
export const fetchCompanyListApi = (searchParams) => api.get(COMPANY_API_BASE, { params: searchParams });
export function* fetchCompanyList(action) {
  try {
    const res = yield call(fetchCompanyListApi, action.payload);
 
    yield put(fetchCompanyListSuccess(res.data));
  } catch (err) {
    yield put(fetchCompanyListFailure(err.response?.data?.message || "회사 목록 조회에 실패하였습니다."));
  }
}

// =========================================================
// 3) 회사 상세 조회 GET /api/com/{comId}
// action.payload: comId
// =========================================================
export const fetchCompanyDetailApi = (comId) => api.get(`${COMPANY_API_BASE}/${comId}`);
 
export function* fetchCompanyDetail(action) {
  try {
    const comId = action.payload;
    const res = yield call(fetchCompanyDetailApi, comId);
 
    yield put(fetchCompanyDetailSuccess(res.data));
  } catch (err) {
    yield put(fetchCompanyDetailFailure(err.response?.data?.message || "회사 상세 조회에 실패하였습니다."));
  }
}

// =========================================================
// 4) 회사 수정 PUT /api/com/{comId}
// action.payload: { comId, dto: ComRequest, logoFile: File | null }
// =========================================================
export const updateCompanyApi = (comId, dto, logoFile) => api.put(`${COMPANY_API_BASE}/${comId}`, buildCompanyFormData(dto, logoFile), {
    headers: { "Content-Type": "multipart/form-data" },
  });
 
export function* updateCompany(action) {
  try {
    const { comId, dto, logoFile } = action.payload;
    const res = yield call(updateCompanyApi, comId, dto, logoFile);
 
    yield put(updateCompanySuccess(res.data));
  } catch (err) {
    yield put(updateCompanyFailure(err.response?.data?.message || "회사 정보 수정에 실패하였습니다."));
  }
}

// =========================================================
// 5) 회사 삭제 DELETE /api/com/{comId}
// action.payload: { comId, password }
// =========================================================
export const deleteCompanyApi = (comId, password) => api.delete(`${COMPANY_API_BASE}/${comId}`, {
    data: { password }, // DeleteCompanyRequest
  });
 
export function* deleteCompany(action) {
  try {
    const { comId, password } = action.payload;
    const res = yield call(deleteCompanyApi, comId, password);
 
    yield put(deleteCompanySuccess({ ...res.data, comId }));
  } catch (err) {
    yield put(deleteCompanyFailure(err.response?.data?.message || "회사 삭제에 실패하였습니다."));
  }
}

// =========================================================
// 5-1) 회사 재활성화 PUT /api/com/{comId}/restore
// action.payload: comId
// =========================================================
export const restoreCompanyApi = (comId) => api.put(`${COMPANY_API_BASE}/${comId}/restore`);

export function* restoreCompany(action) {
  try {
    const comId = action.payload;
    const res = yield call(restoreCompanyApi, comId);

    yield put(restoreCompanySuccess({ ...res.data, comId }));
  } catch (err) {
    yield put(restoreCompanyFailure(err.response?.data?.message || "회사 재활성화에 실패하였습니다."));
  }
}

// =========================================================
// 6) 사업자번호 중복확인 GET /api/com/check-bizno
// action.payload: bizNo
// =========================================================
export const checkBizNoApi = (bizNo) => api.get(`${COMPANY_API_BASE}/check-bizno`, { params: { bizNo } });
 
export function* checkBizNo(action) {
  try {
    const bizNo = action.payload;
    const res = yield call(checkBizNoApi, bizNo);
 
    yield put(checkBizNoSuccess(res.data));
  } catch (err) {
    yield put(checkBizNoFailure(err.response?.data?.message || "사업자번호 중복확인에 실패하였습니다."));
  }
}

// =========================================================
// 7) 회사명 자동완성 GET /api/com/suggest
// action.payload: keyword
// (debounce: 타이핑 중 과도한 요청 방지)
// =========================================================
export const suggestCompanyApi = (keyword) => api.get(`${COMPANY_API_BASE}/suggest`, { params: { keyword } });
 
export function* suggestCompany(action) {
  try {
    const keyword = action.payload;
 
    if (!keyword || !keyword.trim()) {
      yield put(suggestCompanySuccess([]));
      return;
    }
 
    const res = yield call(suggestCompanyApi, keyword);
 
    yield put(suggestCompanySuccess(res.data));
  } catch (err) {
    yield put(suggestCompanyFailure(err.response?.data?.message || "회사명 자동완성 조회에 실패하였습니다."));
  }
}

// =========================================================
// 8) 회사 통계 조회 GET /api/com/stats
// =========================================================
export const fetchCompanyStatsApi = () => api.get(`${COMPANY_API_BASE}/stats`);
export function* fetchCompanyStats() {
  try {
    const res = yield call(fetchCompanyStatsApi);
 
    yield put(fetchCompanyStatsSuccess(res.data));
  } catch (err) {
    yield put(fetchCompanyStatsFailure(err.response?.data?.message || "회사 통계 조회에 실패하였습니다."));
  }
}

// =========================================================
// 9) 내 회사 정보 조회 GET /api/com/my
// =========================================================
export const fetchMyCompanyApi = () => api.get(`${COMPANY_API_BASE}/my`);
export function* fetchMyCompany() {
  try {
    const res = yield call(fetchMyCompanyApi);
 
    yield put(fetchMyCompanySuccess(res.data));
  } catch (err) {
    yield put(fetchMyCompanyFailure(err.response?.data?.message || "내 회사 정보 조회에 실패하였습니다."));
  }
}

function* watchAddCompany() { yield takeLatest(addCompanyRequest.type, addCompany); }
function* watchFetchCompanyList() { yield takeLatest(fetchCompanyListRequest.type, fetchCompanyList); }
function* watchFetchCompanyDetail() { yield takeLatest(fetchCompanyDetailRequest.type, fetchCompanyDetail); }
function* watchUpdateCompany() { yield takeLatest(updateCompanyRequest.type, updateCompany); }
function* watchDeleteCompany() { yield takeLatest(deleteCompanyRequest.type, deleteCompany); }
function* watchRestoreCompany() { yield takeLatest(restoreCompanyRequest.type, restoreCompany); }
function* watchCheckBizNo() { yield takeLatest(checkBizNoRequest.type, checkBizNo); }
function* watchSuggestCompany() { yield debounce(300, suggestCompanyRequest.type, suggestCompany); }
function* watchFetchCompanyStats() { yield takeLatest(fetchCompanyStatsRequest.type, fetchCompanyStats); }
function* watchFetchMyCompany() { yield takeLatest(fetchMyCompanyRequest.type, fetchMyCompany); }

export default function* companySaga() {
  yield all([
    call(watchAddCompany),
    call(watchFetchCompanyList),
    call(watchFetchCompanyDetail),
    call(watchUpdateCompany),
    call(watchDeleteCompany),
    call(watchRestoreCompany),
    call(watchCheckBizNo),
    call(watchSuggestCompany),
    call(watchFetchCompanyStats),
    call(watchFetchMyCompany),
  ]);
}