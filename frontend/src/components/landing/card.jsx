import React from "react";
import { Link } from "react-router-dom";

export default function Card({ to, emoji, title, copy }) {
  return (
    <Link to={to} className="om-card">
      <div className="om-emoji">{emoji}</div>
      <h3>{title}</h3>
      <p>{copy}</p>
      <span className="om-more">Learn more →</span>
    </Link>
  );
}
