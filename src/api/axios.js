import axios from "axios";

// Base URLs
const DEPLOYED_BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://k-store-backend.onrender.com"
}/api`;
const LOCAL_BASE_URL = "http://localhost:5000/api";

// Create main Axios instance
const API = axios.create({
  baseURL: DEPLOYED_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Automatically attach token from sessionStorage
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); // use sessionStorage consistently
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper: fallback to local if deployed request fails
API.fallbackRequest = async (method, url, data = null) => {
  try {
    return await API({ method, url, data });
  } catch (err) {
    console.warn(`Deployed backend failed, trying localhost: ${err.message}`);

    const localAPI = axios.create({
      baseURL: LOCAL_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    // Attach token to local request as well
    localAPI.interceptors.request.use((config) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return await localAPI({ method, url, data });
  }
};

export default API;
