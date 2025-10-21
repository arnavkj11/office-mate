import React, { useState } from "react";

export default function Assistant() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLog((l) => [...l, { role: "user", text: input }, { role: "assistant", text: "Stub: I'll handle that soon." }]);
    setInput("");
  };
  return (
    <div className="card">
      <b>Assistant (stub)</b>
      <form onSubmit={send} style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input style={{ flex: 1 }} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me to schedule or take a note..." />
        <button className="btn">Send</button>
      </form>
      <div className="small" style={{ marginTop: 8 }}>
        {log.map((m, i) => (<div key={i}><b>{m.role}:</b> {m.text}</div>))}
      </div>
    </div>
  );
}
