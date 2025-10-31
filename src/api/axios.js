import axios from "axios";

const DEPLOYED_BASE_URL = `${
  import.meta.env.VITE_API_URL || "https://k-store-backend.onrender.com"
}/api`;
const LOCAL_BASE_URL = "http://localhost:5000/api";

const API = axios.create({
  baseURL: DEPLOYED_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// === Attach Access Token on Every Request ===
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// === Handle Expired Access Token ===
API.interceptors.response.use(
  (res) => res, // normal response
  async (err) => {
    const originalRequest = err.config;

    // If unauthorized (401) and we haven’t retried yet
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        // Call refresh endpoint
        const { data } = await axios.post(`${DEPLOYED_BASE_URL}/auth/refresh`, { refreshToken });

        // Save new tokens
        sessionStorage.setItem("token", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);

        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch (refreshErr) {
        console.error("🔒 Token refresh failed:", refreshErr.message);
        sessionStorage.clear();
        window.location.href = "/login"; // force re-login
      }
    }

    // If backend unavailable → fallback to localhost
    if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      const localAPI = axios.create({
        baseURL: LOCAL_BASE_URL,
        headers: { "Content-Type": "application/json" },
      });

      const token = sessionStorage.getItem("token");
      if (token) localAPI.defaults.headers.Authorization = `Bearer ${token}`;
      return localAPI(originalRequest);
    }

    return Promise.reject(err);
  }
);

export default API;
