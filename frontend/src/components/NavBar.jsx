import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStatus } from "../lib/useAuthStatus";
import "./navbar.css";

export default function NavBar({ onMenuClick }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastY, setLastY] = useState(0);

  const nav = useNavigate();
  const { checking, authed } = useAuthStatus();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      const d = y - lastY;
      if (d > 6 && y > 64) setHidden(true);
      else if (d < -6 || y < 64) setHidden(false);
      setLastY(y);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastY]);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    window.addEventListener("hashchange", close);
    return () => {
      window.removeEventListener("popstate", close);
      window.removeEventListener("hashchange", close);
    };
  }, []);

  const handlePrimaryClick = () => {
    setOpen(false);
    if (authed) nav("/app");
    else nav("/auth");
  };

  return (
    <header className={`nav ${hidden ? "hide" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo-link">
          <img src="/mainlogo.png" alt="OfficeMate Logo" className="nav-logo" />
        </Link>

        <nav className="nav-links">
          <NavLink to="/about" className="nav-link">About</NavLink>
          <NavLink to="/contact" className="nav-link">Contact</NavLink>
          <NavLink to="/app/dashboard" className="nav-link">Dashboard</NavLink>

          {!checking && (
            <button className="nav-cta" onClick={handlePrimaryClick}>
              {authed ? "Go to app" : "Sign up / Login"}
            </button>
          )}
        </nav>

        <button
          className="nav-burger"
          aria-expanded={open}
          onClick={() => {
            setOpen(!open);
            if (onMenuClick) onMenuClick();
          }}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav-drop ${open ? "open" : ""}`}>
        <NavLink to="/about" className="nav-drop-link" onClick={() => setOpen(false)}>About</NavLink>
        <NavLink to="/contact" className="nav-drop-link" onClick={() => setOpen(false)}>Contact</NavLink>
        <NavLink to="/app/dashboard" className="nav-drop-link" onClick={() => setOpen(false)}>Dashboard</NavLink>

        {!checking && (
          <button className="nav-drop-cta" onClick={handlePrimaryClick}>
            {authed ? "Go to app" : "Sign up / Login"}
          </button>
        )}
      </div>
    </header>
  );
}
