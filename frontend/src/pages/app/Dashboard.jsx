import React from "react";

export default function Dashboard() {
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

            <div className="db-metrics">
              <div className="db-metric">
                <div className="db-metric-num">0</div>
                <div className="db-metric-label">Appointments</div>
              </div>
              <div className="db-metric">
                <div className="db-metric-num">0</div>
                <div className="db-metric-label">Messages</div>
              </div>
              <div className="db-metric">
                <div className="db-metric-num">0</div>
                <div className="db-metric-label">AI Tasks</div>
              </div>
            </div>
          </div>
        </section>

        <section className="db-section">
          <div className="db-card">
            <div className="db-card-head">
              <h2 className="db-title">Upcoming</h2>
            </div>
            <p className="db-sub">Next meetings and reminders.</p>

            <div className="db-list">
              <div className="db-list-empty">
                No upcoming items yet.
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Styles */}
      <style>{`
        .db-shell {
          padding: 20px clamp(16px, 4vw, 32px);
        }

        .db-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .db-card {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 20px 22px;
          box-shadow: 0 10px 28px rgba(15,23,42,0.08);
        }

        .db-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .db-title {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .db-tag {
          font-size: 12px;
          background: #eef2ff;
          color: #4338ca;
          padding: 4px 8px;
          border-radius: 999px;
          font-weight: 600;
          border: 1px solid rgba(67,56,202,0.22);
        }

        .db-sub {
          margin: 0 0 14px;
          font-size: 14px;
          color: #64748b;
        }

        /* Metrics */
        .db-metrics {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .db-metric {
          background: #f8fafc;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.06);
          padding: 12px;
          text-align: center;
        }

        .db-metric-num {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
        }

        .db-metric-label {
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;
        }

        /* List */
        .db-list {
          margin-top: 10px;
        }

        .db-list-empty {
          padding: 16px;
          background: #f1f5f9;
          border-radius: 12px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        @media (max-width: 480px) {
          .db-metrics {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
