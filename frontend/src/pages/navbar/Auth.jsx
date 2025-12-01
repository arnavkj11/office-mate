import "../../lib/amplify";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  fetchAuthSession,
  getCurrentUser,
} from "aws-amplify/auth";
import { api } from "../../api/client";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({
  label,
  type = "text",
  value,
  onChange,
  id,
  error,
  autoComplete,
  autoFocus = false,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label}
      </label>
      <div className="auth-input-wrap">
        <input
          id={id}
          type={inputType}
          className={"auth-input" + (error ? " auth-input-error" : "")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-eye"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "🙈" : "👁️"}
          </button>
        )}
      </div>
      {error && (
        <div id={`${id}-err`} className="auth-err">
          {error}
        </div>
      )}
    </div>
  );
}

export default function Auth() {
  const nav = useNavigate();

  async function postAuthRedirect() {
    try {
      const me = await api.me();
      const hasProfile = me?.hasProfile ?? !!me?.defaultBusinessId;
      if (hasProfile) {
        nav("/app", { replace: true });
      } else {
        nav("/onboarding", { replace: true });
      }
    } catch {
      nav("/onboarding", { replace: true });
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const { tokens } = await fetchAuthSession();
        if (tokens?.accessToken) await postAuthRedirect();
      } catch {
        // ignore
      }
    })();
  }, []);

  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const canEmail = useMemo(() => emailRegex.test(email), [email]);
  const canPwd = useMemo(() => pwd.length >= 8, [pwd]);

  function go(next) {
    setErr("");
    setMsg("");
    setMode(next);
  }

  async function safe(fn) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await fn();
    } catch (e) {
      setErr(e?.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function doSignIn(e) {
    e.preventDefault();
    if (!canEmail || !canPwd) {
      setErr("Enter a valid email and password with at least 8 characters.");
      return;
    }
    await safe(async () => {
      await signIn({ username: email, password: pwd });
      await postAuthRedirect();
    });
  }

  async function doSignUp(e) {
    e.preventDefault();
    if (!canEmail || !canPwd) {
      setErr("Enter a valid email and password with at least 8 characters.");
      return;
    }
    await safe(async () => {
      await signUp({
        username: email,
        password: pwd,
        options: { userAttributes: { email } },
      });
      setMsg("Verification code sent to your email.");
      setMode("confirm");
    });
  }

  async function doConfirm(e) {
    e.preventDefault();
    if (!canEmail || code.trim().length < 4) {
      setErr("Enter your email and the verification code.");
      return;
    }
    await safe(async () => {
      await confirmSignUp({ username: email, confirmationCode: code.trim() });
      await signIn({ username: email, password: pwd });
      await postAuthRedirect();
    });
  }

  async function doResend() {
    await safe(async () => {
      await resendSignUpCode({ username: email });
      setMsg("Code resent.");
    });
  }

  async function doForgot(e) {
    e.preventDefault();
    if (!canEmail) {
      setErr("Enter a valid email.");
      return;
    }
    await safe(async () => {
      await resetPassword({ username: email });
      setMsg("Reset code sent to your email.");
      setMode("forgot");
      setMode("forgotConfirm");
    });
  }

  async function doForgotConfirm(e) {
    e.preventDefault();
    if (!canEmail || !canPwd || code.trim().length < 4) {
      setErr("Fill all fields correctly.");
      return;
    }
    await safe(async () => {
      await confirmResetPassword({
        username: email,
        confirmationCode: code.trim(),
        newPassword: pwd,
      });
      await signIn({ username: email, password: pwd });
      await postAuthRedirect();
    });
  }

  async function doWhoAmI() {
    await safe(async () => {
      const user = await getCurrentUser();
      const { tokens } = await fetchAuthSession();
      setMsg(
        `User: ${user?.username} • id: ${String(
          tokens?.idToken
        ).slice(0, 18)}…`
      );
    });
  }

  async function doSignOut() {
    await safe(async () => {
      await signOut();
      setMsg("Signed out.");
    });
  }

  const isPrimaryMode = mode === "signin" || mode === "signup";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand">
            <img
              src="/mainlogo.png"
              alt="OfficeMate"
              className="auth-logo"
            />
            <div>
              <div className="auth-brand-name">OfficeMate</div>
              <div className="auth-brand-sub">
                Centralize your scheduling and AI workflows.
              </div>
            </div>
          </div>

          {isPrimaryMode && (
            <div className="auth-tabs">
              <button
                type="button"
                className={
                  "auth-tab" + (mode === "signin" ? " auth-tab-active" : "")
                }
                onClick={() => go("signin")}
              >
                Sign in
              </button>
              <button
                type="button"
                className={
                  "auth-tab" + (mode === "signup" ? " auth-tab-active" : "")
                }
                onClick={() => go("signup")}
              >
                Create account
              </button>
            </div>
          )}
        </div>

        {!isPrimaryMode && (
          <div className="auth-mode-title">
            <h1 className="auth-title">
              {mode === "confirm"
                ? "Confirm your email"
                : mode === "forgot"
                ? "Reset password"
                : "Set new password"}
            </h1>
            <p className="auth-sub">
              {mode === "confirm" &&
                "Enter the code we sent to your email to finish setup."}
              {mode === "forgot" &&
                "Enter your email and we will send you a reset code."}
              {mode === "forgotConfirm" &&
                "Enter the code and your new password to sign in again."}
            </p>
          </div>
        )}

        {isPrimaryMode && (
          <>
            <h1 className="auth-title">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="auth-sub">
              {mode === "signin"
                ? "Sign in to open your workspace and continue where you left off."
                : "Use a work email if you want teammates to join later."}
            </p>
          </>
        )}

        {!!err && <div className="auth-banner auth-banner-err">{err}</div>}
        {!!msg && <div className="auth-banner auth-banner-ok">{msg}</div>}

        {mode === "signin" && (
          <form onSubmit={doSignIn} className="auth-form">
            <Field
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              autoFocus
              error={email && !canEmail ? "Enter a valid email." : ""}
            />
            <Field
              id="pwd"
              label="Password"
              type="password"
              value={pwd}
              onChange={setPwd}
              autoComplete="current-password"
              error={
                pwd && !canPwd ? "Password must be at least 8 characters." : ""
              }
            />
            <button
              className="auth-btn"
              type="submit"
              disabled={busy || !canEmail || !canPwd}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <div className="auth-links-row">
              <button
                type="button"
                className="auth-link"
                onClick={() => go("forgot")}
              >
                Forgot password
              </button>
              <button
                type="button"
                className="auth-link"
                onClick={() => go("signup")}
              >
                Create account
              </button>
            </div>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={doSignUp} className="auth-form">
            <Field
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              autoFocus
              error={email && !canEmail ? "Enter a valid email." : ""}
            />
            <Field
              id="pwd"
              label="Password"
              type="password"
              value={pwd}
              onChange={setPwd}
              autoComplete="new-password"
              error={
                pwd && !canPwd ? "Password must be at least 8 characters." : ""
              }
            />
            <button
              className="auth-btn"
              type="submit"
              disabled={busy || !canEmail || !canPwd}
            >
              {busy ? "Creating…" : "Create account"}
            </button>
            <div className="auth-links-row">
              <button
                type="button"
                className="auth-link"
                onClick={() => go("signin")}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {mode === "confirm" && (
          <form onSubmit={doConfirm} className="auth-form">
            <Field
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              autoFocus
            />
            <Field
              id="code"
              label="Verification code"
              value={code}
              onChange={setCode}
              autoComplete="one-time-code"
            />
            <button
              className="auth-btn"
              type="submit"
              disabled={busy || !email || !code}
            >
              {busy ? "Confirming…" : "Confirm and continue"}
            </button>
            <div className="auth-links-row">
              <button
                type="button"
                className="auth-link"
                onClick={doResend}
              >
                Resend code
              </button>
              <button
                type="button"
                className="auth-link"
                onClick={() => go("signin")}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={doForgot} className="auth-form">
            <Field
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              autoFocus
              error={email && !canEmail ? "Enter a valid email." : ""}
            />
            <button
              className="auth-btn"
              type="submit"
              disabled={busy || !canEmail}
            >
              {busy ? "Sending…" : "Send reset code"}
            </button>
            <div className="auth-links-row">
              <button
                type="button"
                className="auth-link"
                onClick={() => go("signin")}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

        {mode === "forgotConfirm" && (
          <form onSubmit={doForgotConfirm} className="auth-form">
            <Field
              id="email"
              label="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
            />
            <Field
              id="code"
              label="Reset code"
              value={code}
              onChange={setCode}
              autoComplete="one-time-code"
            />
            <Field
              id="pwd"
              label="New password"
              type="password"
              value={pwd}
              onChange={setPwd}
              autoComplete="new-password"
              error={
                pwd && !canPwd ? "Password must be at least 8 characters." : ""
              }
            />
            <button
              className="auth-btn"
              type="submit"
              disabled={busy || !canEmail || !canPwd || !code}
            >
              {busy ? "Updating…" : "Update password and sign in"}
            </button>
            <div className="auth-links-row">
              <button
                type="button"
                className="auth-link"
                onClick={() => go("signin")}
              >
                Back to sign in
              </button>
            </div>
          </form>
        )}

        <div className="auth-dev">
          <div className="auth-dev-label">Developer tools</div>
          <div className="auth-dev-row">
            <button
              type="button"
              className="auth-link"
              onClick={doWhoAmI}
            >
              Who am I
            </button>
            <button
              type="button"
              className="auth-link"
              onClick={doSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .auth-shell {
          min-height: calc(100dvh - 160px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(900px 600px at 0% 0%, rgba(37,99,235,0.12), transparent 60%),
            radial-gradient(900px 600px at 100% 100%, rgba(56,189,248,0.12), transparent 60%),
            #f3f4f6;
        }

        .auth-card {
          width: 100%;
          max-width: 520px;
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 18px 40px rgba(15,23,42,0.14);
          padding: 22px 22px 16px;
        }

        @media (max-width: 640px) {
          .auth-card {
            padding: 18px 16px 14px;
            border-radius: 16px;
          }
        }

        .auth-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .auth-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .auth-logo {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          object-fit: contain;
        }

        .auth-brand-name {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .auth-brand-sub {
          font-size: 11px;
          color: #9ca3af;
        }

        .auth-tabs {
          display: inline-flex;
          padding: 2px;
          border-radius: 999px;
          background: #f3f4ff;
          border: 1px solid #e5e7eb;
          gap: 2px;
        }

        .auth-tab {
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 999px;
          cursor: pointer;
          color: #4b5563;
        }

        .auth-tab-active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 1px 4px rgba(15,23,42,0.12);
        }

        .auth-mode-title {
          margin-bottom: 6px;
        }

        .auth-title {
          margin: 2px 0 4px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0f172a;
        }

        .auth-sub {
          margin: 0 0 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .auth-banner {
          padding: 10px 12px;
          border-radius: 10px;
          margin: 10px 0 10px;
          font-size: 13px;
        }

        .auth-banner-err {
          background: #fff4f4;
          color: #b40000;
          border: 1px solid #ffd6d6;
        }

        .auth-banner-ok {
          background: #f4fff5;
          color: #116b2e;
          border: 1px solid #c9f0d3;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 4px;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auth-label {
          font-size: 13px;
          color: #374151;
          font-weight: 600;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input {
          width: 100%;
          height: 40px;
          padding: 0 12px 0 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          color: #111827;
          background: #ffffff;
          transition: border-color 0.12s ease, box-shadow 0.12s ease;
        }

        .auth-input::placeholder {
          color: #9ca3af;
        }

        .auth-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.2);
        }

        .auth-input-error {
          border-color: #f97373;
        }

        .auth-eye {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 16px;
        }

        .auth-err {
          font-size: 11px;
          color: #b40000;
        }

        .auth-btn {
          margin-top: 4px;
          width: 100%;
          height: 42px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #60a5fa);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 24px rgba(37,99,235,0.35);
          transition: filter 0.12s ease, transform 0.08s ease, box-shadow 0.12s ease;
        }

        .auth-btn:hover:not([disabled]) {
          filter: brightness(0.98);
          box-shadow: 0 14px 32px rgba(37,99,235,0.4);
          transform: translateY(-1px);
        }

        .auth-btn:active:not([disabled]) {
          transform: translateY(0);
          box-shadow: 0 8px 18px rgba(37,99,235,0.32);
        }

        .auth-btn[disabled] {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
        }

        .auth-links-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .auth-link {
          border: none;
          background: transparent;
          padding: 0;
          font-size: 13px;
          font-weight: 500;
          color: #2563eb;
          cursor: pointer;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .auth-dev {
          margin-top: 14px;
          padding-top: 10px;
          border-top: 1px dashed #e5e7eb;
        }

        .auth-dev-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #9ca3af;
          margin-bottom: 4px;
        }

        .auth-dev-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .auth-shell {
            padding: 16px;
          }

          .auth-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .auth-tabs {
            align-self: flex-start;
          }

          .auth-links-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
