import axios from "axios";

// ✅ Use Render backend as default, fallback to localhost for dev
const API = axios.create({
  baseURL: `${
    import.meta.env.VITE_API_URL || "https://k-store-backend.onrender.com"
  }/api`,
});

// ✅ Add product (vendor only)
export const addProduct = async (productData) => {
  const token = localStorage.getItem("token"); // Get vendor's token
  const res = await API.post("/products", productData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};
