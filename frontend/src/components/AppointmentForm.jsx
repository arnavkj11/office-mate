import React, { useState } from "react";
import api from "../api/client";

export default function AppointmentForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    email: "",
    start_time: "",
    end_time: "",
    location: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await api.post("/appointments", form);
      setForm({
        title: "",
        email: "",
        start_time: "",
        end_time: "",
        location: "",
        notes: "",
      });
      onCreated?.();
    } catch (e) {
      setErr(e?.response?.data?.detail || "Failed to create appointment");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card" style={{ display: "grid", gap: 10 }}>
      <b>Create appointment</b>
      <input
        placeholder="Title"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Invitee Email"
        value={form.email}
        onChange={(e) => set("email", e.target.value)}
        required
      />
      <label className="small">Start</label>
      <input
        type="datetime-local"
        value={form.start_time}
        onChange={(e) => set("start_time", e.target.value)}
        required
      />
      <label className="small">End</label>
      <input
        type="datetime-local"
        value={form.end_time}
        onChange={(e) => set("end_time", e.target.value)}
        required
      />
      <input
        placeholder="Location"
        value={form.location}
        onChange={(e) => set("location", e.target.value)}
      />
      <textarea
        placeholder="Notes"
        rows={3}
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
      />
      <button className="btn" type="submit" disabled={busy}>
        {busy ? "Saving..." : "Create"}
      </button>
      {err && <div style={{ color: "crimson", fontSize: 12 }}>{err}</div>}
    </form>
  );
}
