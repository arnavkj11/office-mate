import React, { useState } from "react";

export default function Notes() {
  const [notes, setNotes] = useState("");
  return (
    <div className="card">
      <b>Notes</b>
      <textarea
        rows={12}
        style={{ width: "100%", marginTop: 8 }}
        placeholder="Meeting notes, action items..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="small">Saving to backend coming soon.</div>
    </div>
  );
}
