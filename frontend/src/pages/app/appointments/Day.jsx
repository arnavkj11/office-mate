import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

export default function DayView() {
  const navigate = useNavigate();
  const search = new URLSearchParams(useLocation().search);
  const dateStr = search.get("date") || format(new Date(), "yyyy-MM-dd");

  const day = useMemo(() => parseISO(dateStr), [dateStr]);

  // placeholder list; later you will fetch real data for this day
  const items = [];

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
        <div className="chip">
          {format(day, "EEEE, MMM d, yyyy")}
        </div>
      </div>

      <div className="day-list">
        {items.length === 0 ? (
          <div className="card empty">
            No appointments for this day yet.
          </div>
        ) : (
          items.map((a) => (
            <div key={a.id} className="card">
              {/* render appointment details here later */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
