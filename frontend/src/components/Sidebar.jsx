// Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar({ initialCollapsed = false }) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  return (
    <aside className={`app-sidebar ${collapsed ? "is-collapsed" : ""}`} aria-expanded={!collapsed}>
      <div className="sb-head">
        <div className="sb-brand">
          <img className="sb-logo-img" src="/mainlogo.png" alt="OfficeMate" />
          {!collapsed && <span className="sb-brand-text">OfficeMate</span>}
        </div>

        <button
          className="sb-toggle"
          onClick={() => setCollapsed(v => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <nav className="sb-nav">
        <NavLink to="/app/dashboard" className="sb-link" title="Dashboard">
          <span className="sb-ico">🏠</span>
          {!collapsed && <span className="sb-text">Dashboard</span>}
        </NavLink>

        <NavLink to="/app/appointments" className="sb-link" title="Appointments">
          <span className="sb-ico">📅</span>
          {!collapsed && <span className="sb-text">Appointments</span>}
        </NavLink>

        <NavLink to="/app/assistant" className="sb-link" title="Assistant">
          <span className="sb-ico">🤖</span>
          {!collapsed && <span className="sb-text">Assistant</span>}
        </NavLink>

        <NavLink to="/app/notes" className="sb-link" title="Notes">
          <span className="sb-ico">📝</span>
          {!collapsed && <span className="sb-text">Notes</span>}
        </NavLink>

        <NavLink to="/app/settings" className="sb-link" title="Settings">
          <span className="sb-ico">⚙️</span>
          {!collapsed && <span className="sb-text">Settings</span>}
        </NavLink>
      </nav>

      <style>{`
        .app-sidebar {
          width: 240px;
          min-width: 240px;
          height: 100%;
          background: #fff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          position: relative;
        }
        .app-sidebar.is-collapsed {
          width: 64px;
          min-width: 64px;
          overflow: visible;
        }

        .sb-head {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 8px;
          position: relative;
          min-height: 48px;
        }
        .sb-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .sb-logo-img {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }
        .sb-brand-text {
          font-weight: 700;
          white-space: nowrap;
        }
        .sb-toggle {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
          color: #374151;
          z-index: 10;
          padding: 4px 6px;
          line-height: 1;
        }
        .app-sidebar.is-collapsed .sb-toggle { right: 6px; }

        .sb-nav {
          display: grid;
          gap: 6px;
          padding: 8px;
        }
        .sb-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 8px;
          color: #111827;
          text-decoration: none;
          font-size: 14px;
          white-space: nowrap;
        }
        .sb-link.active { background: #eef2ff; }

        .sb-ico {
          width: 24px;
          display: inline-flex;
          justify-content: center;
        }

        /* Collapsed layout tweaks */
        .app-sidebar.is-collapsed .sb-link {
          justify-content: center;
          gap: 0;
          padding-left: 8px;
          padding-right: 8px;
        }
      `}</style>
    </aside>
  );
}
