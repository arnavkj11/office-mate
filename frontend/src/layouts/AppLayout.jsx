import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import "./app-shell.css";

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <NavBar />
      <div className="app-body">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
        <main className="app-main">
          <div className="app-main-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
