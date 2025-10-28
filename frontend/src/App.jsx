import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import About from "./pages/navbar/About";
import Contact from "./pages/navbar/Contact";
import Auth from "./pages/navbar/Auth";

import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/app/Dashboard";
import Appointments from "./pages/app/appointments/Appointments";
import Assistant from "./pages/app/Assistant";
import Notes from "./pages/app/Notes";
import Settings from "./pages/app/Settings";
import Onboarding from "./pages/Onboarding";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />

        {/* Onboarding must be signed in */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="assistant" element={<Assistant />} />
                  <Route path="notes" element={<Notes />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
