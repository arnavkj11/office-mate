import { fetchAuthSession } from "aws-amplify/auth";

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

async function authHeaders() {
  const { tokens } = await fetchAuthSession();
  const access = tokens?.accessToken?.toString();

  return {
    "Content-Type": "application/json",
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
  };
}

async function http(method, path, body) {
  const headers = await authHeaders();

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return null;
  }

  return res.json();
}

export const api = {
  get: (path) => http("GET", path),
  post: (path, body) => http("POST", path, body),

  me: () => http("GET", "/users/me"),
  bootstrap: (payload) => http("POST", "/users/bootstrap", payload),

  createAppointment: (payload) => http("POST", "/appointments", payload),
  listAppointments: () => http("GET", "/appointments"),

  assistantChat: (payload) => http("POST", "/assistant/chat", payload),
};

export default api;
