import API from "./axios.js";

// ------------------ PRODUCTS ------------------

// Add product (vendor)
export const addProduct = async (productData) => {
  const res = await API.fallbackRequest("post", "/products", productData);
  return res.data;
};

// Admin: get all products
export const getAllProductsAdmin = async () => {
  const res = await API.fallbackRequest("get", "/admin/products");
  return res.data;
};

// Update product (admin)
export const updateProductAdmin = async (id, data) => {
  const res = await API.fallbackRequest("put", `/admin/products/${id}`, data);
  return res.data;
};

// Delete product (admin)
export const deleteProductAdmin = async (id) => {
  const res = await API.fallbackRequest("delete", `/admin/products/${id}`);
  return res.data;
};

// ------------------ AUTH ------------------

// Register user
export const registerUser = async (userData) => {
  const res = await API.fallbackRequest("post", "/auth/register", userData);
  return res.data;
};

// Login user
export const loginUser = async (email, password) => {
  const res = await API.fallbackRequest("post", "/auth/login", { email, password });
  return res.data;
};

// ------------------ ADMIN: Users Management ------------------

// Get all users (excluding admins)
export const getUsers = async () => {
  const res = await API.fallbackRequest("get", "/admin/users");
  return res.data;
};

// Update user role (customer <-> vendor)
export const updateUserRole = async (userId, role) => {
  const res = await API.fallbackRequest("put", `/admin/update-user-role/${userId}`, { role });
  return res.data;
};
