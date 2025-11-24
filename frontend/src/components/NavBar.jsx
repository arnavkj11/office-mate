import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStatus } from "../lib/useAuthStatus";

export default function NavBar() {
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
    if (authed) {
      nav("/app");
    } else {
      nav("/auth");
    }
  };

  return (
    <header className={`nav ${hidden ? "hide" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo-link" aria-label="Home">
          <img src="/mainlogo.png" alt="OfficeMate Logo" className="nav-logo" />
        </Link>

        <nav className="nav-links">
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Contact
          </NavLink>
          {/* if you actually want in-app dashboard, point to /app/dashboard */}
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Dashboard
          </NavLink>

          {/* Primary CTA: route depends on auth state */}
          {!checking && (
            <button
              type="button"
              className="nav-cta"
              onClick={handlePrimaryClick}
            >
              {authed ? "Go to app" : "Sign up / Login"}
            </button>
          )}
        </nav>

        <button
          className="nav-burger"
          aria-label="Menu"
          aria-expanded={open ? "true" : "false"}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>
      </div>

      <div className={`nav-drop ${open ? "open" : ""}`}>
        <NavLink
          to="/about"
          className="nav-drop-link"
          onClick={() => setOpen(false)}
        >
          About
        </NavLink>
        <NavLink
          to="/contact"
          className="nav-drop-link"
          onClick={() => setOpen(false)}
        >
          Contact
        </NavLink>
        <NavLink
          to="/app/dashboard"
          className="nav-drop-link"
          onClick={() => setOpen(false)}
        >
          Dashboard
        </NavLink>

        {/* Mobile CTA with same auth-aware behavior */}
        {!checking && (
          <button
            type="button"
            className="nav-drop-cta"
            onClick={handlePrimaryClick}
          >
            {authed ? "Go to app" : "Sign up / Login"}
          </button>
        )}
      </div>

      <style>{`
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          transform: translateY(0);
          transition: transform 0.25s ease;
        }
        .nav.hide { transform: translateY(-100%); }

        .nav-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px clamp(16px, 3vw, 32px);
          height: 68px;
          box-sizing: border-box;
        }

        .nav-logo {
          width: 110px;
          height: 110px;
          object-fit: contain;
          border-radius: 14px;
          transform: translateY(8px);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-link {
          color: #000;
          text-decoration: none;
          font-size: 16px;
          font-weight: 500;
          padding: 8px 12px;
          transition: background 0.2s;
          border-radius: 8px;
        }

        .nav-link:hover { background: rgba(0,0,0,0.06); }
        .nav-link.active { font-weight: 700; }

        .nav-cta {
          background: #1f6feb;
          color: #fff;
          padding: 9px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }

        .nav-burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 42px;
          height: 42px;
          background: #fff;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 8px;
          cursor: pointer;
        }

        .nav-burger span {
          width: 22px;
          height: 2px;
          background: #000;
          margin: 3px 0;
          border-radius: 2px;
        }

        .nav-drop {
          display: none;
          background: #fff;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          padding: 8px clamp(16px, 4vw, 32px);
        }

        .nav-drop.open { display: block; }

        .nav-drop-link {
          display: block;
          padding: 10px;
          color: #000;
          font-size: 16px;
          text-decoration: none;
          border-radius: 8px;
        }
        .nav-drop-link:hover { background: rgba(0,0,0,0.05); }

        .nav-drop-cta {
          display: block;
          text-align: center;
          margin-top: 6px;
          background: #1f6feb;
          color: #fff;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
          border: none;
          width: 100%;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-burger { display: flex; position: relative; right: 14px; }
          .nav-inner { height: 64px; padding: 6px; justify-content: space-between;}
          .nav-logo { width: 90px; height: 90px; transform: translateY(6px); } 
        }

        @media (max-width: 600px) {
          .nav-logo { width: 70px; height: 70px; }
          .nav-inner { height: 60px; }
        }

        body { padding-top: 68px; }
      `}</style>
    </header>
  );
}
