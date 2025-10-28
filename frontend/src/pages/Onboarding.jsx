import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Onboarding() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function submit(e) {
    e.preventDefault();
    setErr(""); setOk(""); setBusy(true);
    try {
      if (!name.trim()) throw new Error("Name is required");
      if (!email.trim()) throw new Error("Email is required");
      if (!businessName.trim()) throw new Error("Business name is required");

      await api.bootstrap({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || "",
        location: location.trim() || "",
        businessName: businessName.trim(),
      });

      setOk("Saved");
      nav("/app", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ob-shell">
      <div className="ob-card">
        <h1 className="ob-title">Finish setup</h1>
        <p className="ob-sub">Tell us about you and your business.</p>

        {err && <div className="ob-banner err">{err}</div>}
        {ok && <div className="ob-banner ok">{ok}</div>}

        <form onSubmit={submit} className="ob-form">
          <label className="ob-label">Full Name</label>
          <input className="ob-input" value={name} onChange={e=>setName(e.target.value)} autoFocus />

          <label className="ob-label">Business Name</label>
          <input className="ob-input" value={businessName} onChange={e=>setBusinessName(e.target.value)} />

          <label className="ob-label">Email</label>
          <input className="ob-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} />

          <label className="ob-label">Phone (optional)</label>
          <input className="ob-input" value={phone} onChange={e=>setPhone(e.target.value)} />

          <label className="ob-label">Location (optional)</label>
          <input className="ob-input" value={location} onChange={e=>setLocation(e.target.value)} />

          <button
            className="ob-btn"
            type="submit"
            disabled={busy || !name.trim() || !email.trim() || !businessName.trim()}
          >
            {busy ? "Saving…" : "Save and continue"}
          </button>
        </form>
      </div>

      <style>{`
        .ob-shell{min-height:calc(100dvh - 160px);display:flex;align-items:center;justify-content:center;padding:24px}
        .ob-card{width:100%;max-width:520px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 8px 20px rgba(2,8,23,.06);padding:20px}
        .ob-title{margin:0;font-weight:800;font-size:22px}
        .ob-sub{margin:6px 0 14px;color:#667085;font-size:13px}
        .ob-banner{padding:10px 12px;border-radius:10px;margin:10px 0;font-size:14px}
        .ob-banner.err{background:#fff4f4;color:#b40000;border:1px solid #ffd6d6}
        .ob-banner.ok{background:#f4fff5;color:#116b2e;border:1px solid #c9f0d3}
        .ob-form{display:grid;gap:10px}
        .ob-label{font-size:13px;color:#333}
        .ob-input{height:38px;padding:0 12px;border:1px solid #dcdcdc;border-radius:10px}
        .ob-input:focus{outline:none;border-color:#7f9cf5;box-shadow:0 0 0 3px rgba(127,156,245,.25)}
        .ob-btn{height:40px;border:none;border-radius:10px;background:linear-gradient(135deg,#2563eb,#60a5fa);color:#fff;font-weight:700;cursor:pointer}
        .ob-btn[disabled]{opacity:.6;cursor:not-allowed}
      `}</style>
    </div>
  );
}
