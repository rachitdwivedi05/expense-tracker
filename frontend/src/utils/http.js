import axios from "axios";

const baseURL =
  import.meta.env.VITE_BASE_URL ||
  "https://expense-tracker-1-38ik.onrender.com";

const http = axios.create({
  baseURL,
  withCredentials: true
});

export default http;
