import React from "react";

function toMinutes(t) {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
}

export default function TimeSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  minTime,
  maxTime,
}) {
  const filtered = options.filter((t) => {
    const m = toMinutes(t);
    const okMin = minTime ? m >= toMinutes(minTime) : true;
    const okMax = maxTime ? m <= toMinutes(maxTime) : true;
    return okMin && okMax;
  });

  return (
    <label className="wh-field">
      <span className="wh-label">{label}</span>
      <select
        className="wh-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {filtered.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
