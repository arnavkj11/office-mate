import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function CalendarView() {
  const [value, setValue] = useState(new Date());
  const navigate = useNavigate();

  const onDay = (d) => {
    setValue(d);
    navigate(`/app/appointments/calendar/day?date=${format(d, "yyyy-MM-dd")}`);
  };

  return (
    <div className="cal">
      <div className="cal-toolbar">
        <div className="cal-title">Calendar</div>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={() => setValue(new Date())}>Today</button>
      </div>
      <div className="cal-surface">
        <Calendar value={value} onClickDay={onDay} />
      </div>
    </div>
  );
}
