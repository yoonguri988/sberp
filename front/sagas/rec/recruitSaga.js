// sagas/rec/recruitSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  fetchRecruitAdminListRequest,
  fetchRecruitAdminListSuccess,
  fetchRecruitAdminListFailure,
  fetchRecruitDetailRequest,
  fetchRecruitDetailSuccess,
  fetchRecruitDetailFailure,
  createRecruitRequest,
  createRecruitSuccess,
  createRecruitFailure,
  updateRecruitRequest,
  updateRecruitSuccess,
  updateRecruitFailure,
  deleteRecruitRequest,
  deleteRecruitSuccess,
  deleteRecruitFailure,
  fetchCloneRecruitRequest,
  fetchCloneRecruitSuccess,
  fetchCloneRecruitFailure,
} from "../../reducers/rec/recruitReducer";

const RECRUIT_ADMIN_API_BASE = "/api/admin/recruit";

// listRecruitAdmin  - GET /api/admin/recruit 관리자용 공고 목록(검색+페이징)
//   params: { recStatus, pstartno(1-base), onepagelist }
export const listRecruitAdminApi = ({
  recStatus,
  recTitle,
  pstartno = 1,
  onepagelist = 10,
} = {}) =>
  api.get(RECRUIT_ADMIN_API_BASE, {
    params: {
      ...(recStatus ? { recStatus } : {}),
      ...(recTitle ? { recTitle } : {}),
      pstartno,
      onepagelist,
    },
  });

export function* listRecruitAdmin(action) {
  try {
    const result = yield call(listRecruitAdminApi, action.payload);
    yield put(fetchRecruitAdminListSuccess(result.data));
  } catch (err) {
    yield put(
      fetchRecruitAdminListFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// getRecruitDetail  - GET /api/admin/recruit/{recId}
export const getRecruitDetailApi = (recId) =>
  api.get(`${RECRUIT_ADMIN_API_BASE}/${recId}`);

export function* getRecruitDetail(action) {
  try {
    const result = yield call(getRecruitDetailApi, action.payload);
    yield put(fetchRecruitDetailSuccess(result.data));
  } catch (err) {
    yield put(
      fetchRecruitDetailFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// createRecruit  - POST /api/admin/recruit 공고 등록
export const createRecruitApi = (data) =>
  api.post(RECRUIT_ADMIN_API_BASE, data);

export function* createRecruit(action) {
  try {
    const result = yield call(createRecruitApi, action.payload);
    yield put(createRecruitSuccess(result.data));
  } catch (err) {
    yield put(
      createRecruitFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// updateRecruit  - PUT /api/admin/recruit/{recId} 공고 수정
//   응답 본문이 비어 있으므로, 성공 시 상세를 다시 조회해 반영한다.
export const updateRecruitApi = ({ recId, ...data }) =>
  api.put(`${RECRUIT_ADMIN_API_BASE}/${recId}`, data);

export function* updateRecruit(action) {
  try {
    const { recId } = action.payload;
    yield call(updateRecruitApi, action.payload);
    const detailResult = yield call(getRecruitDetailApi, recId);
    yield put(updateRecruitSuccess(detailResult.data));
  } catch (err) {
    yield put(
      updateRecruitFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// deleteRecruit  - DELETE /api/admin/recruit/{recId} 공고 삭제
export const deleteRecruitApi = (recId) =>
  api.delete(`${RECRUIT_ADMIN_API_BASE}/${recId}`);

export function* deleteRecruit(action) {
  try {
    yield call(deleteRecruitApi, action.payload);
    yield put(deleteRecruitSuccess(action.payload));
  } catch (err) {
    yield put(
      deleteRecruitFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// cloneRecruit  - GET /api/admin/recruit/{recId}/clone 공고 복제(프리필용 데이터 조회)
export const cloneRecruitApi = (recId) =>
  api.get(`${RECRUIT_ADMIN_API_BASE}/${recId}/clone`);

export function* cloneRecruit(action) {
  try {
    const result = yield call(cloneRecruitApi, action.payload);
    yield put(fetchCloneRecruitSuccess(result.data));
  } catch (err) {
    yield put(
      fetchCloneRecruitFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchListRecruitAdmin() {
  yield takeLatest(fetchRecruitAdminListRequest.type, listRecruitAdmin);
}
function* watchGetRecruitDetail() {
  yield takeLatest(fetchRecruitDetailRequest.type, getRecruitDetail);
}
function* watchCreateRecruit() {
  yield takeLatest(createRecruitRequest.type, createRecruit);
}
function* watchUpdateRecruit() {
  yield takeLatest(updateRecruitRequest.type, updateRecruit);
}
function* watchDeleteRecruit() {
  yield takeLatest(deleteRecruitRequest.type, deleteRecruit);
}
function* watchCloneRecruit() {
  yield takeLatest(fetchCloneRecruitRequest.type, cloneRecruit);
}

export default function* recruitSaga() {
  yield all([
    call(watchListRecruitAdmin),
    call(watchGetRecruitDetail),
    call(watchCreateRecruit),
    call(watchDeleteRecruit),
    call(watchUpdateRecruit),
    call(watchCloneRecruit),
  ]);
}
