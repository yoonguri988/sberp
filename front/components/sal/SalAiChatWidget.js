// components/sal/SalAiChatWidget.js
// AI 급여 Q&A 플로팅 챗봇 위젯.
// 별도 페이지가 아니라 컴포넌트 하나로 만들어서, AppLayout.js가 /sal/** 경로일 때만 렌더링한다.
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
  sendSalAiChatRequest,
  clearSalAiChatMessages,
} from "../../reducers/sal/salAiChatReducer";

const { Panel } = Collapse;

function SalAiChatWidget() {
  const dispatch = useDispatch();
  const { t } = useTranslation("sal");
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const bodyRef = useRef(null);

  const { messages, chatLoading } = useSelector((state) => state.salAiChat);

  // 새 메시지가 쌓이면(질문 직후 / 답변 도착 시) 대화창을 항상 맨 아래로 스크롤
  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = () => {
    const trimmed = question.trim();
    if (!trimmed || chatLoading) return;
    dispatch(sendSalAiChatRequest({ question: trimmed }));
    setQuestion("");
  };

  const handleKeyDown = (e) => {
    // Shift+Enter는 줄바꿈, Enter만 누르면 전송
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <Button
        className="sb-ai-chat-fab"
        type="primary"
        shape="circle"
        size="large"
        icon={open ? <CloseOutlined /> : <MessageOutlined />}
        onClick={() => setOpen((o) => !o)}
        title={t("salAiChat.fabTitle")}
      />

      {open && (
        <div className="sb-ai-chat-panel">
          <div className="sb-ai-chat-panel__head">
            <div>
              <div className="sb-ai-chat-panel__title">
                {t("salAiChat.panelTitle")}
              </div>
              <div className="sb-ai-chat-panel__sub">
                {t("salAiChat.panelSubtitle")}
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                type="text"
                size="small"
                onClick={() => dispatch(clearSalAiChatMessages())}
              >
                {t("salAiChat.clearBtn")}
              </Button>
            )}
          </div>

          <div className="sb-ai-chat-panel__body" ref={bodyRef}>
            {messages.length === 0 && (
              <Empty
                description={
                  <span>
                    {t("salAiChat.emptyExampleLine1")}
                    <br />
                    {t("salAiChat.emptyExampleLine2")}
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}

            {messages.map((m, idx) => (
              <div key={idx} className="sb-ai-chat-msg">
                <div className="sb-ai-chat-bubble sb-ai-chat-bubble--me">
                  {m.question}
                </div>

                <div className="sb-ai-chat-bubble sb-ai-chat-bubble--bot">
                  {m.pending && <Spin size="small" />}

                  {!m.pending && m.error && (
                    <span className="sb-ai-chat-error">
                      {t("salAiChat.errorMsg")}
                    </span>
                  )}

                  {!m.pending && !m.error && (
                    <>
                      <div>{m.answer}</div>
                      {!m.grounded && (
                        <Tag color="orange" style={{ marginTop: 6 }}>
                          {t("salAiChat.notGroundedTag")}
                        </Tag>
                      )}
                      {m.references && m.references.length > 0 && (
                        <Collapse ghost size="small" style={{ marginTop: 6 }}>
                          <Panel header={t("salAiChat.referencesPanelHeader")} key="refs">
                            {m.references.map((r) => (
                              <div key={r.chunkId} className="sb-ai-chat-ref">
                                <b>{r.article || t("salAiChat.articleUnknown")}</b>
                                {r.page ? ` · p.${r.page}` : ""}
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

          <div className="sb-ai-chat-panel__input">
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder={t("salAiChat.inputPlaceholder")}
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

export default SalAiChatWidget;
