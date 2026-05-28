import axios from "axios";

// Vercel injects VITE_API_URL at build time, for example https://your-api.onrender.com.
const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.warn("VITE_API_URL is missing. API requests will use the current origin.");
}

const http = axios.create({
  baseURL: baseURL || "",
  withCredentials: true
});

export default http;
