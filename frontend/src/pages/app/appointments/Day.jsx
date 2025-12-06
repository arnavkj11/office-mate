import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO, isSameDay } from "date-fns";
import { api } from "../../../api/client";

export default function DayView() {
  const navigate = useNavigate();
  const search = new URLSearchParams(useLocation().search);
  const dateStr = search.get("date") || format(new Date(), "yyyy-MM-dd");

  const [items, setItems] = useState([]);

  const day = useMemo(() => parseISO(dateStr), [dateStr]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/appointments");
        setItems(res.items || []);
      } catch {
        setItems([]);
      }
    }
    load();
  }, []);

  const dayItems = useMemo(() => {
    const filtered = items.filter((r) => {
      const dt = r.startTime || r.date;
      if (!dt) return false;
      return isSameDay(parseISO(dt), day);
    });

    filtered.sort((a, b) => {
      const ta = a.startTime ? new Date(a.startTime).getTime() : 0;
      const tb = b.startTime ? new Date(b.startTime).getTime() : 0;
      return ta - tb;
    });

    return filtered;
  }, [items, day]);

  return (
    <div className="day">
      <div className="day-toolbar">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() =>
            navigate("/app/appointments/calendar", { replace: true })
          }
        >
          Back to calendar
        </button>
        <div className="spacer" />
        <div className="chip">{format(day, "EEEE, MMM d, yyyy")}</div>
      </div>

      <div className="day-list">
        {dayItems.length === 0 ? (
          <div className="card empty">No appointments for this day yet.</div>
        ) : (
          dayItems.map((a) => {
            const dt = a.startTime || a.date;
            const timeLabel = dt ? format(parseISO(dt), "h:mm a") : "—";
            const status = a.status || "pending";
            const statusLabel =
              status.charAt(0).toUpperCase() + status.slice(1);

            return (
              <div key={a.appointmentId} className="card day-apt">
                <div className="day-apt-time">{timeLabel}</div>
                <div className="day-apt-main">
                  <div className="day-apt-title">{a.title || "Untitled"}</div>
                  <div className="day-apt-meta">
                    <span>{a.clientName || "Unnamed client"}</span>
                    {a.inviteeEmail && (
                      <span className="day-apt-email">{a.inviteeEmail}</span>
                    )}
                  </div>
                </div>
                <div className="day-apt-status">
                  <span className={`pill ${status}`}>{statusLabel}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
