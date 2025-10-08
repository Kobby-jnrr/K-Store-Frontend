import axios from "axios";

// ✅ Use Render backend as default, fallback to localhost only if unavailable
const API = axios.create({
  baseURL: `${
    import.meta.env.VITE_API_URL || "https://k-store-backend.onrender.com"
  }/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Register user
export const registerUser = async (userData) => {
  const res = await API.post("/auth/register", userData);
  return res.data;
};

// ✅ Login user (email + password)
export const loginUser = async (email, password) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};
