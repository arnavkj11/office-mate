import React, { useState } from "react";
import { api } from "../api/client"; // match your other imports

export default function AppointmentForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    inviteeEmail: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const update = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");

    try {
      // shape this to match your FastAPI / DynamoDB model
      await api.post("/appointments", {
        title: form.title.trim(),
        email: form.inviteeEmail.trim(),
        start_time: form.startTime,
        end_time: form.endTime,
        location: form.location.trim(),
        notes: form.notes.trim(),
      });

      setForm({
        title: "",
        inviteeEmail: "",
        startTime: "",
        endTime: "",
        location: "",
        notes: "",
      });

      if (onCreated) onCreated();
    } catch (e2) {
      const msg =
        e2?.response?.data?.detail ||
        e2?.message ||
        "Failed to create appointment";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="appts-form card" onSubmit={submit}>
      <div className="appts-form-header">
        <div>
          <h2 className="appts-form-title">New appointment</h2>
          <p className="appts-form-sub">
            Set a title, guests and time. We will handle the rest.
          </p>
        </div>
      </div>

      {err && <div className="appts-form-banner">{err}</div>}

      <div className="appts-form-grid">
        <div className="appts-form-field">
          <label className="appts-form-label">Title</label>
          <input
            className="inp"
            placeholder="Intro call with client"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </div>

        <div className="appts-form-field">
          <label className="appts-form-label">Invitee email</label>
          <input
            className="inp"
            type="email"
            placeholder="client@example.com"
            value={form.inviteeEmail}
            onChange={(e) => update("inviteeEmail", e.target.value)}
            required
          />
        </div>

        <div className="appts-form-field">
          <label className="appts-form-label">Start time</label>
          <input
            className="inp"
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => update("startTime", e.target.value)}
            required
          />
        </div>

        <div className="appts-form-field">
          <label className="appts-form-label">End time</label>
          <input
            className="inp"
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => update("endTime", e.target.value)}
            required
          />
        </div>

        <div className="appts-form-field">
          <label className="appts-form-label">Location</label>
          <input
            className="inp"
            placeholder="Zoom, office, phone"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>

        <div className="appts-form-field appts-form-notes">
          <label className="appts-form-label">Notes</label>
          <textarea
            className="appts-textarea"
            rows={3}
            placeholder="Context, agenda or prep notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="appts-form-footer">
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Saving..." : "Create appointment"}
        </button>
        <span className="appts-form-hint">
          Email, SMS, Slack and logs will be wired to this event.
        </span>
      </div>
    </form>
  );
}
