import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import "./app-shell.css";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className={`app-shell ${collapsed ? "is-collapsed" : ""} ${
        mobileOpen ? "is-open-sidebar" : ""
      }`}
    >
      <NavBar onMenuClick={() => setMobileOpen((v) => !v)} />

      <div className="app-body">
        <div className="app-overlay" onClick={() => setMobileOpen(false)} />

        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          onMobileToggle={() => setMobileOpen((v) => !v)}
        />

        <main className="app-main">
          <div className="app-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
