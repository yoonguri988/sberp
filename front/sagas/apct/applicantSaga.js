// sagas/apct/applicantSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  fetchApplicantAdminListRequest,
  fetchApplicantAdminListSuccess,
  fetchApplicantAdminListFailure,
  fetchApplicantDetailRequest,
  fetchApplicantDetailSuccess,
  fetchApplicantDetailFailure,
  fetchApplicantDashboardRequest,
  fetchApplicantDashboardSuccess,
  fetchApplicantDashboardFailure,
  fetchApplicantRankRequest,
  fetchApplicantRankSuccess,
  fetchApplicantRankFailure,
  fetchApplicantKanbanRequest,
  fetchApplicantKanbanSuccess,
  fetchApplicantKanbanFailure,
  updateApplicantStatusRequest,
  updateApplicantStatusSuccess,
  updateApplicantStatusFailure,
} from "../../reducers/apct/applicantReducer";

const APPLICANT_ADMIN_API_BASE = "/api/admin/applicant";

// listApplicantAdmin  - GET /api/admin/applicant  (recId?, apctStatus?, page(0-base), size)
export const listApplicantAdminApi = ({
  recId,
  apctStatus,
  page = 0,
  size = 10,
} = {}) =>
  api.get(APPLICANT_ADMIN_API_BASE, {
    params: {
      ...(recId ? { recId } : {}),
      ...(apctStatus ? { apctStatus } : {}),
      page,
      size,
    },
  });

export function* listApplicantAdmin(action) {
  try {
    const result = yield call(listApplicantAdminApi, action.payload);
    yield put(fetchApplicantAdminListSuccess(result.data));
  } catch (err) {
    yield put(
      fetchApplicantAdminListFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// getApplicantDetail  - GET /api/admin/applicant/{apctId}
export const getApplicantDetailApi = (apctId) =>
  api.get(`${APPLICANT_ADMIN_API_BASE}/${apctId}`);

export function* getApplicantDetail(action) {
  try {
    const result = yield call(getApplicantDetailApi, action.payload);
    yield put(fetchApplicantDetailSuccess(result.data));
  } catch (err) {
    yield put(
      fetchApplicantDetailFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// getApplicantDashboard  - GET /api/admin/applicant/dashboard
export const getApplicantDashboardApi = () =>
  api.get(`${APPLICANT_ADMIN_API_BASE}/dashboard`);

export function* getApplicantDashboard() {
  try {
    const result = yield call(getApplicantDashboardApi);
    yield put(fetchApplicantDashboardSuccess(result.data));
  } catch (err) {
    yield put(
      fetchApplicantDashboardFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// getApplicantRank  - GET /api/admin/applicant/rank  (recId, page(0-base), size)
export const getApplicantRankApi = ({ recId, page = 0, size = 10 }) =>
  api.get(`${APPLICANT_ADMIN_API_BASE}/rank`, {
    params: { recId, page, size },
  });

export function* getApplicantRank(action) {
  try {
    const result = yield call(getApplicantRankApi, action.payload);
    yield put(fetchApplicantRankSuccess(result.data));
  } catch (err) {
    yield put(
      fetchApplicantRankFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// getApplicantKanban  - GET /api/admin/applicant/kanban?recId=
export const getApplicantKanbanApi = (recId) =>
  api.get(`${APPLICANT_ADMIN_API_BASE}/kanban`, { params: { recId } });

export function* getApplicantKanban(action) {
  try {
    const result = yield call(getApplicantKanbanApi, action.payload);
    yield put(fetchApplicantKanbanSuccess(result.data));
  } catch (err) {
    yield put(
      fetchApplicantKanbanFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// updateApplicantStatus  - PUT /api/admin/applicant/{apctId}/status?newStatus=
export const updateApplicantStatusApi = ({ apctId, newStatus }) =>
  api.put(`${APPLICANT_ADMIN_API_BASE}/${apctId}/status`, null, {
    params: { newStatus },
  });

export function* updateApplicantStatus(action) {
  try {
    const { apctId, newStatus } = action.payload;
    yield call(updateApplicantStatusApi, action.payload);
    yield put(updateApplicantStatusSuccess({ apctId, status: newStatus }));
  } catch (err) {
    yield put(
      updateApplicantStatusFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchListApplicantAdmin() {
  yield takeLatest(fetchApplicantAdminListRequest.type, listApplicantAdmin);
}
function* watchGetApplicantDetail() {
  yield takeLatest(fetchApplicantDetailRequest.type, getApplicantDetail);
}
function* watchGetApplicantDashboard() {
  yield takeLatest(fetchApplicantDashboardRequest.type, getApplicantDashboard);
}
function* watchGetApplicantRank() {
  yield takeLatest(fetchApplicantRankRequest.type, getApplicantRank);
}
function* watchGetApplicantKanban() {
  yield takeLatest(fetchApplicantKanbanRequest.type, getApplicantKanban);
}
function* watchUpdateApplicantStatus() {
  yield takeLatest(updateApplicantStatusRequest.type, updateApplicantStatus);
}

export default function* applicantSaga() {
  yield all([
    call(watchListApplicantAdmin),
    call(watchGetApplicantDetail),
    call(watchGetApplicantDashboard),
    call(watchGetApplicantRank),
    call(watchGetApplicantKanban),
    call(watchUpdateApplicantStatus),
  ]);
}
