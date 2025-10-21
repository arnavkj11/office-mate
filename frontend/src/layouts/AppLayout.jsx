import React, { useState } from "react";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import "./app-shell.css"; // styles below

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <NavBar />

      <div className="app-body">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

        <main className={`app-main ${collapsed ? "is-collapsed" : ""}`}>
          <div className="app-main-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
