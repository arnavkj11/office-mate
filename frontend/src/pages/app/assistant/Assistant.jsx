import React, { useState } from "react";
import "./assistant.css";
import { api } from "../../../api/client";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await api.assistantChat({
        message: userText,
        history: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.output ?? "(no response)",
        },
      ]);
    } catch (err) {
      console.error("Assistant error:", err);
      setError("Assistant not responding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="assistant-container">
      <header className="assistant-header">
        <div>
          <h1 className="assistant-title">OfficeMate Assistant</h1>
          <p className="assistant-subtitle">
            Ask in plain language to schedule, summarize, and automate work.
          </p>
        </div>
        <div className="assistant-status">
          <span
            className={
              "assistant-status-dot " +
              (loading ? "assistant-busy" : "assistant-idle")
            }
          />
          <span className="assistant-status-text">
            {loading ? "Thinking" : "Ready"}
          </span>
        </div>
      </header>

      <section className="assistant-panel">
        <div className="assistant-chat">
          {messages.length === 0 && !loading && (
            <div className="assistant-empty">
              <h3>Start a conversation</h3>
              <p>
                Try prompts like{" "}
                <span className="assistant-chip">
                  "Create a follow-up email for my 3 PM client"
                </span>{" "}
                or{" "}
                <span className="assistant-chip">
                  "Summarize this week's appointments"
                </span>
                .
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                "assistant-message-row " +
                (msg.role === "user"
                  ? "assistant-user"
                  : "assistant-assistant")
              }
            >
              {msg.role === "assistant" && (
                <div className="assistant-avatar">OM</div>
              )}
              <div className="assistant-bubble">
                <div className="assistant-bubble-label">
                  {msg.role === "user" ? "You" : "Assistant"}
                </div>
                <div className="assistant-bubble-text">{msg.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="assistant-message-row assistant-assistant">
              <div className="assistant-avatar">OM</div>
              <div className="assistant-bubble">
                <div className="assistant-bubble-label">Assistant</div>
                <div className="assistant-bubble-text">Thinking…</div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="assistant-error">{error}</div>}

        <form
          className="assistant-input-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <textarea
            className="assistant-input"
            placeholder="Ask something about your day, clients, or notes…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="submit"
            className="assistant-send"
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </form>

        <p className="assistant-hint">
          Press Enter to send, Shift + Enter for a new line.
        </p>
      </section>
    </div>
  );
}
