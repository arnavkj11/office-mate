import React, { useMemo, useState } from "react";
import TimeSelect from "./TimeSelect";

function toMinutes(t) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}
function isValidRange(start, end) {
  return toMinutes(end) > toMinutes(start);
}

function sortByDateAsc(a, b) {
  return (a.date || "").localeCompare(b.date || "");
}

export default function DateOverrides({ value, onChange, timeOptions }) {
  const items = useMemo(() => (value ?? []).slice().sort(sortByDateAsc), [value]);
  const [newDate, setNewDate] = useState("");

  function addOverride() {
    if (!newDate) return;

    const exists = items.some((x) => x.date === newDate);
    if (exists) return;

    const next = [
      ...items,
      { date: newDate, enabled: true, start: "09:00", end: "17:00" },
    ].sort(sortByDateAsc);

    onChange(next);
    setNewDate("");
  }

  function updateItem(date, patch) {
    const next = items.map((x) => (x.date === date ? { ...x, ...patch } : x));
    onChange(next);
  }

  function removeItem(date) {
    const next = items.filter((x) => x.date !== date);
    onChange(next);
  }

  return (
    <div className="wh-overrides">
      <div className="wh-addrow">
        <label className="wh-field">
          <span className="wh-label">Date</span>
          <input
            className="wh-input"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </label>

        <button className="wh-btn" type="button" onClick={addOverride} disabled={!newDate}>
          Add
        </button>

        <div className="wh-hint">
          Use this for holidays, exceptions, and special shifts.
        </div>
      </div>

      {items.length === 0 ? (
        <div className="wh-empty">
          No specific dates yet. Add one above to override the weekly schedule.
        </div>
      ) : (
        <div className="wh-override-list">
          <div className="wh-override-head">
            <div>Date</div>
            <div>Status</div>
            <div>Start</div>
            <div>End</div>
            <div></div>
          </div>

          {items.map((x) => {
            const invalid = x.enabled && !isValidRange(x.start, x.end);

            return (
              <div className="wh-override-row" key={x.date}>
                <div className="wh-date">{x.date}</div>

                <div className="wh-status">
                  <label className="wh-switch">
                    <input
                      type="checkbox"
                      checked={x.enabled}
                      onChange={(e) => updateItem(x.date, { enabled: e.target.checked })}
                    />
                    <span className="wh-switch-ui" />
                  </label>
                  <span className="wh-status-text">{x.enabled ? "On" : "Off"}</span>
                </div>

                <TimeSelect
                  label=""
                  value={x.start}
                  options={timeOptions}
                  disabled={!x.enabled}
                  onChange={(v) => updateItem(x.date, { start: v })}
                />

                <TimeSelect
                  label=""
                  value={x.end}
                  options={timeOptions}
                  disabled={!x.enabled}
                  minTime={x.start}
                  onChange={(v) => updateItem(x.date, { end: v })}
                />

                <div className="wh-actions">
                  {invalid ? <span className="wh-error">End must be after start</span> : null}
                  <button
                    className="wh-btn wh-btn-ghost"
                    type="button"
                    onClick={() => removeItem(x.date)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
