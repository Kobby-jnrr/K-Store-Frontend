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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🟢 Request with access token →", config.url);
  } else {
    console.log("⚪ Request without token →", config.url);
  }
  return config;
});

// === Handle Expired Access Token ===
API.interceptors.response.use(
  (res) => res, // normal response
  async (err) => {
    const originalRequest = err.config;

    // Detect expired token
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      err.response.data?.message === "TokenExpired"
    ) {
      console.warn("⚠️ Access token expired! Trying to refresh...");
      originalRequest._retry = true;

      try {
        const refreshToken = sessionStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        console.log("🔄 Calling refresh endpoint...");
        const { data } = await API.post("/auth/refresh", { refreshToken });

        console.log("✅ Token refreshed successfully");
        console.log("🆕 New access token:", data.accessToken.slice(0, 20) + "...");

        // Save new tokens
        sessionStorage.setItem("token", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);

        // Update header and retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        console.log("🔁 Retrying original request:", originalRequest.url);
        return API(originalRequest);
      } catch (refreshErr) {
        console.error("🔒 Token refresh failed:", refreshErr.message);
        sessionStorage.clear();
        console.warn("🚪 Redirecting to login...");
        window.location.href = "/login";
      }
    }

    // Handle network fallback
    if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
      console.warn("🌐 Network issue, switching to localhost...");

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
