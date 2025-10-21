import React from "react";

export default function About() {
  return (
    <div className="container section">
      <h1>About OfficeMate</h1>
      <p className="sub">
        OfficeMate brings together all your daily workflows into one intuitive,
        AI-driven platform. Our goal is simple — to make your workday lighter,
        faster, and smarter.
      </p>

      <ul style={{ marginTop: 16 }}>
        <li>Smart Scheduling with Google Calendar integration.</li>
        <li>AI Assistant that handles tasks through natural commands.</li>
        <li>Structured Notes and powerful search for instant recall.</li>
        <li>Seamless Integrations with Google, Mailjet, and more.</li>
        <li>Enterprise-grade Security with HTTPS and API key rotation.</li>
      </ul>

      <p style={{ marginTop: 16 }}>
        Built for teams and individuals who value simplicity and efficiency.
      </p>
    </div>
  );
}
