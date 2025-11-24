import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

export function useAuthStatus() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { tokens } = await fetchAuthSession();
        if (!cancelled) {
          setAuthed(!!tokens?.accessToken);
        }
      } catch {
        if (!cancelled) {
          setAuthed(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { checking, authed };
}
