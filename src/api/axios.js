import axios from "axios";

// ✅ Use Render backend as default, fallback to localhost for development
const API = axios.create({
  baseURL: `${
    import.meta.env.VITE_API_URL || "https://k-store-backend.onrender.com"
  }/api`,
});

// ✅ Automatically attach token to every request (if exists)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
