import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isSignedIn } from "../lib/isSignedIn";

export default function ProtectedRoute({ children }) {
  const [ok, setOk] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const result = await isSignedIn();
      if (mounted) setOk(result);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (ok === null) {
    return <div style={{ height: "100vh" }} />;
  }

  if (!ok) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}
