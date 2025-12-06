import React, { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { format, parseISO, compareAsc } from "date-fns";
import { api } from "../../../api/client";

export default function CalendarView() {
  const [value, setValue] = useState(new Date());
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

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

  const eventsByDate = useMemo(() => {
    const map = new Map();
    items.forEach((r) => {
      const dt = r.startTime || r.date;
      if (!dt) return;
      const d = parseISO(dt);
      const key = format(d, "yyyy-MM-dd");
      const list = map.get(key) || [];
      list.push({
        id: r.appointmentId,
        title: r.title || "Untitled",
        date: d,
      });
      map.set(key, list);
    });

    for (const [key, list] of map.entries()) {
      list.sort((a, b) => compareAsc(a.date, b.date));
      map.set(key, list);
    }

    return map;
  }, [items]);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const selectedKey = format(value, "yyyy-MM-dd");
  const selectedEvents = eventsByDate.get(selectedKey) || [];

  const onDayClick = (d) => {
    setValue(d);
    const dateStr = format(d, "yyyy-MM-dd");
    navigate(`/app/appointments/calendar/day?date=${dateStr}`);
  };

  return (
    <div className="cal">
      <div className="cal-toolbar">
        <div className="cal-title">Calendar</div>
        <div className="spacer" />
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            const today = new Date();
            setValue(today);
            const dateStr = format(today, "yyyy-MM-dd");
            navigate(`/app/appointments/calendar/day?date=${dateStr}`);
          }}
        >
          Today
        </button>
      </div>

      <div className="cal-summary">
        <div className="cal-summary-date">
          {format(value, "EEEE, MMM d, yyyy")}
        </div>
        <div className="cal-summary-count">
          {selectedEvents.length === 0 &&
            "No appointments this day"}
          {selectedEvents.length === 1 &&
            "1 appointment this day"}
          {selectedEvents.length > 1 &&
            `${selectedEvents.length} appointments this day`}
        </div>
      </div>

      <div className="cal-surface">
        <Calendar
          value={value}
          onClickDay={onDayClick}
          tileContent={({ date, view }) => {
            if (view !== "month") return null;
            const key = format(date, "yyyy-MM-dd");
            const events = eventsByDate.get(key) || [];
            if (events.length === 0) return null;

            const shown = events.slice(0, 2);
            const remaining = events.length - shown.length;
            const isToday = key === todayKey;

            return (
              <div className="cal-events">
                {shown.map((ev) => (
                  <div
                    key={ev.id}
                    className={
                      "cal-event" + (isToday ? " cal-event-today" : "")
                    }
                  >
                    <span className="cal-event-dot" />
                    <span className="cal-event-time">
                      {format(ev.date, "HH:mm")}
                    </span>
                    <span className="cal-event-title">{ev.title}</span>
                  </div>
                ))}
                {remaining > 0 && (
                  <div className="cal-event-more">
                    +{remaining} more
                  </div>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
