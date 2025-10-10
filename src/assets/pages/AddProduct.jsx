import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./AddProduct.css";

const VendorProducts = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });

  const categories = [
    "fashion", "electronics", "home", "grocery",
    "baby", "beauty", "sports", "gaming"
  ];

  // ----------------------------- Load vendor -----------------------------
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!user || user.role !== "vendor") {
      toast.error("❌ Access Denied! Only vendors can manage products.");
      navigate("/");
    } else {
      setVendor({ ...user, token });
      fetchProducts(token);
    }
  }, [navigate]);

  // ----------------------------- Fetch vendor products (with fallback) -----------------------------
  const fetchProducts = async (token) => {
    try {
      console.log("🌍 Trying Render backend...");
      const res = await axios.get(
        "https://k-store-backend.onrender.com/api/products/vendor",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Products loaded from Render:", res.data);
      setProducts(res.data);
    } catch (err) {
      console.warn("❌ Render backend failed:", err.message);
      console.log("🔁 Trying localhost backend...");
      try {
        const localRes = await axios.get(
          "http://localhost:5000/api/products/vendor",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Products loaded from localhost:", localRes.data);
        setProducts(localRes.data);
      } catch (localErr) {
        console.error("🔥 Both backends failed:", localErr.message);
        toast.error("Failed to load your products.");
      }
    }
  };

  // ----------------------------- Add new product -----------------------------
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.category || !formData.image) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const productData = {
      ...formData,
      vendorName: vendor.username,
      vendorVerified: vendor.verified,
    };

    try {
      await axios.post(
        "https://k-store-backend.onrender.com/api/products",
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("✅ Product added!");
      setFormData({ title: "", price: "", category: "", description: "", image: "" });
      fetchProducts(token);
    } catch (err) {
      console.warn("Render add failed, trying localhost...");
      try {
        await axios.post(
          "http://localhost:5000/api/products",
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("✅ Product added (local)!");
        setFormData({ title: "", price: "", category: "", description: "", image: "" });
        fetchProducts(token);
      } catch (err2) {
        console.error("Both add attempts failed:", err2.message);
        toast.error("Failed to add product.");
      }
    }
  };

  // ----------------------------- Edit Product -----------------------------
  const openEdit = (product) => {
    setEditingProduct(product);
    setEditData({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
      image: product.image,
    });
  };

  const saveEdit = async () => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      const res = await axios.put(
        `https://k-store-backend.onrender.com/api/products/${editingProduct._id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.map((p) => (p._id === editingProduct._id ? res.data.product : p)));
      setEditingProduct(null);
      toast.success("✅ Product updated!");
    } catch (err) {
      console.warn("Render update failed, trying localhost...");
      try {
        const localRes = await axios.put(
          `http://localhost:5000/api/products/${editingProduct._id}`,
          editData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(
          products.map((p) =>
            p._id === editingProduct._id ? localRes.data.product : p
          )
        );
        setEditingProduct(null);
        toast.success("✅ Product updated (local)!");
      } catch (err2) {
        console.error("Both update attempts failed:", err2.message);
        toast.error("Failed to update product.");
      }
    }
  };

  // ----------------------------- Delete Product -----------------------------
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      await axios.delete(
        `https://k-store-backend.onrender.com/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter((p) => p._id !== id));
      toast.success("🗑️ Product deleted!");
    } catch (err) {
      console.warn("Render delete failed, trying localhost...");
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(products.filter((p) => p._id !== id));
        toast.success("🗑️ Product deleted (local)!");
      } catch (err2) {
        console.error("Both delete attempts failed:", err2.message);
        toast.error("Failed to delete product.");
      }
    }
  };

  // ----------------------------- Render UI -----------------------------
  if (!vendor) return <div className="loader">Loading...</div>;

  return (
    <div className="vendor-products-page">
      <Toaster position="top-right" />
      <h2 className="addhead">
        Manage Products by {vendor.username} {vendor.verified && "✅"}
      </h2>

      <div className="products-container">
        {/* ---------- Add Product Section ---------- */}
        <div className="half-section add-product">
          <form className="vendor-form" onSubmit={handleAddProduct}>
            <h3>Add Product</h3>
            <input
              name="title"
              placeholder="Product Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <input
              name="image"
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
            />
            <textarea
              name="description"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <button type="submit" className="add-product-button">
              Add Product
            </button>
          </form>
        </div>

        {/* ---------- Product List Section ---------- */}
        <div className="half-section edit-products">
          <h3>Your Products</h3>
          <div className="products-list">
            {products.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              products.map((p) => (
                <div key={p._id} className="product-card">
                  <img src={p.image} alt={p.title} className="product-img" />
                  <h4>{p.title}</h4>
                  <p>GH₵{p.price}</p>
                  <p>{p.category}</p>
                  <div className="product-actions">
                    <button onClick={() => openEdit(p)}>Edit</button>
                    <button onClick={() => deleteProduct(p._id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ---------- Edit Modal ---------- */}
          {editingProduct && (
            <div className="edit-form">
              <h4>Editing: {editingProduct.title}</h4>
              <input
                name="title"
                value={editData.title}
                onChange={(e) =>
                  setEditData({ ...editData, title: e.target.value })
                }
              />
              <input
                name="price"
                type="number"
                value={editData.price}
                onChange={(e) =>
                  setEditData({ ...editData, price: e.target.value })
                }
              />
              <select
                name="category"
                value={editData.category}
                onChange={(e) =>
                  setEditData({ ...editData, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <input
                name="image"
                value={editData.image}
                onChange={(e) =>
                  setEditData({ ...editData, image: e.target.value })
                }
              />
              <textarea
                name="description"
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
              />
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditingProduct(null)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
