import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { isSignedIn } from "../lib/isSignedIn";

export default function ProtectedRoute({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    (async () => setOk(await isSignedIn()))();
  }, []);

  if (ok === null) return null;           // or a tiny spinner
  if (!ok) return <Navigate to="/auth" replace />;
  return children;
}
