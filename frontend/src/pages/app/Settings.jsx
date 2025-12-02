import React from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    localStorage.removeItem("officeMateToken"); 
    localStorage.removeItem("officeMateUser"); 
    localStorage.clear();  // optional, clears all keys

    navigate("/login");
  };

  return (
    <div className="card" style={{ padding: "20px" }}>
      <b>Settings</b>
      <div className="small" style={{ marginBottom: "20px" }}>
        Calendar, Mail, Pinecone integration (coming soon).
      </div>

      <button
        onClick={handleSignOut}
        style={{
          padding: "10px 16px",
          background: "#e74c3c",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
