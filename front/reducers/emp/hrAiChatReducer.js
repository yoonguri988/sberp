// reducers/emp/hrAiChatReducer.js
// HR 규정 AI 챗봇(RAG) — POST /api/hrai/chat, GET /api/hrai/chat/history
// 급여 파트의 salAiChatReducer.js(급여 챗봇)와 동일한 구조임
// 대화가 "계속 쌓이는" 구조라 messages를 배열에 push하는 방식
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ── 위젯 대화창에 쌓이는 질문/답변 목록 (오래된 것 → 최신 순) ──
  // 항목 모양: { question, answer, grounded, references, logId, pending, error }
  messages: [],
  chatLoading: false, // 질문 전송 중 여부 — true이면 입력/전송 비활성화
  chatError: null, // 마지막 에러 메시지 (알림용)

  // ── 본인 대화 이력 (history 패널/페이지에서 사용) ──
  history: [],
  historyPaging: null, // { totalElements, totalPages, number, size }
  historyLoading: false,
  historyError: null,
};

const hrAiChatReducer = createSlice({
  name: "hrAiChat", // state.hrAiChat 으로 접근
  initialState,
  reducers: {
    // 에러 상태 초기화 — 위젯을 열 때나 재시도 전에 사용
    resetHrAiChatError: (state) => {
      state.chatError = null;
      state.historyError = null;
    },

    // 위젯 대화창 비우기 — "대화 지우기" 버튼용
    clearHrAiChatMessages: (state) => {
      state.messages = [];
    },

    // ─── 질문 전송 ───
    // 요청 시점에 질문을 먼저 messages에 낙관적으로(optimistic) 추가
    // 답변이 오기 전에도 "내가 방금 뭘 물어봤는지"가 바로 화면에 보이게 함
    sendHrAiChatRequest: (state, action) => {
      state.chatLoading = true;
      state.chatError = null;
      state.messages.push({
        question: action.payload.question, // 사용자가 입력한 질문
        answer: null,   // 아직 답변 없음
        grounded: null, // 근거 유무 미정
        references: [], // 근거 조항 목록 비어있음
        logId: null,    // 서버에서 부여할 이력 PK
        pending: true,  // 로딩 스피너 표시용
        error: false,   // 에러 여부
      });
    },
    // 답변 수신 성공 — messages 배열의 마지막(pending) 항목을 갱신
    sendHrAiChatSuccess: (state, action) => {
      state.chatLoading = false;
      const last = state.messages[state.messages.length - 1];
      if (last && last.pending) {
        last.answer = action.payload.answer; // AI 답변 텍스트
        last.grounded = action.payload.grounded; // 근거 조항 기반 여부
        last.references = action.payload.references || []; // 근거 조항 목록
        last.logId = action.payload.logId; // 저장된 이력 PK
        last.pending = false; // 로딩 완료
      }
    },
    // 답변 수신 실패 — 마지막 항목에 에러 표시
    sendHrAiChatFailure: (state, action) => {
      state.chatLoading = false;
      state.chatError = action.payload; // 에러 메시지 저장
      const last = state.messages[state.messages.length - 1];
      if (last && last.pending) {
        last.pending = false;
        last.error = true; // 위젯에서 에러 문구 표시
      }
    },

    // ─── 본인 대화 이력 조회 ───
    listHrAiChatHistoryRequest: (state) => {
      state.historyLoading = true;
      state.historyError = null;
    },
    listHrAiChatHistorySuccess: (state, action) => {
      state.historyLoading = false;
      // 백엔드 Page<HrAiChatHistoryResponse> 구조 → content 배열 + 페이징 메타
      state.history = action.payload.content || [];
      state.historyPaging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    listHrAiChatHistoryFailure: (state, action) => {
      state.historyLoading = false;
      state.historyError = action.payload;
    },
  },
});

export const {
  resetHrAiChatError, clearHrAiChatMessages,
  sendHrAiChatRequest, sendHrAiChatSuccess, sendHrAiChatFailure,
  listHrAiChatHistoryRequest, listHrAiChatHistorySuccess, listHrAiChatHistoryFailure,
} = hrAiChatReducer.actions;

export default hrAiChatReducer.reducer;
