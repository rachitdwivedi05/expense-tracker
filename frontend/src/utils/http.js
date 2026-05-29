import axios from "axios";

// Vite exposes only VITE_* variables to the browser; Vercel injects this at build time.
const configuredApiUrl = import.meta.env.VITE_API_URL;

// Keep local development working, but never let production fall back to the Vercel origin.
const fallbackApiUrl = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://expense-tracker-5ak5.onrender.com";

export const API_BASE_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, "");

// Builds absolute backend URLs so Vercel never handles API requests as frontend routes.
export const apiUrl = (path) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const http = axios.create({
  baseURL: API_BASE_URL,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const hasAuthorization =
    config.headers?.Authorization ||
    config.headers?.authorization ||
    (typeof config.headers?.get === "function" && config.headers.get("Authorization"));

  if (token && !hasAuthorization) {
    if (typeof config.headers?.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  return config;
});

export default http;
