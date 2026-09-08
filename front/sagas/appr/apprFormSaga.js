import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
    fetchFormListRequest, fetchFormListSuccess, fetchFormListFailure,
    fetchFormDetailRequest, fetchFormDetailSuccess, fetchFormDetailFailure,
    fetchFormVersionsRequest, fetchFormVersionsSuccess, fetchFormVersionsFailure,
    insertFormRequest, insertFormSuccess, insertFormFailure,
    updateFormRequest, updateFormSuccess, updateFormFailure,
    deleteFormRequest, deleteFormSuccess, deleteFormFailure,
    resetFormState
} from "../../reducers/appr/apprFormReducer";

const APPR_FORM_API_BASE = "/api/appr";

// 양식 목록 조회
// GET /appr
export const fetchFormListApi = (params) => api.get(APPR_FORM_API_BASE, {params});

export function* fetchFormList(action) {
    // payload -> {comId, keyword, forStatus, page, onepagelist}
    try {
        const result = yield call(fetchFormListApi, action.payload);
        yield put(fetchFormListSuccess(result.data));
    } catch (err) {
        yield put(fetchFormListFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchFormList() {
    yield takeLatest(fetchFormListRequest.type, fetchFormList);
}

// 양식 단건 조회
// GET /api/appr/forms/{forId}/{forVersion}
export const getFormApi = ({forId, forVersion}) =>
    api.get(`${APPR_FORM_API_BASE}/${forId}/${forVersion}`);

export function* fetchFormDetail(action) {
    // payload -> {forId, forVersion}
    try {
        const result = yield call(getFormApi, action.payload);
        yield put(fetchFormDetailSuccess(result.data));
    } catch (err) {
        yield put(fetchFormDetailFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchFormDetail() {
    yield takeLatest(fetchFormDetailRequest.type, fetchFormDetail);
}

// 양식 버전 이력 조회
// GET /api/appr/forms/{forId}/versions
export const getFormVersionsApi = (forId) =>
    api.get(`${APPR_FORM_API_BASE}/${forId}/versions`);

export function* fetchFormVersions(action) {
    // payload -> forId
    try {
        const result = yield call(getFormVersionsApi, action.payload);
        yield put(fetchFormVersionsSuccess(result.data));
    } catch (err) {
        yield put(fetchFormVersionsFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchFormVersions() {
    yield takeLatest(fetchFormVersionsRequest.type, fetchFormVersions);
}

// 양식 등록
// POST /api/appr/forms
export const insertFormApi = (formData) =>
    api.post(APPR_FORM_API_BASE, formData);

export function* insertForm(action) {
    // payload -> formData
    try {
        yield call(insertFormApi, action.payload);
        yield put(insertFormSuccess());
    } catch (err) {
        yield put(insertFormFailure(err.response?.data?.error || err.message));
    }
}

function* watchInsertForm() {
    yield takeLatest(insertFormRequest.type, insertForm);
}

// 양식 수정
// PUT /api/appr/forms/{forId}/{forVersion}
export const updateFormApi = ({forId, forVersion, data}) =>
    api.put(`${APPR_FORM_API_BASE}/${forId}/${forVersion}`, data);

export function* updateForm(action) {
    // payload -> {forId, forVersion, data}
    try {
        yield call(updateFormApi, action.payload);
        yield put(updateFormSuccess());
    } catch (err) {
        yield put(updateFormFailure(err.response?.data?.error || err.message));
    }
}

function* watchUpdateForm() {
    yield takeLatest(updateFormRequest.type, updateForm);
}

// 양식 삭제
// DELETE /api/appr/forms/{forId}/{forVersion}
export const deleteFormApi = ({forId, forVersion}) =>
    api.delete(`${APPR_FORM_API_BASE}/${forId}/${forVersion}`);

export function* deleteForm(action) {
    // payload -> {forId, forVersion}
    try {
        yield call(deleteFormApi, action.payload);
        yield put(deleteFormSuccess(action.payload.forId));
    } catch (err) {
        yield put(deleteFormFailure(err.response?.data?.error || err.message));
    }
}

function* watchDeleteForm() {
    yield takeLatest(deleteFormRequest.type, deleteForm);
}

export default function* apprFormSaga() {
    yield all ([
        call(watchFetchFormList),
        call(watchFetchFormDetail),
        call(watchFetchFormVersions),
        call(watchInsertForm),
        call(watchUpdateForm),
        call(watchDeleteForm),
    ])
}