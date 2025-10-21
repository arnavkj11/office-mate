import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>© {new Date().getFullYear()} OfficeMate</div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/about" style={{ textDecoration: "none", color: "#64748b" }}>
            About
          </a>
          <a href="/contact" style={{ textDecoration: "none", color: "#64748b" }}>
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
