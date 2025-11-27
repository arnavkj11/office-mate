import React from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AppointmentList from "../../../components/AppointmentList.jsx";
import AppointmentForm from "../../../components/AppointmentForm.jsx";
import CalendarView from "./Calendar.jsx";
import DayView from "./Day.jsx";
import "./appointments.css";

export default function Appointments() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isList = pathname === "/app/appointments";
  const isCalendar = pathname.startsWith("/app/appointments/calendar");

  return (
    <div className="appts">
      <div className="appts-header">
        <div>
          <h1 className="appts-title">Appointments</h1>
          <p className="appts-sub">
            Create, track and manage all your bookings in one place.
          </p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => navigate("/app/appointments")}
        >
          New appointment
        </button>
      </div>

      <div
        className="tabs"
        role="tablist"
        aria-label="Appointment views"
      >
        <NavLink
          end
          to="/app/appointments"
          role="tab"
          aria-selected={isList}
          className={`tab ${isList ? "active" : ""}`}
        >
          List
        </NavLink>

        <NavLink
          to="/app/appointments/calendar"
          role="tab"
          aria-selected={isCalendar}
          className={`tab ${isCalendar ? "active" : ""}`}
        >
          Calendar
        </NavLink>
      </div>

      <div className="appts-layout">
        {/* left: main content (list/calendar/day) */}
        <div className="appts-main appts-card">
          <Routes>
            <Route index element={<AppointmentList />} />
            <Route path="calendar" element={<CalendarView />} />
            <Route path="calendar/day" element={<DayView />} />
            <Route
              path="*"
              element={<Navigate to="/app/appointments" replace />}
            />
          </Routes>
        </div>

        {/* right: create panel */}
        <aside className="appts-side">
          <AppointmentForm />
        </aside>
      </div>
    </div>
  );
}
