import React, { useEffect, useMemo, useState } from "react";
import WeeklyWorkingHours from "../../../components/working/WeeklyWorkingHours";
import DateOverrides from "../../../components/working/DateOverrides";
import { api } from "../../../api/client";
import "../../../components/working/working.css";

function buildTimeOptions() {
  const options = [];
  for (let h = 5; h <= 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
  }
  return options;
}

const DEFAULT_WEEK = [
  { day: "Sunday", enabled: false, start: "09:00", end: "17:00" },
  { day: "Monday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Tuesday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Wednesday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Thursday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Friday", enabled: true, start: "09:00", end: "17:00" },
  { day: "Saturday", enabled: false, start: "09:00", end: "17:00" },
];

function normalizeWH(raw) {
  if (!raw || typeof raw !== "object") {
    return { timezone: "America/Los_Angeles", weekly: DEFAULT_WEEK, overrides: [] };
  }

  const weekly = Array.isArray(raw.weekly) && raw.weekly.length === 7 ? raw.weekly : DEFAULT_WEEK;
  const overrides = Array.isArray(raw.overrides) ? raw.overrides : [];

  return {
    timezone: raw.timezone || "America/Los_Angeles",
    weekly,
    overrides,
  };
}

export default function Working() {
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  const [week, setWeek] = useState(DEFAULT_WEEK);
  const [overrides, setOverrides] = useState([]);
  const [timezone, setTimezone] = useState("America/Los_Angeles");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await api.get("/working-hours/me");
        if (!alive) return;

        const wh = normalizeWH(data);
        setTimezone(wh.timezone);
        setWeek(wh.weekly);
        setOverrides(
          wh.overrides.map((x) => ({
            ...x,
            date: typeof x.date === "string" ? x.date : String(x.date),
          }))
        );
        setDirty(false);
        setErr("");
      } catch (e) {
        if (!alive) return;

        const wh = normalizeWH(null);
        setTimezone(wh.timezone);
        setWeek(wh.weekly);
        setOverrides(wh.overrides);
        setErr(e?.message || "Failed to load working hours");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!loading) setDirty(true);
  }, [week, overrides, timezone]);

  async function handleSave() {
    setSaving(true);
    setMsg("");
    setErr("");

    try {
      const payload = {
        timezone,
        weekly: week,
        overrides: overrides.map((x) => ({
          ...x,
          date: x.date,
        })),
      };

      await api.put("/working-hours/me", payload);
      setDirty(false);
      setMsg("Saved.");
    } catch (e) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="wh-page">
      <div className="wh-header">
        <div>
          <h1 className="wh-title">Working Hours</h1>
          <p className="wh-subtitle">
            Weekly schedule applies by default. Use Specific Dates to override a single day.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {dirty ? <span style={{ color: "#b45309", fontSize: 13 }}>Unsaved changes</span> : null}
          <button className="wh-btn" type="button" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {loading ? <div style={{ padding: 12 }}>Loading...</div> : null}
      {msg ? <div style={{ padding: 12, color: "#065f46" }}>{msg}</div> : null}
      {err ? <div style={{ padding: 12, color: "#b91c1c" }}>{err}</div> : null}

      <div className="wh-grid">
        <section className="wh-card">
          <div className="wh-card-head">
            <h2 className="wh-card-title">Weekly Schedule</h2>
            <div className="wh-card-note">Applies unless overridden</div>
          </div>

          <WeeklyWorkingHours value={week} onChange={setWeek} timeOptions={timeOptions} />
        </section>

        <section className="wh-card">
          <div className="wh-card-head">
            <h2 className="wh-card-title">Specific Dates</h2>
            <div className="wh-card-note">Overrides the weekly schedule for a date</div>
          </div>

          <DateOverrides value={overrides} onChange={setOverrides} timeOptions={timeOptions} />
        </section>
      </div>
    </div>
  );
}
