import axios from "axios";

const DEPLOYED_BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://k-store-backend.onrender.com"
}/api`;

const LOCAL_BASE_URL = "http://localhost:5000/api";

const API = axios.create({
  baseURL: DEPLOYED_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Helper: fallback to local if request fails
API.fallbackRequest = async (method, url, data = null) => {
  try {
    return await API({ method, url, data });
  } catch (err) {
    console.warn(`Deployed backend failed, trying localhost: ${err.message}`);
    const localAPI = axios.create({
      baseURL: LOCAL_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    const token = localStorage.getItem("token");
    if (token) localAPI.defaults.headers.Authorization = `Bearer ${token}`;

    return await localAPI({ method, url, data });
  }
};

export default API;
