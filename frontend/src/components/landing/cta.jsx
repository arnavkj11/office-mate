import React from "react";
import { Link } from "react-router-dom";

export default function CTA({ checking, authed, onGetStarted }) {
  return (
    <section className="om-cta-band">
      <div className="om-wrap om-cta-inner">
        <div>
          <h3 className="om-cta-title">Ready to move faster</h3>
          <p className="om-cta-sub">
            Create your workspace, invite your team and let OfficeMate handle
            the busywork around meetings and follow ups.
          </p>
        </div>

        <div className="om-cta-actions">
          {!checking && (
            <button
              type="button"
              className="om-btn om-btn-primary"
              onClick={onGetStarted}
            >
              {authed ? "Open app" : "Start free"}
            </button>
          )}
          <Link className="om-btn om-btn-ghost" to="/contact">
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
