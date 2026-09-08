// reducers/sal/salAiChatReducer.js
// AI 급여 Q&A 챗봇(RAG) - POST /api/salai/chat, GET /api/salai/chat/history
//
// 다른 sal 리듀서(salStd 등)와 다른 점: 목록을 통째로 갈아끼우는 게 아니라
// 대화가 "계속 쌓이는" 구조라서 messages를 배열에 push하는 방식으로 관리한다.
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // 위젯 대화창에 쌓이는 질문/답변 목록(오래된 것 -> 최신 순)
  // 항목 모양: { question, answer, grounded, references, logId, pending, error }
  messages: [],
  chatLoading: false,
  chatError: null,

  // 본인 대화 이력(history 패널/페이지에서 사용)
  history: [],
  historyPaging: null, // { totalElements, totalPages, number, size }
  historyLoading: false,
  historyError: null,
};

const salAiChatReducer = createSlice({
  name: "salAiChat",
  initialState,
  reducers: {
    resetSalAiChatError: (state) => {
      state.chatError = null;
      state.historyError = null;
    },

    // --- 위젯을 새로 열거나 닫을 때 대화창 비우기(선택 사용) ---
    clearSalAiChatMessages: (state) => {
      state.messages = [];
    },

    // --- 질문 전송 ---
    // 요청 시점에 질문을 먼저 messages에 낙관적으로(optimistic) 추가해서,
    // 답변이 오기 전에도 "내가 방금 뭘 물어봤는지"가 바로 화면에 보이게 한다.
    sendSalAiChatRequest: (state, action) => {
      state.chatLoading = true;
      state.chatError = null;
      state.messages.push({
        question: action.payload.question,
        answer: null,
        grounded: null,
        references: [],
        logId: null,
        pending: true,
        error: false,
      });
    },
    sendSalAiChatSuccess: (state, action) => {
      state.chatLoading = false;
      const last = state.messages[state.messages.length - 1];
      if (last && last.pending) {
        last.answer = action.payload.answer;
        last.grounded = action.payload.grounded;
        last.references = action.payload.references || [];
        last.logId = action.payload.logId;
        last.pending = false;
      }
    },
    sendSalAiChatFailure: (state, action) => {
      state.chatLoading = false;
      state.chatError = action.payload;
      const last = state.messages[state.messages.length - 1];
      if (last && last.pending) {
        last.pending = false;
        last.error = true;
      }
    },

    // --- 본인 대화 이력 조회 ---
    listSalAiChatHistoryRequest: (state) => {
      state.historyLoading = true;
      state.historyError = null;
    },
    listSalAiChatHistorySuccess: (state, action) => {
      state.historyLoading = false;
      state.history = action.payload.content || [];
      state.historyPaging = {
        totalElements: action.payload.totalElements || 0,
        totalPages: action.payload.totalPages || 0,
        number: action.payload.number || 0,
        size: action.payload.size || 10,
      };
    },
    listSalAiChatHistoryFailure: (state, action) => {
      state.historyLoading = false;
      state.historyError = action.payload;
    },
  },
});

export const {
  resetSalAiChatError,
  clearSalAiChatMessages,
  sendSalAiChatRequest,
  sendSalAiChatSuccess,
  sendSalAiChatFailure,
  listSalAiChatHistoryRequest,
  listSalAiChatHistorySuccess,
  listSalAiChatHistoryFailure,
} = salAiChatReducer.actions;

export default salAiChatReducer.reducer;
