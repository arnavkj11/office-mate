import React, { useMemo, useState, useEffect } from "react";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";

export default function AppointmentList() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [sortKey, setSortKey] = useState("startTime");
  const [asc, setAsc] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    // TODO: replace with real API call
    // setRows(await api.get("/appointments"));
    setRows([]);
  }, []);

  const filtered = useMemo(() => {
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;

    let out = rows.filter((r) => {
      const hit = q
        ? (r.title || "")
            .toLowerCase()
            .includes(q.toLowerCase()) ||
          (r.email || "").toLowerCase().includes(q.toLowerCase())
        : true;

      const dt = r.startTime || r.date;
      const inRange =
        from && to && dt
          ? isWithinInterval(parseISO(dt), {
              start: startOfDay(from),
              end: endOfDay(to),
            })
          : true;

      return hit && inRange;
    });

    out.sort((a, b) => {
      let A;
      let B;

      if (sortKey === "startTime") {
        A = a.startTime ? new Date(a.startTime).getTime() : 0;
        B = b.startTime ? new Date(b.startTime).getTime() : 0;
      } else {
        A = (a[sortKey] || "").toString().toLowerCase();
        B = (b[sortKey] || "").toString().toLowerCase();
      }

      if (A < B) return asc ? -1 : 1;
      if (A > B) return asc ? 1 : -1;
      return 0;
    });

    return out;
  }, [rows, q, range, sortKey, asc]);

  const toggleSort = (key) => {
    setSortKey((prev) => {
      if (prev === key) {
        setAsc((prevAsc) => !prevAsc);
        return key;
      }
      setAsc(true);
      return key;
    });
  };

  return (
    <div className="list">
      <div className="list-header">
        <div>
          <div className="list-title">All appointments</div>
          <div className="list-sub">
            {filtered.length}{" "}
            {filtered.length === 1 ? "appointment" : "appointments"}
          </div>
        </div>

        <div className="list-toolbar">
          <input
            className="inp"
            placeholder="Search by title or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="range">
            <input
              className="inp"
              type="date"
              value={range.from}
              onChange={(e) =>
                setRange((r) => ({ ...r, from: e.target.value }))
              }
            />
            <span className="dash">–</span>
            <input
              className="inp"
              type="date"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <button
            className="th sort"
            type="button"
            onClick={() => toggleSort("startTime")}
          >
            Date
          </button>
          <button
            className="th sort"
            type="button"
            onClick={() => toggleSort("startTime")}
          >
            Time
          </button>
          <button
            className="th sort"
            type="button"
            onClick={() => toggleSort("title")}
          >
            Title
          </button>
          <div className="th">Invitee</div>
          <div className="th">Status</div>
        </div>

        <div className="tbody">
          {filtered.length === 0 ? (
            <div className="empty">
              No appointments yet. Create one to see it here.
            </div>
          ) : (
            filtered.map((r) => {
              const dt = r.startTime || r.date;
              const dateLabel = dt
                ? format(parseISO(dt), "MMM d, yyyy")
                : "—";
              const timeLabel = dt ? format(parseISO(dt), "h:mm a") : "—";
              const status = r.status || "pending";

              return (
                <div className="tr" key={r.id}>
                  <div className="td">{dateLabel}</div>
                  <div className="td">{timeLabel}</div>
                  <div className="td">
                    <div className="cell-title">{r.title || "—"}</div>
                    {r.notes && (
                      <div className="cell-sub">{r.notes.slice(0, 60)}</div>
                    )}
                  </div>
                  <div className="td">
                    <div className="cell-title">{r.name || r.email || "—"}</div>
                    {r.email && (
                      <div className="cell-sub">{r.email}</div>
                    )}
                  </div>
                  <div className="td">
                    <span className={`pill ${status}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
