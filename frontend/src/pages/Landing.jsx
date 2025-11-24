import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";

import { useAuthStatus } from "../lib/useAuthStatus";

import NavBar from "../components/NavBar";
import Hero from "../components/landing/hero";
import Features from "../components/landing/features";
import CTA from "../components/landing/cta";

import "../components/landing/theme.css";
import "../components/landing/landing.css";

export default function Landing() {
  const nav = useNavigate();

  // single source of truth for auth
  const { checking, authed } = useAuthStatus();

  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("om-theme") || "light"
  );

  useEffect(() => {
    window.localStorage.setItem("om-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const onGetStarted = () => {
    if (checking) return;              // avoid decisions while still loading
    nav(authed ? "/app" : "/auth");
  };

  const onSignOut = async () => {
    await signOut();
    nav("/", { replace: true });
  };

  return (
    <div className={`om-landing ${theme}`}>
      <NavBar />
      {/* spacer for fixed navbar */}
      <div style={{ height: 78 }} />

      <Hero
        theme={theme}
        toggleTheme={toggleTheme}
        checking={checking}
        authed={authed}
        onGetStarted={onGetStarted}
      />

      <Features />

      <CTA
        checking={checking}
        authed={authed}
        onGetStarted={onGetStarted}
      />
    </div>
  );
}
