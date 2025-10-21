import React from "react";

export default function AppointmentList({ items }) {
  if (!items?.length) return <div className="card">No appointments yet</div>;

  return (
    <div className="grid2">
      {items.map((a) => (
        <div key={a.id} className="card">
          <div style={{ fontWeight: 600 }}>{a.title}</div>
          <div className="small">
            {new Date(a.start_time).toLocaleString()} →{" "}
            {new Date(a.end_time).toLocaleString()}
          </div>
          <div className="small">{a.email}</div>
          {a.location && <div className="small">Location {a.location}</div>}
          {a.notes && <div className="small">Notes {a.notes}</div>}
        </div>
      ))}
    </div>
  );
}
