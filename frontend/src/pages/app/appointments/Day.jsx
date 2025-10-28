import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

export default function DayView() {
  const navigate = useNavigate();
  const q = new URLSearchParams(useLocation().search);
  const dateStr = q.get("date") || format(new Date(), "yyyy-MM-dd");
  const day = useMemo(() => parseISO(dateStr), [dateStr]);
  const items = [];

  return (
    <div className="day">
      <div className="day-toolbar">
        <button className="btn btn-ghost" onClick={() => navigate("/app/appointments/calendar", { replace: true })}>Calendar</button>
        <div className="spacer" />
        <div className="chip">{format(day, "EEEE, MMM d, yyyy")}</div>
      </div>
      <div className="day-list">
        {items.length === 0 ? <div className="empty card">No appointments for this day</div> : null}
      </div>
    </div>
  );
}
