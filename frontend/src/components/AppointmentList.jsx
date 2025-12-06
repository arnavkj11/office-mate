import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { api } from "../api/client";

export default function AppointmentList() {
  const [q, setQ] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });
  const [sortKey, setSortKey] = useState("startTime");
  const [asc, setAsc] = useState(true);
  const [rows, setRows] = useState([]);

  const [colWidths, setColWidths] = useState([240, 240, 240, 240, 240]);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const dragInfoRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/appointments");
        setRows(res.items || []);
      } catch {
        setRows([]);
      }
    }
    load();
  }, []);

  useEffect(() => {
    function measureAndSetEqual() {
      const width =
        wrapperRef.current?.clientWidth ||
        (typeof window !== "undefined" ? window.innerWidth : 1200);
      const perCol = width / 5;
      setColWidths(Array(5).fill(perCol));
    }

    measureAndSetEqual();
    setViewportWidth(window.innerWidth);

    function handleResize() {
      setViewportWidth(window.innerWidth);
      if (!dragInfoRef.current) {
        measureAndSetEqual();
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = viewportWidth >= 600;

  const filtered = useMemo(() => {
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;

    let out = rows.filter((r) => {
      const query = q.toLowerCase();
      const hit = q
        ? (r.title || "").toLowerCase().includes(query) ||
          (r.clientName || "").toLowerCase().includes(query) ||
          (r.inviteeEmail || "").toLowerCase().includes(query)
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

  const handleMouseMove = useCallback(
    (e) => {
      const info = dragInfoRef.current;
      if (!info) return;

      const { startX, index, startWidths } = info;
      const deltaX = e.clientX - startX;
      const minWidth = 80;
      const nextIndex = index + 1;
      const newWidths = [...startWidths];

      if (nextIndex >= newWidths.length) {
        newWidths[index] = Math.max(minWidth, startWidths[index] + deltaX);
        setColWidths(newWidths);
        return;
      }

      let wCurrent = startWidths[index] + deltaX;
      let wNext = startWidths[nextIndex] - deltaX;

      if (wCurrent < minWidth) {
        const diff = minWidth - wCurrent;
        wCurrent = minWidth;
        wNext -= diff;
      }

      if (wNext < minWidth) {
        const diff = minWidth - wNext;
        wNext = minWidth;
        wCurrent -= diff;
      }

      newWidths[index] = wCurrent;
      newWidths[nextIndex] = wNext;

      setColWidths(newWidths);
    },
    [setColWidths]
  );

  const handleMouseUp = useCallback(() => {
    dragInfoRef.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleResizeMouseDown = (index, e) => {
    if (!isDesktop) return;
    e.preventDefault();
    e.stopPropagation();

    dragInfoRef.current = {
      startX: e.clientX,
      index,
      startWidths: [...colWidths],
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const colTemplate = colWidths.map((w) => `${w}px`).join(" ");

  return (
    <div className="list">
      <div className="list-header">
        <div>
          <div className="list-title">All appointments</div>
          <div className="list-sub">
            {filtered.length} {filtered.length === 1 ? "appointment" : "appointments"}
          </div>
        </div>

        <div className="list-toolbar">
          <input
            className="inp"
            placeholder="Search by title, client or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="range">
            <input
              className="inp"
              type="date"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
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

      <div className="table-wrapper" ref={wrapperRef}>
        <div className="table">
          <div
            className="thead"
            style={isDesktop ? { gridTemplateColumns: colTemplate } : undefined}
          >
            <div className="th">
              <div className="th-inner">
                <button className="th-label sort" onClick={() => toggleSort("startTime")}>
                  Date
                </button>
                <span className="col-resizer" onMouseDown={(e) => handleResizeMouseDown(0, e)} />
              </div>
            </div>

            <div className="th">
              <div className="th-inner">
                <button className="th-label sort" onClick={() => toggleSort("startTime")}>
                  Time
                </button>
                <span className="col-resizer" onMouseDown={(e) => handleResizeMouseDown(1, e)} />
              </div>
            </div>

            <div className="th">
              <div className="th-inner">
                <button className="th-label sort" onClick={() => toggleSort("title")}>
                  Title
                </button>
                <span className="col-resizer" onMouseDown={(e) => handleResizeMouseDown(2, e)} />
              </div>
            </div>

            <div className="th">
              <div className="th-inner">
                <button className="th-label sort" onClick={() => toggleSort("clientName")}>
                  Client name
                </button>
                <span className="col-resizer" onMouseDown={(e) => handleResizeMouseDown(3, e)} />
              </div>
            </div>

            <div className="th">
              <div className="th-inner">
                <button className="th-label sort" onClick={() => toggleSort("inviteeEmail")}>
                  Client email
                </button>
              </div>
            </div>
          </div>

          <div className="tbody">
            {filtered.length === 0 ? (
              <div className="empty">No appointments yet. Create one to see it here.</div>
            ) : (
              filtered.map((r) => {
                const dt = r.startTime || r.date;
                const dateLabel = dt ? format(parseISO(dt), "MMM d, yyyy") : "—";
                const timeLabel = dt ? format(parseISO(dt), "h:mm a") : "—";
                const status = r.status || "pending";
                const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

                return (
                  <div
                    className="tr"
                    key={r.appointmentId}
                    style={isDesktop ? { gridTemplateColumns: colTemplate } : undefined}
                  >
                    <div className="td td-date">
                      <div>{dateLabel}</div>
                      <span className={`pill ${status}`}>{statusLabel}</span>
                    </div>

                    <div className="td">{timeLabel}</div>

                    <div className="td td-title">
                      <div className="cell-title">{r.title || "—"}</div>
                      {r.notes && <div className="cell-sub">{r.notes.slice(0, 80)}</div>}
                    </div>

                    <div className="td td-client">{r.clientName || "Unnamed client"}</div>

                    <div className="td td-email">{r.inviteeEmail || "—"}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
