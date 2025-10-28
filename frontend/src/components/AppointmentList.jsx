import React, { useMemo, useState, useEffect } from "react";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export default function AppointmentList() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [sortKey, setSortKey] = useState("date");
  const [asc, setAsc] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows([]);
  }, []);

  const filtered = useMemo(() => {
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;
    let out = rows.filter(r => {
      const hit = q
        ? (r.name?.toLowerCase().includes(q.toLowerCase()) || r.email?.toLowerCase().includes(q.toLowerCase()))
        : true;
      const inRange = from && to
        ? isWithinInterval(parseISO(r.date), { start: startOfDay(from), end: endOfDay(to) })
        : true;
      return hit && inRange;
    });
    out.sort((a, b) => {
      const A = sortKey === "date" ? new Date(a.date).getTime() : (a[sortKey] || "").toString().toLowerCase();
      const B = sortKey === "date" ? new Date(b.date).getTime() : (b[sortKey] || "").toString().toLowerCase();
      return A < B ? (asc ? -1 : 1) : A > B ? (asc ? 1 : -1) : 0;
    });
    return out;
  }, [rows, q, range, sortKey, asc]);

  const toggleSort = (k) => setSortKey(s => (s === k ? (setAsc(a => !a), k) : (setAsc(true), k)));

  return (
    <div className="list">
      <div className="list-toolbar">
        <input className="inp" placeholder="Search name or email" value={q} onChange={e => setQ(e.target.value)} />
        <div className="range">
          <input className="inp" type="date" value={range.from} onChange={e => setRange(r => ({ ...r, from: e.target.value }))} />
          <span className="dash">–</span>
          <input className="inp" type="date" value={range.to} onChange={e => setRange(r => ({ ...r, to: e.target.value }))} />
        </div>
      </div>

      <div className="table">
        <div className="thead">
          <button className="th sort" onClick={() => toggleSort("date")}>Date</button>
          <button className="th sort" onClick={() => toggleSort("time")}>Time</button>
          <button className="th sort" onClick={() => toggleSort("name")}>Client</button>
          <div className="th">Location</div>
          <div className="th">Status</div>
        </div>
        <div className="tbody">
          {filtered.length === 0 ? (
            <div className="empty">No appointments</div>
          ) : (
            filtered.map(r => (
              <div className="tr" key={r.id}>
                <div className="td">{format(parseISO(r.date), "MMM d, yyyy")}</div>
                <div className="td">{r.time || "—"}</div>
                <div className="td">
                  <div className="cell-title">{r.name || "—"}</div>
                  <div className="cell-sub">{r.email || ""}</div>
                </div>
                <div className="td">{r.location || "—"}</div>
                <div className="td"><span className={`pill ${r.status || "pending"}`}>{r.status || "pending"}</span></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
