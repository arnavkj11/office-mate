import '../../lib/amplify';
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signIn, signOut, signUp, confirmSignUp,
  resendSignUpCode, resetPassword, confirmResetPassword,
  fetchAuthSession, getCurrentUser
} from 'aws-amplify/auth';
import { api } from '../../api/client';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({ label, type="text", value, onChange, id, error, autoComplete, autoFocus=false }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="om-field">
      <label htmlFor={id} className="om-label">{label}</label>
      <div className="om-input-wrap">
        <input
          id={id}
          type={inputType}
          className={"om-input" + (error ? " om-input-error" : "")}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        {isPassword && (
          <button type="button" className="om-eye" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && <div id={`${id}-err`} className="om-err">{error}</div>}
    </div>
  );
}

export default function Auth() {
  const nav = useNavigate();

  async function postAuthRedirect() {
    try {
      const me = await api.me(); // { hasProfile, userId, profile? }
      if (me?.hasProfile) {
        nav('/app', { replace: true });
      } else {
        nav('/onboarding', { replace: true });
      }
    } catch {
      nav('/onboarding', { replace: true });
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { tokens } = await fetchAuthSession();
        if (tokens?.accessToken) await postAuthRedirect();
      } catch {}
    })();
  }, []);

  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const canEmail = useMemo(() => emailRegex.test(email), [email]);
  const canPwd   = useMemo(() => pwd.length >= 8, [pwd]);

  function go(next) { setErr(''); setMsg(''); setMode(next); }
  async function safe(fn) { setBusy(true); setErr(''); setMsg(''); try { await fn(); } catch (e) { setErr(e?.message || 'Request failed'); } finally { setBusy(false); } }

  async function doSignIn(e) {
    e.preventDefault();
    if (!canEmail || !canPwd) { setErr('Enter a valid email and password (min 8 chars).'); return; }
    await safe(async () => {
      await signIn({ username: email, password: pwd });
      await postAuthRedirect();
    });
  }

  async function doSignUp(e) {
    e.preventDefault();
    if (!canEmail || !canPwd) { setErr('Enter a valid email and password (min 8 chars).'); return; }
    await safe(async () => {
      await signUp({ username: email, password: pwd, options: { userAttributes: { email } }});
      setMsg('Verification code sent to your email.');
      setMode('confirm');
    });
  }

  async function doConfirm(e) {
    e.preventDefault();
    if (!canEmail || code.trim().length < 4) { setErr('Enter email and the verification code.'); return; }
    await safe(async () => {
      await confirmSignUp({ username: email, confirmationCode: code.trim() });
      await signIn({ username: email, password: pwd });
      await postAuthRedirect();
    });
  }

  async function doResend() {
    await safe(async () => {
      await resendSignUpCode({ username: email });
      setMsg('Code resent.');
    });
  }

  async function doForgot(e) {
    e.preventDefault();
    if (!canEmail) { setErr('Enter a valid email.'); return; }
    await safe(async () => {
      await resetPassword({ username: email });
      setMsg('Reset code sent.');
      setMode('forgotConfirm');
    });
  }

  async function doForgotConfirm(e) {
    e.preventDefault();
    if (!canEmail || !canPwd || code.trim().length < 4) { setErr('Fill all fields correctly.'); return; }
    await safe(async () => {
      await confirmResetPassword({ username: email, confirmationCode: code.trim(), newPassword: pwd });
      await signIn({ username: email, password: pwd });
      await postAuthRedirect();
    });
  }

  async function doWhoAmI() {
    await safe(async () => {
      const user = await getCurrentUser();
      const { tokens } = await fetchAuthSession();
      setMsg(`User: ${user?.username} • id: ${tokens?.idToken?.toString().slice(0,18)}…`);
    });
  }

  async function doSignOut() {
    await safe(async () => { await signOut(); setMsg('Signed out.'); });
  }

  return (
    <div className="om-auth">
      <div className="om-card">
        <h1 className="om-title">
          {mode === 'signin' ? 'Sign in' :
           mode === 'signup' ? 'Create account' :
           mode === 'confirm' ? 'Confirm email' :
           mode === 'forgot' ? 'Reset password' : 'Set new password'}
        </h1>

        {!!err && <div className="om-banner om-banner-err">{err}</div>}
        {!!msg && <div className="om-banner om-banner-ok">{msg}</div>}

        {mode === 'signin' && (
          <form onSubmit={doSignIn} className="om-form">
            <Field id="email" label="Email" value={email} onChange={setEmail} autoComplete="email" autoFocus
                   error={email && !canEmail ? "Invalid email" : ""} />
            <Field id="pwd" label="Password" type="password" value={pwd} onChange={setPwd}
                   autoComplete="current-password" error={pwd && !canPwd ? "Minimum 8 characters" : ""} />
            <button className="om-btn" type="submit" disabled={busy || !canEmail || !canPwd}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
            <div className="om-links">
              <button type="button" className="om-link" onClick={()=>go('signup')}>Create account</button>
              <button type="button" className="om-link" onClick={()=>go('forgot')}>Forgot password</button>
              <button type="button" className="om-link" onClick={doWhoAmI}>Who am I?</button>
              <button type="button" className="om-link" onClick={doSignOut}>Sign out</button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={doSignUp} className="om-form">
            <Field id="email" label="Email" value={email} onChange={setEmail} autoComplete="email" autoFocus
                   error={email && !canEmail ? "Invalid email" : ""} />
            <Field id="pwd" label="Password" type="password" value={pwd} onChange={setPwd}
                   autoComplete="new-password" error={pwd && !canPwd ? "Minimum 8 characters" : ""} />
            <button className="om-btn" type="submit" disabled={busy || !canEmail || !canPwd}>
              {busy ? 'Creating…' : 'Create account'}
            </button>
            <div className="om-links">
              <button type="button" className="om-link" onClick={()=>go('signin')}>Back to sign in</button>
            </div>
          </form>
        )}

        {mode === 'confirm' && (
          <form onSubmit={doConfirm} className="om-form">
            <Field id="email" label="Email" value={email} onChange={setEmail} autoComplete="email" autoFocus />
            <Field id="code" label="Verification code" value={code} onChange={setCode} autoComplete="one-time-code" />
            <button className="om-btn" type="submit" disabled={busy || !email || !code}>
              {busy ? 'Confirming…' : 'Confirm & continue'}
            </button>
            <div className="om-links">
              <button type="button" className="om-link" onClick={doResend}>Resend code</button>
              <button type="button" className="om-link" onClick={()=>go('signin')}>Back</button>
            </div>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={doForgot} className="om-form">
            <Field id="email" label="Email" value={email} onChange={setEmail} autoComplete="email" autoFocus
                   error={email && !canEmail ? "Invalid email" : ""} />
            <button className="om-btn" type="submit" disabled={busy || !canEmail}>
              {busy ? 'Sending…' : 'Send reset code'}
            </button>
            <div className="om-links">
              <button type="button" className="om-link" onClick={()=>go('signin')}>Back</button>
            </div>
          </form>
        )}

        {mode === 'forgotConfirm' && (
          <form onSubmit={doForgotConfirm} className="om-form">
            <Field id="email" label="Email" value={email} onChange={setEmail} autoComplete="email" />
            <Field id="code" label="Reset code" value={code} onChange={setCode} autoComplete="one-time-code" />
            <Field id="pwd" label="New password" type="password" value={pwd} onChange={setPwd}
                   autoComplete="new-password" error={pwd && !canPwd ? "Minimum 8 characters" : ""} />
            <button className="om-btn" type="submit" disabled={busy || !canEmail || !canPwd || !code}>
              {busy ? 'Updating…' : 'Update password'}
            </button>
            <div className="om-links">
              <button type="button" className="om-link" onClick={()=>go('signin')}>Back</button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .om-auth { min-height: calc(100dvh - 160px); display:flex; align-items:center; justify-content:center; padding:24px; }
        .om-card { width:100%; max-width:460px; background:#fff; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.08); padding:22px 20px; }
        .om-title { margin:0 0 12px; font-size:22px; font-weight:700; }
        .om-banner { padding:10px 12px; border-radius:10px; margin:10px 0; font-size:14px; }
        .om-banner-err { background:#fff4f4; color:#b40000; border:1px solid #ffd6d6; }
        .om-banner-ok  { background:#f4fff5; color:#116b2e; border:1px solid #c9f0d3; }
        .om-form { display:grid; gap:12px; margin-top:10px; }
        .om-field { display:grid; gap:6px; }
        .om-label { font-size:14px; color:#333; }
        .om-input-wrap { position:relative; }
        .om-input { width:100%; padding:10px 12px; border:1px solid #dcdcdc; border-radius:10px; font-size:14px; outline:none; }
        .om-input:focus { border-color:#7f9cf5; box-shadow:0 0 0 3px rgba(127,156,245,.25); }
        .om-input-error { border-color:#ff6b6b; }
        .om-eye { position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; font-size:16px; }
        .om-err { color:#b40000; font-size:12px; }
        .om-btn { width:100%; padding:10px 14px; background:#1f6feb; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; }
        .om-btn[disabled] { opacity:.6; cursor:not-allowed; }
        .om-links { display:flex; flex-wrap:wrap; gap:10px; margin-top:6px; }
        .om-link { background:none; border:none; padding:0; color:#1f6feb; cursor:pointer; font-size:14px; }
      `}</style>
    </div>
  );
}
