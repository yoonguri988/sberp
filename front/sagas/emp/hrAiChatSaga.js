// sagas/emp/hrAiChatSaga.js
// HR 규정 AI 챗봇(RAG) — 비동기 API 호출을 Redux-Saga로 처리
// salAiChatSaga.js(급여 챗봇)와 동일한 구조, API 경로만 /api/hrai로 변경
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios"; // 프로젝트 공통 axios 인스턴스 (JWT 인터셉터 포함)
import {
  sendHrAiChatRequest,
  sendHrAiChatSuccess,
  sendHrAiChatFailure,
  listHrAiChatHistoryRequest,
  listHrAiChatHistorySuccess,
  listHrAiChatHistoryFailure,
} from "../../reducers/emp/hrAiChatReducer";

// ── API 경로: 백엔드 HrAiChatController의 @RequestMapping("/api/hrai") ──
const HRAI_API_BASE = "/api/hrai";

// ─── 질문 전송 ─── POST /api/hrai/chat
//   payload: { question: "연차 몇 개 남았나요?" }
//   응답: { logId, answer, grounded, references[] }
export const sendHrAiChatApi = ({ question }) =>
  api.post(`${HRAI_API_BASE}/chat`, { question });

export function* sendHrAiChat(action) {
  try {
    // action.payload를 API 함수에 전달 — payload 누락 실수 주의!
    const result = yield call(sendHrAiChatApi, action.payload);
    yield put(sendHrAiChatSuccess(result.data));
  } catch (err) {
    // GlobalExceptionHandler: { error: "..." } 또는 @Valid: { message: "..." }
    yield put(
      sendHrAiChatFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// ─── 본인 대화 이력 조회 ─── GET /api/hrai/chat/history?page=0&size=10
//   응답: Spring Page<HrAiChatHistoryResponse>
export const listHrAiChatHistoryApi = ({ page = 0, size = 10 } = {}) =>
  api.get(`${HRAI_API_BASE}/chat/history`, { params: { page, size } });

export function* listHrAiChatHistory(action) {
  try {
    const result = yield call(listHrAiChatHistoryApi, action.payload);
    yield put(listHrAiChatHistorySuccess(result.data));
  } catch (err) {
    yield put(
      listHrAiChatHistoryFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// ── Watcher: 액션 타입을 감시해서 대응하는 worker saga를 실행 ──
function* watchSendHrAiChat() {
  // takeLatest: 같은 질문을 빠르게 여러 번 보내도 마지막 것만 처리
  yield takeLatest(sendHrAiChatRequest.type, sendHrAiChat);
}
function* watchListHrAiChatHistory() {
  yield takeLatest(listHrAiChatHistoryRequest.type, listHrAiChatHistory);
}

// ── Root saga: sagas/index.js에서 fork(hrAiChatSaga)로 등록 ──
export default function* hrAiChatSaga() {
  yield all([call(watchSendHrAiChat), call(watchListHrAiChatHistory)]);
}
