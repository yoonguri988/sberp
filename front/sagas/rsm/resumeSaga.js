// sagas/rsm/resumeSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  fetchAdminResumeRequest,
  fetchAdminResumeSuccess,
  fetchAdminResumeFailure,
  searchResumeRequest,
  searchResumeSuccess,
  searchResumeFailure,
} from "../../reducers/rsm/resumeReducer";

const RESUME_API_BASE = "/api/resume";

// getAdminResume  - GET /api/resume/applicants/{apctId}?recId=  지원자 이력서 상세
export const getAdminResumeApi = ({ apctId, recId }) =>
  api.get(`${RESUME_API_BASE}/applicants/${apctId}`, { params: { recId } });

export function* getAdminResume(action) {
  try {
    const result = yield call(getAdminResumeApi, action.payload);
    yield put(fetchAdminResumeSuccess(result.data));
  } catch (err) {
    // 이력서를 아직 제출하지 않은 지원자는 404가 정상 응답이므로 조용히 "없음"으로 처리
    if (err.response?.status === 404) {
      yield put(fetchAdminResumeFailure({ silent: true }));
    } else {
      yield put(
        fetchAdminResumeFailure({
          message:
            err.response?.data?.error ||
            err.response?.data?.message ||
            err.message,
        }),
      );
    }
  }
}

// searchResume  - GET /api/resume/search?recId&query&topK  이력서 RAG 검색
export const searchResumeApi = ({ recId, query, topK = 5 }) =>
  api.get(`${RESUME_API_BASE}/search`, { params: { recId, query, topK } });

export function* searchResume(action) {
  try {
    const result = yield call(searchResumeApi, action.payload);
    yield put(searchResumeSuccess(result.data));
  } catch (err) {
    yield put(
      searchResumeFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchGetAdminResume() {
  yield takeLatest(fetchAdminResumeRequest.type, getAdminResume);
}
function* watchSearchResume() {
  yield takeLatest(searchResumeRequest.type, searchResume);
}

export default function* resumeSaga() {
  yield all([call(watchGetAdminResume), call(watchSearchResume)]);
}
