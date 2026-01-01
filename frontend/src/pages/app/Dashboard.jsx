import React, { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";

function ymdLocal(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [counts, setCounts] = useState({ confirmed: 0, pending: 0, total: 0 });
  const [upcoming, setUpcoming] = useState([]);

  const tz = "Asia/Singapore";
  const date = useMemo(() => ymdLocal(now), [now]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.appointmentSummary(date, tz);
      setCounts(res?.counts || { confirmed: 0, pending: 0, total: 0 });
      setUpcoming(res?.upcoming || []);
    } catch (e) {
      setCounts({ confirmed: 0, pending: 0, total: 0 });
      setUpcoming([]);
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("appointments:changed", onChanged);
    return () => window.removeEventListener("appointments:changed", onChanged);
  }, [date]);

  return (
    <div className="db-shell">
      <div className="db-grid">
        <section className="db-section">
          <div className="db-card">
            <div className="db-card-head">
              <h2 className="db-title">Today</h2>
              <span className="db-tag">Live</span>
            </div>
            <p className="db-sub">Quick snapshot of your day.</p>

            {error ? <div className="db-error">{error}</div> : null}
            {loading ? <div className="db-loading">Loading…</div> : null}

            <div className="db-metrics">
              <div className="db-metric">
                <div className="db-metric-num">{counts.confirmed}</div>
                <div className="db-metric-label">Confirmed</div>
              </div>
              <div className="db-metric">
                <div className="db-metric-num">{counts.pending}</div>
                <div className="db-metric-label">Pending</div>
              </div>
              <div className="db-metric">
                <div className="db-metric-num">{counts.total}</div>
                <div className="db-metric-label">Total today</div>
              </div>
            </div>

            <div className="db-actions">
              <button className="db-btn" onClick={load}>Refresh</button>
              <button className="db-btn" onClick={() => navigate("/app/appointments")}>
                View details
              </button>
            </div>
          </div>
        </section>

        <section className="db-section">
          <div className="db-card">
            <div className="db-card-head">
              <h2 className="db-title">Upcoming Appointments</h2>
              <div className="db-head-actions">
                <button className="db-btn" onClick={load}>Refresh</button>
                <button className="db-btn" onClick={() => navigate("/app/appointments")}>
                  View details
                </button>
              </div>
            </div>
            <p className="db-sub">What’s left for the day.</p>

            <div className="db-list">
              {upcoming.length === 0 ? (
                <div className="db-list-empty">No appointments today!</div>
              ) : (
                upcoming.map((a) => {
                  const dt = a?.startTime || a?.date || null;
                  const time = dt ? format(parseISO(dt), "h:mm a") : "—";
                  const who =
                    (a?.clientName && a.clientName.trim()) ||
                    (a?.inviteeEmail && a.inviteeEmail.trim()) ||
                    "client";
                  const title = a?.title || "Appointment";
                  const status = (a?.status || "pending").toString().toLowerCase();

                  return (
                    <div key={a.appointmentId} className="db-list-item">
                      <div className="db-list-top">
                        <div className="db-list-title">{title}</div>
                        <span className={`db-pill ${status}`}>{status}</span>
                      </div>
                      <div className="db-list-subrow">
                        <span className="db-list-time">{time}</span>
                        <span className="db-list-dot">•</span>
                        <span className="db-list-client">{who}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .db-shell { padding: 20px clamp(16px, 4vw, 32px); }
        .db-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }

        .db-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 20px 22px;
          box-shadow: 0 10px 28px rgba(15,23,42,0.08);
        }

        .db-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 12px; }
        .db-head-actions { display: flex; gap: 10px; align-items: center; }
        .db-title { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.01em; }

        .db-tag {
          font-size: 12px;
          background: #eef2ff;
          color: #4338ca;
          padding: 4px 8px;
          border-radius: 999px;
          font-weight: 600;
          border: 1px solid rgba(67,56,202,0.22);
          white-space: nowrap;
        }

        .db-sub { margin: 0 0 14px; font-size: 14px; color: #64748b; }

        .db-error {
          background: #fff1f2;
          border: 1px solid rgba(225,29,72,0.25);
          color: #9f1239;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: 10px;
          white-space: pre-wrap;
        }

        .db-loading { color: #475569; font-size: 13px; margin-bottom: 10px; }

        .db-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .db-metric { background: #f8fafc; border-radius: 14px; border: 1px solid rgba(0,0,0,0.06); padding: 12px; text-align: center; }
        .db-metric-num { font-size: 22px; font-weight: 800; color: #0f172a; }
        .db-metric-label { font-size: 12px; color: #64748b; margin-top: 4px; }

        .db-actions { display: flex; gap: 10px; margin-top: 14px; }

        .db-btn {
          border: 1px solid rgba(0,0,0,0.10);
          background: #ffffff;
          border-radius: 10px;
          padding: 8px 10px;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
          cursor: pointer;
          white-space: nowrap;
        }

        .db-btn:hover { background: #f8fafc; }

        .db-list { margin-top: 10px; display: grid; gap: 10px; }
        .db-list-empty { padding: 16px; background: #f1f5f9; border-radius: 12px; text-align: center; color: #64748b; font-size: 14px; font-weight: 700; }
        .db-list-item { border: 1px solid rgba(0,0,0,0.06); background: #f8fafc; border-radius: 14px; padding: 12px; }
        .db-list-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
        .db-list-title { font-weight: 800; color: #0f172a; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .db-list-subrow { margin-top: 6px; font-size: 13px; color: #475569; display: flex; align-items: center; gap: 8px; }
        .db-list-dot { opacity: 0.6; }

        .db-pill {
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.10);
          text-transform: capitalize;
          white-space: nowrap;
          background: #ffffff;
          color: #0f172a;
        }

        .db-pill.confirmed { background: #ecfdf5; border-color: rgba(16,185,129,0.35); color: #047857; }
        .db-pill.pending { background: #fff7ed; border-color: rgba(249,115,22,0.35); color: #9a3412; }
        .db-pill.cancelled { background: #f1f5f9; border-color: rgba(100,116,139,0.35); color: #334155; }
        .db-pill.tentative { background: #eff6ff; border-color: rgba(59,130,246,0.35); color: #1d4ed8; }

        @media (max-width: 480px) {
          .db-metrics { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
