import React from "react";
import { NavLink } from "react-router-dom";

const Item = ({ to, label, emoji }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
    data-label={label}
    title={label}
  >
    <span className="sidebar-emoji" aria-label={label} role="img">
      {emoji}
    </span>
    <span className="sidebar-label">{label}</span>
  </NavLink>
);

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`sidebar ${collapsed ? "collapsed" : ""}`}
      style={{
        width: collapsed ? "var(--sidebar-w-collapsed)" : "var(--sidebar-w)",
      }}
    >
      {/* Brand */}
      <div className="sidebar-brand">
        <img src="/mainlogo.png" alt="OfficeMate" className="sidebar-logo" />
        {!collapsed && (
          <div className="sidebar-brand-text">
            <div className="sidebar-title">OfficeMate</div>
            <div className="sidebar-sub">AI Office Productivity</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <Item to="/app/dashboard" label="Dashboard" emoji="📊" />
        <Item to="/app/appointments" label="Appointments" emoji="📅" />
        <Item to="/app/assistant" label="Assistant" emoji="🤖" />
        <Item to="/app/notes" label="Notes" emoji="📝" />
        <Item to="/app/settings" label="Settings" emoji="⚙️" />
      </nav>

      {/* Collapse button */}
      <button className="sidebar-collapse" onClick={onToggle}>
        {collapsed ? "➤ Expand" : "◀ Collapse"}
      </button>

      <style>{`
        :root {
          --sidebar-w: 240px;
          --sidebar-w-collapsed: 78px;
        }

        .sidebar {
          height: calc(100dvh - 78px);
          background: #fff;
          border-right: 1px solid rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          transition: width 0.2s ease;
          overflow: hidden;
        }

        /* Brand */
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 12px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
        }

        .sidebar-logo {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: contain;
        }

        .sidebar-title {
          font-weight: 700;
          color: #0f172a;
          font-size: 15px;
        }

        .sidebar-sub {
          font-size: 12px;
          color: #64748b;
        }

        /* Nav items */
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 8px;
          flex: 1;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #0f172a;
          font-weight: 600;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .sidebar-item:hover {
          background: rgba(0,0,0,0.04);
        }

        .sidebar-item.active {
          background: #edf2ff;
          color: #1f49e7;
        }

        .sidebar-emoji {
          font-size: 18px;
          min-width: 24px;
          text-align: center;
        }

        .sidebar-label {
          font-size: 14px;
        }

        /* Collapse button */
        .sidebar-collapse {
          margin: 8px 10px 14px;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 10px;
          background: #fff;
          font-weight: 700;
          cursor: pointer;
          padding: 8px 10px;
          transition: background 0.15s ease;
        }

        .sidebar-collapse:hover {
          background: rgba(0,0,0,0.04);
        }

        /* Collapsed view */
        .sidebar.collapsed .sidebar-brand-text,
        .sidebar.collapsed .sidebar-label {
          display: none;
        }

        .sidebar.collapsed .sidebar-item {
          justify-content: center;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            top: 78px;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            z-index: 50;
            transition: transform 0.25s ease;
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
