import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAuthSession, signOut } from "aws-amplify/auth";

import NavBar from "../components/NavBar";
import Hero from "../components/landing/hero";
import Features from "../components/landing/features";
import CTA from "../components/landing/cta";

import "../components/landing/theme.css";
import "../components/landing/landing.css";

export default function Landing() {
  const nav = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [theme, setTheme] = useState(
    () => window.localStorage.getItem("om-theme") || "light"
  );

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

  useEffect(() => {
    window.localStorage.setItem("om-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const onGetStarted = async () => {
    try {
      const { tokens } = await fetchAuthSession();
      nav(tokens?.accessToken ? "/app" : "/auth");
    } catch {
      nav("/auth");
    }
  };

  const onSignOut = async () => {
    await signOut();
    setAuthed(false);
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
        onSignOut={onSignOut}
      />

      <Features />

      <CTA checking={checking} authed={authed} onGetStarted={onGetStarted} />
    </div>
  );
}
