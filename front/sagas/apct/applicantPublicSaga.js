// sagas/apct/applicantPublicSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import apctApi from "../../api/apctAxios";
import {
  applyRequest,
  applySuccessAction,
  applyFailure,
  fetchMyApplicationsRequest,
  fetchMyApplicationsSuccess,
  fetchMyApplicationsFailure,
  updateApplicationRequest,
  updateApplicationSuccess,
  updateApplicationFailure,
  cancelApplicationRequest,
  cancelApplicationSuccess,
  cancelApplicationFailure,
} from "../../reducers/apct/applicantPublicReducer";

const APPLICANT_PUBLIC_API_BASE = "/api/public/applicant";

// apply  - POST /api/public/applicant/apply  { recId, apctName, apctEmail?, apctPhone }
export const applyApi = (data) =>
  apctApi.post(`${APPLICANT_PUBLIC_API_BASE}/apply`, data);

export function* apply(action) {
  try {
    const result = yield call(applyApi, action.payload);
    yield put(applySuccessAction(result.data));
  } catch (err) {
    yield put(
      applyFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// fetchMyApplications  - GET /api/public/applicant/me
export const fetchMyApplicationsApi = () =>
  apctApi.get(`${APPLICANT_PUBLIC_API_BASE}/me`);

export function* fetchMyApplications() {
  try {
    const result = yield call(fetchMyApplicationsApi);
    yield put(fetchMyApplicationsSuccess(result.data));
  } catch (err) {
    yield put(
      fetchMyApplicationsFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// updateApplication  - PUT /api/public/applicant/{apctId}  { apctName, apctEmail, apctPhone }
export const updateApplicationApi = ({ apctId, ...data }) =>
  apctApi.put(`${APPLICANT_PUBLIC_API_BASE}/${apctId}`, data);

export function* updateApplication(action) {
  try {
    yield call(updateApplicationApi, action.payload);
    yield put(updateApplicationSuccess(action.payload));
  } catch (err) {
    yield put(
      updateApplicationFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}


// cancelApplication  - DELETE /api/public/applicant/{apctId}
export const cancelApplicationApi = (apctId) =>
  apctApi.delete(`${APPLICANT_PUBLIC_API_BASE}/${apctId}`);

export function* cancelApplication(action) {
  try {
    yield call(cancelApplicationApi, action.payload);
    yield put(cancelApplicationSuccess(action.payload));
  } catch (err) {
    yield put(
      cancelApplicationFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchApply() {
  yield takeLatest(applyRequest.type, apply);
}
function* watchFetchMyApplications() {
  yield takeLatest(fetchMyApplicationsRequest.type, fetchMyApplications);
}
function* watchUpdateApplication() {
  yield takeLatest(updateApplicationRequest.type, updateApplication);
}
function* watchCancelApplication() {
  yield takeLatest(cancelApplicationRequest.type, cancelApplication);
}

export default function* applicantPublicSaga() {
  yield all([
    call(watchApply),
    call(watchFetchMyApplications),
    call(watchUpdateApplication),
    call(watchCancelApplication),
  ]);
}
