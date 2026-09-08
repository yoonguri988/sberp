// sagas/sal/salAiChatSaga.js
import { all, call, put, takeLatest } from "redux-saga/effects";
import api from "../../api/axios";
import {
  sendSalAiChatRequest,
  sendSalAiChatSuccess,
  sendSalAiChatFailure,
  listSalAiChatHistoryRequest,
  listSalAiChatHistorySuccess,
  listSalAiChatHistoryFailure,
} from "../../reducers/sal/salAiChatReducer";

const SALAI_API_BASE = "/api/salai";

// sendSalAiChat  - POST /api/salai/chat 급여 규정 AI 질의응답
//   payload: { question }
export const sendSalAiChatApi = ({ question }) =>
  api.post(`${SALAI_API_BASE}/chat`, { question });

export function* sendSalAiChat(action) {
  try {
    const result = yield call(sendSalAiChatApi, action.payload);
    yield put(sendSalAiChatSuccess(result.data));
  } catch (err) {
    // 백엔드 GlobalExceptionHandler는 보통 { error: "..." }로 내려주지만,
    // 검증 에러(@Valid)는 필드별 메시지 맵으로 내려와 data.message가 쓰이는 경우도 있어 둘 다 확인한다.
    yield put(
      sendSalAiChatFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

// listSalAiChatHistory  - GET /api/salai/chat/history 본인 대화 이력 조회
//   params: { page(0-based), size }
export const listSalAiChatHistoryApi = ({ page = 0, size = 10 } = {}) =>
  api.get(`${SALAI_API_BASE}/chat/history`, { params: { page, size } });

export function* listSalAiChatHistory(action) {
  try {
    const result = yield call(listSalAiChatHistoryApi, action.payload);
    yield put(listSalAiChatHistorySuccess(result.data));
  } catch (err) {
    yield put(
      listSalAiChatHistoryFailure(
        err.response?.data?.error || err.response?.data?.message || err.message,
      ),
    );
  }
}

function* watchSendSalAiChat() {
  yield takeLatest(sendSalAiChatRequest.type, sendSalAiChat);
}
function* watchListSalAiChatHistory() {
  yield takeLatest(listSalAiChatHistoryRequest.type, listSalAiChatHistory);
}

export default function* salAiChatSaga() {
  yield all([call(watchSendSalAiChat), call(watchListSalAiChatHistory)]);
}
