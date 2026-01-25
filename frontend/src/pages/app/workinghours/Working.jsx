import React, { useEffect, useMemo, useRef, useState } from "react";
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

function stableStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (value && typeof value === "object") {
      if (seen.has(value)) return;
      seen.add(value);
    }
    return value;
  });
}

const TIMEZONES = [
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function Working() {
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  const [week, setWeek] = useState(DEFAULT_WEEK);
  const [overrides, setOverrides] = useState([]);
  const [timezone, setTimezone] = useState("America/Los_Angeles");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const savedSnapshotRef = useRef("");
  const [dirty, setDirty] = useState(false);

  function makeSnapshot(next = { timezone, week, overrides }) {
    return stableStringify({
      timezone: next.timezone,
      weekly: next.week,
      overrides: next.overrides,
    });
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await api.get("/working-hours/me");
        if (!alive) return;

        const wh = normalizeWH(data);
        const normalizedOverrides = wh.overrides.map((x) => ({
          ...x,
          date: typeof x.date === "string" ? x.date : String(x.date),
        }));

        setTimezone(wh.timezone);
        setWeek(wh.weekly);
        setOverrides(normalizedOverrides);

        savedSnapshotRef.current = makeSnapshot({
          timezone: wh.timezone,
          week: wh.weekly,
          overrides: normalizedOverrides,
        });

        setDirty(false);
        setErr("");
      } catch (e) {
        if (!alive) return;

        const wh = normalizeWH(null);
        setTimezone(wh.timezone);
        setWeek(wh.weekly);
        setOverrides(wh.overrides);

        savedSnapshotRef.current = makeSnapshot({
          timezone: wh.timezone,
          week: wh.weekly,
          overrides: wh.overrides,
        });

        setDirty(false);
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
    if (loading) return;
    setDirty(makeSnapshot() !== savedSnapshotRef.current);
  }, [week, overrides, timezone, loading]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  useEffect(() => {
    function onBeforeUnload(e) {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function handleDiscard() {
    try {
      const snap = JSON.parse(savedSnapshotRef.current || "{}");
      setTimezone(snap.timezone || "America/Los_Angeles");
      setWeek(snap.weekly || DEFAULT_WEEK);
      setOverrides(snap.overrides || []);
      setMsg("");
      setErr("");
      setDirty(false);
    } catch {
      const wh = normalizeWH(null);
      setTimezone(wh.timezone);
      setWeek(wh.weekly);
      setOverrides(wh.overrides);
      setMsg("");
      setErr("");
      setDirty(false);
    }
  }

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

      savedSnapshotRef.current = makeSnapshot({ timezone, week, overrides });
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
      <div className="wh-header wh-header-sticky">
        <div className="wh-header-left">
          <h1 className="wh-title">Working Hours</h1>
          <p className="wh-subtitle">
            Weekly schedule applies by default. Use Specific Dates to override a single day.
          </p>

          <div className="wh-toolbar">
            <label className="wh-field">
              <span className="wh-label">Timezone</span>
              <select
                className="wh-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={loading || saving}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="wh-header-actions" role="group" aria-label="Save controls">
          {dirty ? <span className="wh-badge-warn">Unsaved changes</span> : <span className="wh-badge-ok">All changes saved</span>}

          <button
            className="wh-btn wh-btn-secondary"
            type="button"
            onClick={handleDiscard}
            disabled={saving || loading || !dirty}
          >
            Discard
          </button>

          <button
            className="wh-btn"
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !dirty}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="wh-skeleton">
          <div className="wh-skeleton-line" />
          <div className="wh-skeleton-line" />
          <div className="wh-skeleton-line" />
        </div>
      ) : null}

      {!loading && (msg || err) ? (
        <div
          className={`wh-alert ${err ? "wh-alert-error" : "wh-alert-success"}`}
          role="status"
          aria-live="polite"
        >
          {err || msg}
        </div>
      ) : null}

      <div className="wh-grid">
        <section className="wh-card" aria-labelledby="weekly-title">
          <div className="wh-card-head">
            <div>
              <h2 className="wh-card-title" id="weekly-title">Weekly Schedule</h2>
              <div className="wh-card-note">Applies unless overridden</div>
            </div>
          </div>

          <WeeklyWorkingHours value={week} onChange={setWeek} timeOptions={timeOptions} />
        </section>

        <section className="wh-card" aria-labelledby="overrides-title">
          <div className="wh-card-head">
            <div>
              <h2 className="wh-card-title" id="overrides-title">Specific Dates</h2>
              <div className="wh-card-note">Overrides the weekly schedule for a date</div>
            </div>
          </div>

          <DateOverrides value={overrides} onChange={setOverrides} timeOptions={timeOptions} />
        </section>
      </div>
    </div>
  );
}
