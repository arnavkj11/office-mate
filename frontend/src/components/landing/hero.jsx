import React from "react";
import { Link } from "react-router-dom";

export default function Hero({
  theme,
  toggleTheme,
  checking,
  authed,
  onGetStarted,
}) {
  return (
    <section className="om-hero">
      <div className="om-wrap om-hero-grid">
        <div className="om-hero-col">
          <div className="om-hero-top-row">
            <span className="om-badge">AI office productivity</span>
            <button
              type="button"
              className="om-theme-toggle"
              onClick={toggleTheme}
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>

          <h1 className="om-lead">
            Work lighter<span className="om-grad"> Ship faster</span>
          </h1>

          <p className="om-sub">
            OfficeMate centralizes scheduling, notes and automation in one
            workspace so teams spend more time on meaningful work and less on
            coordination.
          </p>

          <div className="om-cta-row">
            {!checking &&
              (authed ? (
                <button
                  type="button"
                  className="om-btn om-btn-primary"
                  onClick={onGetStarted}
                >
                  Go to workspace
                </button>
              ) : (
                <button
                  type="button"
                  className="om-btn om-btn-primary"
                  onClick={onGetStarted}
                >
                  Get started
                </button>
              ))}
            <Link className="om-btn om-btn-outline" to="/about">
              Learn more
            </Link>
          </div>

          <div className="om-kpis">
            <div className="om-pill">
              <b>40%</b>
              <span>less manual admin work</span>
            </div>
            <div className="om-pill">
              <b>90%</b>
              <span>less scheduling overhead</span>
            </div>
            <div className="om-pill">
              <b>&lt;10s</b>
              <span>from command to action</span>
            </div>
          </div>
        </div>

        <div className="om-hero-art">
          <div className="om-glass">
            <div className="om-hero-label">OfficeMate assistant</div>
            <img
              src="/mainlogo.png"
              alt="OfficeMate"
              className="om-hero-logo"
            />
            <div className="om-hero-bubbles">
              <div className="om-chip">
                <span className="om-chip-dot" />
                Draft client recap
              </div>
              <div className="om-chip">
                <span className="om-chip-dot" />
                Schedule follow up
              </div>
              <div className="om-chip">
                <span className="om-chip-dot" />
                Summarize notes
              </div>
            </div>
            <div className="om-backdrop" />
          </div>
        </div>
      </div>
    </section>
  );
}
