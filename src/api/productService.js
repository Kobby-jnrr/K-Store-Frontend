import API from "./axios.js";
import axios from "axios";

/* ------------------ VENDOR ------------------ */
// Add product (vendor only)
export const addProduct = async (productData) => {
  try {
    const res = await API.post("/products", productData);
    return res.data;
  } catch (err) {
    const localRes = await axios.post("http://localhost:5000/api/products", productData);
    return localRes.data;
  }
};

/* ------------------ ADMIN: Product Management ------------------ */

// Get all products (admin)
export const getAllProductsAdmin = async () => {
  try {
    const res = await API.get("/admin/products");
    return res.data;
  } catch (err) {
    const localRes = await axios.get("http://localhost:5000/api/admin/products");
    return localRes.data;
  }
};

// Update a product (admin)
export const updateProductAdmin = async (id, data) => {
  try {
    const res = await API.put(`/admin/products/${id}`, data);
    return res.data;
  } catch (err) {
    const localRes = await axios.put(`http://localhost:5000/api/admin/products/${id}`, data);
    return localRes.data;
  }
};

// Delete a product (admin)
export const deleteProductAdmin = async (id) => {
  try {
    const res = await API.delete(`/admin/products/${id}`);
    return res.data;
  } catch (err) {
    const localRes = await axios.delete(`http://localhost:5000/api/admin/products/${id}`);
    return localRes.data;
  }
};
