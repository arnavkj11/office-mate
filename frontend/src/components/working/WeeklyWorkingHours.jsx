import React, { useMemo } from "react";
import TimeSelect from "./TimeSelect";

function toMinutes(t) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

function isValidRange(start, end) {
  return toMinutes(end) > toMinutes(start);
}

export default function WeeklyWorkingHours({ value, onChange, timeOptions }) {
  const rows = useMemo(() => value ?? [], [value]);

  function updateRow(idx, patch) {
    const next = rows.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    onChange(next);
  }

  return (
    <div className="wh-table">
      <div className="wh-table-head">
        <div>Day</div>
        <div>Status</div>
        <div>Start</div>
        <div>End</div>
        <div></div>
      </div>

      {rows.map((r, idx) => {
        const invalid = r.enabled && !isValidRange(r.start, r.end);

        return (
          <div className="wh-row" key={r.day}>
            <div className="wh-day">{r.day}</div>

            <div className="wh-status">
              <label className="wh-switch">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) => updateRow(idx, { enabled: e.target.checked })}
                />
                <span className="wh-switch-ui" />
              </label>
              <span className="wh-status-text">{r.enabled ? "On" : "Off"}</span>
            </div>

            <TimeSelect
              label=""
              value={r.start}
              options={timeOptions}
              disabled={!r.enabled}
              onChange={(v) => updateRow(idx, { start: v })}
            />

            <TimeSelect
              label=""
              value={r.end}
              options={timeOptions}
              disabled={!r.enabled}
              minTime={r.start}
              onChange={(v) => updateRow(idx, { end: v })}
            />

            <div className="wh-msg">
              {invalid ? <span className="wh-error">End must be after start</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
