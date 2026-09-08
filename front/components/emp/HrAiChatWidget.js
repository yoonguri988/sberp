// components/emp/HrAiChatWidget.js
// HR 규정 AI 플로팅 챗봇 위젯.
// 별도 페이지가 아니라 컴포넌트 하나로 만들어서, AppLayout.js가 /emp/** 경로일 때만 렌더링
// SalAiChatWidget.js(급여 챗봇)와 동일한 구조, 리듀서/텍스트만 HR용으로 변경.
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button, Input, Spin, Collapse, Tag, Empty } from "antd";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  sendHrAiChatRequest,
  clearHrAiChatMessages,
} from "../../reducers/emp/hrAiChatReducer";

const { Panel } = Collapse;

function HrAiChatWidget() {
  const dispatch = useDispatch();
  const { t } = useTranslation("emp");
  const [open, setOpen] = useState(false); // 챗봇 패널 열림/닫힘
  const [question, setQuestion] = useState(""); // 입력 필드 값
  const bodyRef = useRef(null); // 대화 영역 스크롤 제어용

  // ── Redux 스토어에서 HR AI 챗봇 상태 구독 ──
  // state.hrAiChat — hrAiChatReducer에서 관리
  const { messages, chatLoading } = useSelector((state) => state.hrAiChat);

  // ── 새 메시지가 쌓이면 대화창을 맨 아래로 자동 스크롤 ──
  // messages 배열이 바뀌거나(질문 추가/답변 도착) 패널이 열릴 때 실행
  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  // ── 질문 전송 핸들러 ──
  const handleSend = () => {
    const trimmed = question.trim();
    if (!trimmed || chatLoading) return; // 빈 입력이거나 로딩 중이면 무시
    dispatch(sendHrAiChatRequest({ question: trimmed }));
    setQuestion(""); // 전송 후 입력 필드 초기화
  };

  // ── 키보드 이벤트: Enter로 전송, Shift+Enter로 줄바꿈 ──
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 기본 줄바꿈 방지
      handleSend();
    }
  };

  return (
    <>
      {/* ── FAB(Floating Action Button): 챗봇 열기/닫기 토글 ── */}
      <Button
        className="sb-ai-chat-fab"
        type="primary"
        shape="circle"
        size="large"
        icon={open ? <CloseOutlined /> : <MessageOutlined />}
        onClick={() => setOpen((o) => !o)}
        title={t("hrAiChat.fabTitle")}
      />

      {/* ── 챗봇 패널: open=true일 때만 렌더링 ── */}
      {open && (
        <div className="sb-ai-chat-panel">
          {/* ── 헤더: 제목 + 대화 지우기 버튼 ── */}
          <div className="sb-ai-chat-panel__head">
            <div>
              <div className="sb-ai-chat-panel__title">
                {t("hrAiChat.panelTitle")}
              </div>
              <div className="sb-ai-chat-panel__sub">
                {t("hrAiChat.panelSubtitle")}
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                type="text"
                size="small"
                onClick={() => dispatch(clearHrAiChatMessages())}
              >
                {t("hrAiChat.clearBtn")}
              </Button>
            )}
          </div>

          {/* ── 대화 본문 영역 ── */}
          <div className="sb-ai-chat-panel__body" ref={bodyRef}>
            {/* 대화가 없을 때 안내 문구 */}
            {messages.length === 0 && (
              <Empty
                description={
                  <span>
                    {t("hrAiChat.emptyExampleLine1")}
                    <br />
                    {t("hrAiChat.emptyExampleLine2")}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}

            {/* ── 대화 메시지 목록 ── */}
            {messages.map((m, idx) => (
              <div key={idx} className="sb-ai-chat-msg">
                {/* 사용자 질문 말풍선 (오른쪽 정렬, 파란 배경) */}
                <div className="sb-ai-chat-bubble sb-ai-chat-bubble--me">
                  {m.question}
                </div>

                {/* AI 답변 말풍선 (왼쪽 정렬, 회색 배경) */}
                <div className="sb-ai-chat-bubble sb-ai-chat-bubble--bot">
                  {/* 로딩 중이면 스피너 표시 */}
                  {m.pending && <Spin size="small" />}

                  {/* 에러 발생 시 에러 문구 */}
                  {!m.pending && m.error && (
                    <span className="sb-ai-chat-error">
                      {t("hrAiChat.errorMsg")}
                    </span>
                  )}

                  {/* 정상 답변 */}
                  {!m.pending && !m.error && (
                    <>
                      <div>{m.answer}</div>
                      {/* grounded=false이면 근거 없음 태그 표시 */}
                      {!m.grounded && (
                        <Tag color="orange" style={{ marginTop: 6 }}>
                          {t("hrAiChat.notGroundedTag")}
                        </Tag>
                      )}
                      {/* 근거 조항이 있으면 접을 수 있는 패널로 표시 */}
                      {m.references && m.references.length > 0 && (
                        <Collapse ghost size="small" style={{ marginTop: 6 }}>
                          <Panel header={t("hrAiChat.referencesPanelHeader")} key="refs">
                            {m.references.map((r) => (
                              <div key={r.chunkId} className="sb-ai-chat-ref">
                                {/* 조항명: "제6조(연차)" + 페이지 번호 */}
                                <b>{r.article || t("hrAiChat.articleUnknown")}</b>
                                {r.page ? ` · p.${r.page}` : ""}
                                {/* 청크 원문 미리보기 (120자) */}
                                <div className="sb-ai-chat-ref__snippet">
                                  {r.snippet}
                                </div>
                              </div>
                            ))}
                          </Panel>
                        </Collapse>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ── 입력 영역: TextArea + 전송 버튼 ── */}
          <div className="sb-ai-chat-panel__input">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder={t("hrAiChat.inputPlaceholder")}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={chatLoading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={chatLoading}
              disabled={!question.trim()}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default HrAiChatWidget;