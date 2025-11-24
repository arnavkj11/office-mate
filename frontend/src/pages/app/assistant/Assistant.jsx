import React, { useState } from "react";
import "./assistant.css"; // import your stylesheet

const API_BASE = "http://127.0.0.1:8000";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/agent/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      if (!res.ok) throw new Error("Network error");

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.output ?? "(no response)" },
      ]);
    } catch (err) {
      setError("Assistant not responding");
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
      <h1 className="assistant-title">OfficeMate Assistant</h1>

      <div className="chat-box">
        {messages.length === 0 && (
          <div className="empty-state">Start typing to talk to your assistant.</div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.role === "user" ? "user" : "assistant"}`}
          >
            <strong>{msg.role === "user" ? "You: " : "Assistant: "}</strong>
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <strong>Assistant: </strong>Thinking…
          </div>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="input-row">
        <textarea
          className="input-area"
          placeholder="Ask something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
