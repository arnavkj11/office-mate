import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar({ collapsed, onToggle, onMobileToggle }) {
  return (
    <aside className="app-sidebar" aria-expanded={!collapsed}>
      <div className="sb-head" onClick={onMobileToggle}>
        <div className="sb-brand">
          <img className="sb-logo-img" src="/mainlogo.png" alt="OfficeMate" />
          {!collapsed && <span className="sb-brand-text">OfficeMate</span>}
        </div>

        <button
          className="sb-toggle"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="sb-nav">
        <NavLink to="/app/dashboard" className="sb-link">
          <span className="sb-ico">🏠</span>
          {!collapsed && <span className="sb-text">Dashboard</span>}
        </NavLink>

        <NavLink to="/app/appointments" className="sb-link">
          <span className="sb-ico">📅</span>
          {!collapsed && <span className="sb-text">Appointments</span>}
        </NavLink>

        <NavLink to="/app/assistant" className="sb-link">
          <span className="sb-ico">🤖</span>
          {!collapsed && <span className="sb-text">Assistant</span>}
        </NavLink>

        <NavLink to="/app/notes" className="sb-link">
          <span className="sb-ico">📝</span>
          {!collapsed && <span className="sb-text">Notes</span>}
        </NavLink>

        <NavLink to="/app/settings" className="sb-link">
          <span className="sb-ico">⚙️</span>
          {!collapsed && <span className="sb-text">Settings</span>}
        </NavLink>
      </nav>
    </aside>
  );
}
