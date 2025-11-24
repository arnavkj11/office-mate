import React from "react";
import Card from "./card";

export default function Features() {
  return (
    <section className="om-section">
      <div className="om-wrap">
        <h2 className="om-h2">Everything in one command center</h2>
        <p className="om-h2-sub">
          Scheduling, notes and automation in a single workspace with an AI
          assistant on top.
        </p>

        <div className="om-grid">
          <Card
            emoji="📅"
            title="Smart scheduling"
            to="/features/appointments"
            copy="Create appointments, sync calendars, and automate confirmations in one flow."
          />
          <Card
            emoji="🤖"
            title="AI command bar"
            to="/features/assistant"
            copy="Ask OfficeMate to schedule, summarize, or draft follow ups in natural language."
          />
          <Card
            emoji="📝"
            title="Notes and history"
            to="/features/notes"
            copy="Capture structured notes during calls and surface key decisions instantly."
          />
          <Card
            emoji="🧩"
            title="Integrations"
            to="/features/integrations"
            copy="Connect calendars, email and messaging so your workflows stay aligned."
          />
          <Card
            emoji="🔒"
            title="Security first"
            to="/about"
            copy="Scoped access, safe storage and environment-based configuration by default."
          />
          <Card
            emoji="⚡"
            title="Focused interface"
            to="/about"
            copy="Clean layout that keeps teams on task so they act instead of configuring tools."
          />
        </div>
      </div>
    </section>
  );
}
