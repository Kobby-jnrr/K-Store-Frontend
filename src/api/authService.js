import API from "./axios.js";

// ✅ Register user
export const registerUser = async (userData) => {
  try {
    const res = await API.post("/auth/register", userData);
    return res.data;
  } catch (err) {
    // fallback to localhost
    const localRes = await axios.post("http://localhost:5000/api/auth/register", userData);
    return localRes.data;
  }
};

// ✅ Login user
export const loginUser = async (email, password) => {
  try {
    const res = await API.post("/auth/login", { email, password });
    return res.data;
  } catch (err) {
    const localRes = await axios.post("http://localhost:5000/api/auth/login", { email, password });
    return localRes.data;
  }
};

/* ------------------ ADMIN: Users Management ------------------ */

// ✅ Get all users (excluding admins)
export const getUsers = async () => {
  try {
    const res = await API.get("/admin/users");
    return res.data;
  } catch (err) {
    const localRes = await axios.get("http://localhost:5000/api/admin/users");
    return localRes.data;
  }
};

// ✅ Update user role (customer <-> vendor)
export const updateUserRole = async (userId, role) => {
  try {
    const res = await API.put(`/admin/update-user-role/${userId}`, { role });
    return res.data;
  } catch (err) {
    const localRes = await axios.put(`http://localhost:5000/api/admin/update-user-role/${userId}`, { role });
    return localRes.data;
  }
};
