import { all, call, put, takeLatest, takeLeading } from "redux-saga/effects";
import api from "../../api/axios";
import {
    fetchWritableFormsRequest, fetchWritableFormsSuccess, fetchWritableFormsFailure,
    fetchWriterInfoRequest, fetchWriterInfoSuccess, fetchWriterInfoFailure,
    writeDocRequest, writeDocSuccess, writeDocFailure,
    fetchDocListRequest, fetchDocListSuccess, fetchDocListFailure,
    fetchDocDetailRequest, fetchDocDetailSuccess, fetchDocDetailFailure,
    approveDocRequest, approveDocSuccess, approveDocFailure,
    rejectDocRequest, rejectDocSuccess, rejectDocFailure,
    fetchApprLinesRequest, fetchApprLinesSuccess, fetchApprLinesFailure,
    fetchDeptTreeRequest, fetchDeptTreeSuccess, fetchDeptTreeFailure,
    fetchDeptEmpsRequest, fetchDeptEmpsSuccess, fetchDeptEmpsFailure,
    resetProcessState, resetWriteState,
    fetchFavoriteLinesRequest, fetchFavoriteLinesSuccess, fetchFavoriteLinesFailure,
    updateDocRequest, updateDocSuccess, updateDocFailure,
} from "../../reducers/appr/apprDocReducer";

const APPR_API_BASE = "/api/appr";

// 작성 가능한 양식 목록 (토큰 comId)
// GET /appr/getFormList
export const fetchWritableFormsApi = () =>
    api.get(`${APPR_API_BASE}/getFormList`);

export function* fetchWritableForms() {
    // payload -> X
    try {
        const result = yield call(fetchWritableFormsApi);
        yield put(fetchWritableFormsSuccess(result.data));
    } catch (err) {
        yield put(fetchWritableFormsFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchWritableForms() {
    yield takeLatest(fetchWritableFormsRequest.type, fetchWritableForms);
}

// 작성자 인적사항 조회 (토큰 empId)
// GET /appr/write_doc
export const fetchWriterInfoApi = () => 
    api.get(`${APPR_API_BASE}/write_doc`);

export function* fetchWriterInfo() {
    // payload -> x
    try {
        const result = yield call(fetchWriterInfoApi);
        yield put(fetchWriterInfoSuccess(result.data));
    } catch (err) {
        yield put(fetchWriterInfoFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchWriterInfo() {
    yield takeLatest(fetchWriterInfoRequest.type, fetchWriterInfo);
}

// 문서 작성 (토큰에서 emp,com id값)
// POST /appr/write_doc?empId= &comId=
export const writeDocApi = ({data}) =>
    api.post(`${APPR_API_BASE}/write_doc`, data);

export function* writeDoc(action) {
    // payload -> {data}
    try {
        yield call(writeDocApi, action.payload);
        yield put(writeDocSuccess());
    } catch (err) {
        yield put(writeDocFailure(err.response?.data?.error || err.message));
    }
}

function* watchWriteDoc() {
    // Latest -> 최신 요청 결과만 필요한경우
    // Leading -> 한번만 실행되어야 하는경우
    yield takeLeading(writeDocRequest.type, writeDoc);
}

// 문서 목록 조회 (토큰 empid값)
// GET /appr/list_doc?tab= &keyword= &status= &page= (&empId=)
export const fetchDocListApi = (params) =>
    api.get(`${APPR_API_BASE}/list_doc`, {params});

export function* fetchDocList(action) {
    // payload ->{tab, keyword, status, page}
    try {
        const result = yield call(fetchDocListApi, action.payload);
        yield put(fetchDocListSuccess(result.data));
    } catch (err) {
        yield put(fetchDocListFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchDocList() {
    yield takeLatest(fetchDocListRequest.type, fetchDocList);
}

// 문서 상세 조회 (토큰 empId)
// GET /appr/detail_doc/{docId}
export const fetchDocDetailApi = ({docId}) =>
    api.get(`${APPR_API_BASE}/detail_doc/${docId}`);

export function* fetchDocDetail(action) {
    // payload -> {docId}
    try {
        const result = yield call(fetchDocDetailApi, action.payload);
        yield put(fetchDocDetailSuccess(result.data));
    } catch (err) {
        yield put(fetchDocDetailFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchDocDetail() {
    yield takeLatest(fetchDocDetailRequest.type, fetchDocDetail);
}

// 결재 승인 (토큰 empId)
// POST /appr/detail_doc/{docId}/app
export const approveDocApi = ({docId}) => 
    api.post(`${APPR_API_BASE}/detail_doc/${docId}/app`, null);

export function* approveDoc(action) {
    // payload -> {docId}
    try {
        yield call(approveDocApi, action.payload);
        yield put(approveDocSuccess());
    } catch (err) {
        yield put(approveDocFailure(err.response?.data?.error || err.message));
    }
}

function* watchApproveDoc() {
    yield takeLeading(approveDocRequest.type, approveDoc);
}

// 문서 수정 (토큰 empId, 낙관적 락)
// put /appr/{docId}
export const updateDocApi = ({docId, data}) => 
    api.put(`${APPR_API_BASE}/${docId}`,data);

export function* updateDoc(action) {
    // {docId, data: {docTitle, docContent, docRevision}}
    try {
        yield call(updateDocApi, action.payload);
        yield put(updateDocSuccess());
    } catch (err) {
        yield put(updateDocFailure(err.response?.data?.error || err.message));
    }
}

function* watchUpdateDoc() {
    yield takeLeading(updateDocRequest.type, updateDoc);
}

// 결재 반려 (토큰 empId)
// POST /appr/detail_doc/{docId}/rej?empid=
export const rejectDocApi = ({docId}) =>
    api.post(`${APPR_API_BASE}/detail_doc/${docId}/rej`, null);

export function* rejectDoc(action) {
    // payload -> {docId}
    try {
        yield call(rejectDocApi, action.payload);
        yield put(rejectDocSuccess());
    } catch (err) {
        yield put(rejectDocFailure(err.response?.data?.error || err.message));
    }
}

function* watchRejectDoc() {
    yield takeLeading(rejectDocRequest.type, rejectDoc);
}

// 기안자 상사 목록 조회 (토큰 empId)
// GET /appr/getApprLines
export const fetchApprLinesApi = () =>
    api.get(`${APPR_API_BASE}/getApprLines`);

export function* fetchApprLines() {
    // payload -> x
    try {
        const result = yield call(fetchApprLinesApi);
        yield put(fetchApprLinesSuccess(result.data));
    } catch (err) {
        yield put(fetchApprLinesFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchApprLines() {
    yield takeLatest(fetchApprLinesRequest.type, fetchApprLines);
}

// 부서 체인 + 지정 가능 인원수 조회 (토큰 empId)
// GET /appr/getDeptTree?deptId=
export const fetchDeptTreeApi = ({deptId}) =>
    api.get(`${APPR_API_BASE}/getDeptTree`, {params: {deptId}});

export function* fetchDeptTree(action) {
    // payload -> {deptId}
    try {
        const result = yield call(fetchDeptTreeApi, action.payload);
        yield put(fetchDeptTreeSuccess(result.data));
    } catch (err) {
        yield put(fetchDeptTreeFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchDeptTree() {
    yield takeLatest(fetchDeptTreeRequest.type, fetchDeptTree);
}

// 특정 부서 소속 사원 목록 조회
// GET /appr/getDeptEmps?deptId=
export const fetchDeptEmpsApi = (deptId) =>
    api.get(`${APPR_API_BASE}/getDeptEmps`,{params:{deptId}});

export function* fetchDeptEmps(action) {
    // payload -> deptId
    try {  
        const result = yield call(fetchDeptEmpsApi, action.payload);
        yield put(fetchDeptEmpsSuccess(result.data))
    } catch (err) {
        yield put(fetchDeptEmpsFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchDeptEmps() {
    yield takeLatest(fetchDeptEmpsRequest.type, fetchDeptEmps);
}

// 결재선 즐겨찾기 추천 조회
// get /appr/lines/favorites?deptId=&forId=
export const fetchFavoriteLinesApi = ({deptId, forId}) =>
    api.get(`/api/appr/lines/favorites`, {params: {deptId, forId}});

export function* fetchFavoriteLines(action) {
    try {
        const result = yield call(fetchFavoriteLinesApi, action.payload);
        yield put(fetchFavoriteLinesSuccess(result.data));
    } catch (err) {
        yield put(fetchFavoriteLinesFailure(err.response?.data?.error || err.message));
    }
}

function* watchFetchFavoriteLines() {
    yield takeLatest(fetchFavoriteLinesRequest.type, fetchFavoriteLines);
}

export default function* apprDocSaga() {
    yield all([
        call(watchFetchWritableForms),
        call(watchFetchWriterInfo),
        call(watchWriteDoc),
        call(watchFetchDocList),
        call(watchFetchDocDetail),
        call(watchApproveDoc),
        call(watchRejectDoc),
        call(watchFetchApprLines),
        call(watchFetchDeptTree),
        call(watchFetchDeptEmps),
        call(watchFetchFavoriteLines),
        call(watchUpdateDoc),
    ]);
}