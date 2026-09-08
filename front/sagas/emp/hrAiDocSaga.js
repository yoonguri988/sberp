// sagas/emp/hrAiDocSaga.js
// HR 규정 문서 관리 — 비동기 API 호출을 Redux-Saga로 처리
// salAiDocSaga.js(급여 규정 문서)와 동일한 구조, API 경로만 /api/hrai/docs로 변경
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 포함)
import {
  listHrAiDocRequest,
  listHrAiDocSuccess,
  listHrAiDocFailure,
  uploadHrAiDocRequest,
  uploadHrAiDocSuccess,
  uploadHrAiDocFailure,
} from "../../reducers/emp/hrAiDocReducer";

// ── API 경로: 백엔드 HrPlcyDocController의 @RequestMapping("/api/hrai/docs") ──
const HRAI_DOC_API_BASE = "/api/hrai/docs";

// ─── 문서 목록 조회 ─── GET /api/hrai/docs
//   응답: List<HrPlcyDocResponse>
export const listHrAiDocApi = () => api.get(HRAI_DOC_API_BASE);

export function* listHrAiDoc() {
  try {
    const result = yield call(listHrAiDocApi);
    yield put(listHrAiDocSuccess(result.data));
  } catch (err) {
    yield put(
      listHrAiDocFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// ─── 문서 업로드(개정) ─── POST /api/hrai/docs
//   payload: { file, title }
//   file: <Upload> beforeUpload에서 받은 File 객체
//   title: 문서 제목 (생략 시 백엔드에서 원본 파일명 사용)
//   ※ multipart/form-data로 전송 — JSON이 아님에 주의
export const uploadHrAiDocApi = ({ file, title }) => {
  const formData = new FormData();
  formData.append("file", file); // @RequestParam("file") MultipartFile
  if (title) {
    formData.append("title", title); // @RequestParam(value = "title", required = false)
  }
  return api.post(HRAI_DOC_API_BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export function* uploadHrAiDoc(action) {
  try {
    // action.payload를 API 함수에 전달 — payload 누락 실수 주의!
    const result = yield call(uploadHrAiDocApi, action.payload);
    yield put(uploadHrAiDocSuccess(result.data));
  } catch (err) {
    yield put(
      uploadHrAiDocFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// ── Watcher ──
function* watchListHrAiDoc() {
  yield takeLatest(listHrAiDocRequest.type, listHrAiDoc);
}
function* watchUploadHrAiDoc() {
  yield takeLatest(uploadHrAiDocRequest.type, uploadHrAiDoc);
}

// ── Root saga: sagas/index.js에서 fork(hrAiDocSaga)로 등록 ──
export default function* hrAiDocSaga() {
  yield all([call(watchListHrAiDoc), call(watchUploadHrAiDoc)]);
}
