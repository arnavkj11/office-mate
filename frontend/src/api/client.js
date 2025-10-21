import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const id = localStorage.getItem("om_id_token"); // send ID token to backend
  if (id) config.headers.Authorization = `Bearer ${id}`;
  return config;
});

export default api;
