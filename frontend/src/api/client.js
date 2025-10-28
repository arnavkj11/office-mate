import { fetchAuthSession } from "aws-amplify/auth";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function authHeaders() {
  const { tokens } = await fetchAuthSession();

  const access = tokens?.accessToken?.toString();
  console.log("🔑 ACCESS TOKEN:", access); // <-- shows full token in console

  return {
    "Content-Type": "application/json",
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  };
}

async function http(method, path, body) {
  const headers = await authHeaders();

  if (body) console.log("📤 API REQUEST:", method, path, body);
  else console.log("📤 API REQUEST:", method, path);

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("❌ API ERROR:", method, path, res.status, msg);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    console.log("✅ API SUCCESS (no content):", method, path);
    return null;
  }

  const data = await res.json();
  console.log("✅ API RESPONSE:", method, path, data);
  return data;
}

export const api = {
  me: () => http("GET", "/api/users/me"),
  bootstrap: (payload) => http("POST", "/api/users/bootstrap", payload),
};
