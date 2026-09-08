// sagas/rec/recruitPublicSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import apctApi from "../../api/apctAxios";
import {
  fetchPublicRecruitListRequest,
  fetchPublicRecruitListSuccess,
  fetchPublicRecruitListFailure,
  fetchPublicRecruitDetailRequest,
  fetchPublicRecruitDetailSuccess,
  fetchPublicRecruitDetailFailure,
} from "../../reducers/rec/recruitPublicReducer";

const RECRUIT_PUBLIC_API_BASE = "/api/public/recruit";

// listPublicRecruit  - GET /api/public/recruit?comId&pstartno  공개 공고 목록(OPEN만)
export const listPublicRecruitApi = ({ comId, recTitle, pstartno = 1 } = {}) =>
  apctApi.get(RECRUIT_PUBLIC_API_BASE, { params: { comId, recTitle, pstartno } });

export function* listPublicRecruit(action) {
  try {
    const result = yield call(listPublicRecruitApi, action.payload);
    yield put(fetchPublicRecruitListSuccess(result.data));
  } catch (err) {
    yield put(
      fetchPublicRecruitListFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// getPublicRecruitDetail  - GET /api/public/recruit/{recId}
export const getPublicRecruitDetailApi = (recId) =>
  apctApi.get(`${RECRUIT_PUBLIC_API_BASE}/${recId}`);

export function* getPublicRecruitDetail(action) {
  try {
    const result = yield call(getPublicRecruitDetailApi, action.payload);
    yield put(fetchPublicRecruitDetailSuccess(result.data));
  } catch (err) {
    yield put(
      fetchPublicRecruitDetailFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchListPublicRecruit() {
  yield takeLatest(fetchPublicRecruitListRequest.type, listPublicRecruit);
}
function* watchGetPublicRecruitDetail() {
  yield takeLatest(fetchPublicRecruitDetailRequest.type, getPublicRecruitDetail);
}

export default function* recruitPublicSaga() {
  yield all([call(watchListPublicRecruit), call(watchGetPublicRecruitDetail)]);
}
