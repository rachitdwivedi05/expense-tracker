import axios from "axios";

// Vite exposes only VITE_* variables to the browser; Vercel injects this at build time.
const configuredApiUrl = import.meta.env.VITE_API_URL;

// Keep local development working, but never let production fall back to the Vercel origin.
const fallbackApiUrl = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://expense-tracker-5ak5.onrender.com";

const baseURL = (configuredApiUrl || fallbackApiUrl).replace(/\/+$/, "");

const http = axios.create({
  baseURL,
  withCredentials: true
});

export default http;
