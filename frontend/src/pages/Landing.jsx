import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import NavBar from "../components/NavBar"; // <-- CALL NAVBAR HERE

export default function Landing() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { tokens } = await fetchAuthSession();
        setAuthed(!!tokens?.accessToken);
      } catch {
        setAuthed(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  async function onGetStarted() {
    // if signed in, go to app; else go to auth
    try {
      const { tokens } = await fetchAuthSession();
      nav(tokens?.accessToken ? "/app" : "/auth");
    } catch {
      nav("/auth");
    }
  }

  async function onSignOut() {
    await signOut();
    setAuthed(false);
    nav("/", { replace: true });
  }

  return (
    <>
      {/* NAVBAR ON LANDING */}
      <NavBar />
      {/* Spacer so fixed navbar doesn't overlap hero */}
      <div style={{ height: 78 }} />

      {/* HERO */}
      <section className="om-hero">
        <div className="om-wrap om-hero-grid">
          <div className="om-hero-col">
            <span className="om-badge">AI Office Productivity</span>
            <h1 className="om-lead">
              Work lighter. <span className="om-grad">Ship faster.</span>
            </h1>
            <p className="om-sub">
              OfficeMate centralizes scheduling, notes, and automation.
              Fewer tabs. Fewer clicks. More done.
            </p>

            <div className="om-cta-row">
              {!checking && (
                authed ? (
                  <button className="om-btn om-btn-primary" onClick={onSignOut}>
                    Sign out
                  </button>
                ) : (
                  <button className="om-btn om-btn-primary" onClick={onGetStarted}>
                    Get Started
                  </button>
                )
              )}
              <Link className="om-btn om-btn-outline" to="/about">Learn more</Link>
            </div>

            <div className="om-kpis">
              <div className="om-pill"><b>40%</b><span>less manual work</span></div>
              <div className="om-pill"><b>90%</b><span>less scheduling overhead</span></div>
              <div className="om-pill"><b>&lt;10s</b><span>command → action</span></div>
            </div>
          </div>

          <div className="om-hero-art">
            <div className="om-glass">
              <img src="/mainlogo.png" alt="OfficeMate" className="om-hero-logo" />
              <div className="om-backdrop" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="om-section">
        <div className="om-wrap">
          <h2 className="om-h2">Everything you need, in one place</h2>
          <p className="om-h2-sub">Fast. Simple. AI-assisted.</p>

          <div className="om-grid">
            <Card to="/features/appointments" emoji="📅" title="Smart Scheduling"
              copy="Create events, send branded invites, track RSVPs, and sync to Google Calendar." />
            <Card to="/features/assistant" emoji="🤖" title="AI Assistant"
              copy="Type natural commands to schedule, draft notes, or reschedule meetings in seconds." />
            <Card to="/features/notes" emoji="📝" title="Notes & Search"
              copy="Capture structured notes and find decisions instantly with full-text search." />
            <Card to="/features/integrations" emoji="🧩" title="Integrations"
              copy="Google Calendar, Mailjet, and more. Your tools, connected." />
            <Card to="/about" emoji="🔒" title="Security"
              copy="HTTPS/TLS, API key rotation, and least-privilege access by default." />
            <Card to="/about" emoji="⚡" title="Simple UI"
              copy="Minimal, responsive, accessible—designed to get out of your way." />
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="om-cta-band">
        <div className="om-wrap om-cta-inner">
          <div>
            <h3 className="om-cta-title">Ready to move faster?</h3>
            <p className="om-cta-sub">Create your account and automate the busywork today.</p>
          </div>
          <div className="om-cta-actions">
            {!checking && (
              authed ? (
                <button className="om-btn om-btn-primary" onClick={onSignOut}>Sign out</button>
              ) : (
                <button className="om-btn om-btn-primary" onClick={onGetStarted}>Sign up free</button>
              )
            )}
            <Link className="om-btn om-btn-ghost" to="/contact">Contact sales</Link>
          </div>
        </div>
      </section>

      <style>{`
        .om-wrap { width:100%; max-width:1200px; margin:0 auto; padding: 0 clamp(16px, 4vw, 32px); }
        .om-section { padding: 64px 0; }

        .om-hero {
          padding: 24px 0 56px;
          background: radial-gradient(1200px 600px at 70% -10%, rgba(31,111,235,0.12), transparent 60%),
                      radial-gradient(900px 500px at 0% 10%, rgba(99,102,241,0.12), transparent 60%),
                      #fff;
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .om-hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: clamp(24px, 5vw, 48px);
          align-items: center;
        }
        @media (max-width: 980px) {
          .om-hero-grid { grid-template-columns: 1fr; padding-top: 8px; }
        }

        .om-hero-col .om-badge {
          display:inline-block; font-size:12px; font-weight:700; letter-spacing:.4px;
          padding:6px 10px; background:#f3f6ff; color:#1f6feb; border:1px solid rgba(31,111,235,.18);
          border-radius:999px; margin-bottom:12px;
        }
        .om-lead { margin: 6px 0 10px; font-weight: 800; font-size: clamp(32px, 5.2vw, 54px); letter-spacing:-0.02em; color:#0f172a; }
        .om-grad { background: linear-gradient(90deg,#1f6feb 0%,#6366f1 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .om-sub { max-width: 640px; color:#334155; font-size: clamp(16px, 2.3vw, 18px); line-height: 1.6; }

        .om-cta-row { display:flex; gap:10px; margin-top:16px; flex-wrap:wrap; }
        .om-btn {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          text-decoration:none; border-radius:12px; font-weight:700; line-height:1;
          padding: 12px 16px; font-size: 15px;
        }
        .om-btn-primary { background:#1f6feb; color:#fff; box-shadow: 0 10px 24px rgba(31,111,235,.22); }
        .om-btn-primary:hover { filter: brightness(0.98); }
        .om-btn-outline { color:#0f172a; border:1px solid rgba(0,0,0,0.12); background:#fff; }
        .om-btn-outline:hover { background: rgba(0,0,0,0.04); }
        .om-btn-ghost { color:#0f172a; background: transparent; border:1px solid rgba(0,0,0,0.1); }
        .om-btn-ghost:hover { background: rgba(0,0,0,0.04); }

        .om-kpis { display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
        .om-pill { display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; background:#f8fafc; border:1px solid rgba(0,0,0,0.06); font-size:14px; color:#0f172a; }
        .om-pill b { font-size:15px; }

        .om-hero-art { display:flex; justify-content:center; }
        .om-glass {
          position: relative; width: min(520px, 90%);
          border-radius: 24px; background: rgba(255,255,255,0.7);
          border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          backdrop-filter: blur(8px); overflow: hidden;
        }
        .om-hero-logo { display:block; width: 72%; margin: 30px auto 20px; aspect-ratio: 1/1; object-fit: contain; border-radius: 18px; }
        .om-backdrop { position:absolute; inset:auto -30% -22% -30%; height: 46%; background: radial-gradient(60% 80% at 50% 0%, rgba(31,111,235,.18), transparent 60%); filter: blur(20px); }

        .om-h2 { font-size: clamp(24px, 3.8vw, 34px); font-weight:800; letter-spacing:-.01em; color:#0f172a; margin:0; }
        .om-h2-sub { color:#475569; margin:6px 0 22px; }

        .om-grid { display:grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 14px; }
        @media (max-width: 980px) { .om-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        @media (max-width: 640px) { .om-grid { grid-template-columns: 1fr; } }

        .om-card { display:block; text-decoration:none; color: inherit; background:#fff; border:1px solid rgba(0,0,0,0.07); border-radius: 16px; padding: 16px; transition: transform .12s ease, box-shadow .2s ease, border-color .2s ease; }
        .om-card:hover { transform: translateY(-3px); box-shadow: 0 16px 30px rgba(0,0,0,.06); border-color: rgba(0,0,0,.12); }
        .om-emoji { font-size: 22px; }
        .om-card h3 { margin: 6px 0 4px; font-size: 18px; font-weight: 800; color:#0f172a; }
        .om-card p { margin: 0 0 8px; color:#475569; font-size: 14.5px; line-height: 1.55; }
        .om-more { color:#1f6feb; font-weight:700; font-size:14px; }

        .om-cta-band { background: linear-gradient(0deg, #f7faff, #ffffff); border-top:1px solid rgba(0,0,0,.06); }
        .om-cta-inner { padding: 26px 0; display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: center; }
        .om-cta-title { margin:0; font-size: clamp(18px, 2.8vw, 24px); font-weight:800; color:#0f172a; }
        .om-cta-sub { margin:2px 0 0; color:#475569; }
        .om-cta-actions { display:flex; gap:10px; flex-wrap:wrap; }

        @media (max-width: 900px) { .om-cta-inner { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}

function Card({ to, emoji, title, copy }) {
  return (
    <Link to={to} className="om-card">
      <div className="om-emoji">{emoji}</div>
      <h3>{title}</h3>
      <p>{copy}</p>
      <span className="om-more">Learn more →</span>
    </Link>
  );
}
