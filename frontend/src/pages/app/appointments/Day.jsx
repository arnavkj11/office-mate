import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO, isSameDay } from "date-fns";
import { api } from "../../../api/client";

function dayNameFromISO(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return names[d.getDay()];
}

function computeWindow(workingHours, dateStr) {
  if (!workingHours || !dateStr) return { enabled: false, label: "Working hours not set" };

  const overrides = Array.isArray(workingHours.overrides) ? workingHours.overrides : [];
  const weekly = Array.isArray(workingHours.weekly) ? workingHours.weekly : [];

  const o = overrides.find((x) => x?.date === dateStr);
  if (o) {
    if (!o.enabled) return { enabled: false, label: "Off" };
    return { enabled: true, label: `${o.start}–${o.end}` };
  }

  const dn = dayNameFromISO(dateStr);
  const w = weekly.find((x) => x?.day === dn || x?.day === dn.toLowerCase());
  if (!w || !w.enabled) return { enabled: false, label: "Off" };
  return { enabled: true, label: `${w.start}–${w.end}` };
}

export default function DayView() {
  const navigate = useNavigate();
  const search = new URLSearchParams(useLocation().search);
  const dateStr = search.get("date") || format(new Date(), "yyyy-MM-dd");

  const [items, setItems] = useState([]);
  const [workingHours, setWorkingHours] = useState(null);
  const [whLabel, setWhLabel] = useState("Loading...");
  const [refreshing, setRefreshing] = useState(false);

  const day = useMemo(() => parseISO(dateStr), [dateStr]);

  async function loadAppointments() {
    try {
      const res = await api.get("/appointments");
      setItems(res.items || []);
    } catch {
      setItems([]);
    }
  }

  async function loadWH() {
    try {
      const wh = await api.get("/working-hours/me");
      setWorkingHours(wh);
    } catch {
      setWorkingHours(null);
    }
  }

  async function refreshAll() {
    setRefreshing(true);
    await Promise.all([loadAppointments(), loadWH()]);
    setRefreshing(false);
  }

  useEffect(() => {
    refreshAll();
  }, [dateStr]);

  useEffect(() => {
    let alive = true;

    async function handleUpdated() {
      if (!alive) return;
      await loadWH();
    }

    function onFocus() {
      handleUpdated();
    }

    window.addEventListener("workinghours:updated", handleUpdated);
    window.addEventListener("focus", onFocus);

    return () => {
      alive = false;
      window.removeEventListener("workinghours:updated", handleUpdated);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    if (!workingHours) {
      setWhLabel("Working hours not set");
      return;
    }
    const w = computeWindow(workingHours, dateStr);
    setWhLabel(w.label);
  }, [workingHours, dateStr]);

  const isOff = useMemo(() => {
    if (!workingHours) return false;
    return !computeWindow(workingHours, dateStr).enabled;
  }, [workingHours, dateStr]);

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
          onClick={() => navigate("/app/appointments/calendar", { replace: true })}
        >
          Back to calendar
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={refreshAll}
          disabled={refreshing}
          style={{ marginLeft: 8 }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

        <div className="spacer" />
        <div className="chip">{format(day, "EEEE, MMM d, yyyy")}</div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Working hours</div>
        <div style={{ color: isOff ? "#b91c1c" : "#6b7280" }}>{whLabel}</div>
        {isOff ? (
          <div style={{ marginTop: 6, fontSize: 13, color: "#b91c1c" }}>
            This date is not available for booking.
          </div>
        ) : null}
      </div>

      <div className="day-list">
        {dayItems.length === 0 ? (
          <div className="card empty">No appointments for this day yet.</div>
        ) : (
          dayItems.map((a) => {
            const dt = a.startTime || a.date;
            const timeLabel = dt ? format(parseISO(dt), "h:mm a") : "—";
            const status = a.status || "pending";
            const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

            return (
              <div key={a.appointmentId} className="card day-apt">
                <div className="day-apt-time">{timeLabel}</div>
                <div className="day-apt-main">
                  <div className="day-apt-title">{a.title || "Untitled"}</div>
                  <div className="day-apt-meta">
                    <span>{a.clientName || "Unnamed client"}</span>
                    {a.inviteeEmail && <span className="day-apt-email">{a.inviteeEmail}</span>}
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
