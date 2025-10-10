import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../../api/productService";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./AddProduct.css";

const VendorProducts = () => {
  const navigate = useNavigate();

  // ----------------------------- Product state -----------------------------
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
    if (!user || user.role !== "vendor") {
      toast.error("❌ Access Denied! Only vendors can manage products.");
      navigate("/");
    } else {
      setVendor(user);
      fetchProducts(user._id, user.token);
    }
  }, [navigate]);

  // ----------------------------- Fetch vendor products -----------------------------
  const fetchProducts = async (vendorId, token) => {
    try {
      const res = await axios.get("https://k-store-backend.onrender.com/api/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vendorProducts = res.data.filter(p => p.vendor?._id === vendorId);
      setProducts(vendorProducts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products.");
    }
  };

  // ----------------------------- Handlers -----------------------------
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = e => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleAddProduct = async e => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category || !formData.image) {
      toast.error("Fill all required fields!");
      return;
    }
    try {
      await addProduct({ ...formData, vendor: vendor._id, vendorName: vendor.username, vendorVerified: vendor.verified });
      toast.success("✅ Product added!");
      setFormData({ title: "", price: "", category: "", description: "", image: "" });
      fetchProducts(vendor._id, vendor.token);
    } catch (err) {
      const message = err.response?.data?.message || "Error adding product";
      toast.error(`❌ ${message}`);
      console.error(err.response || err);
    }
  };

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
    try {
      const res = await axios.put(
        `https://k-store-backend.onrender.com/api/products/${editingProduct._id}`,
        editData,
        { headers: { Authorization: `Bearer ${vendor.token}` } }
      );
      setProducts(products.map(p => p._id === editingProduct._id ? res.data.product : p));
      setEditingProduct(null);
      toast.success("✅ Product updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`https://k-store-backend.onrender.com/api/products/${id}`, { headers: { Authorization: `Bearer ${vendor.token}` } });
      setProducts(products.filter(p => p._id !== id));
      toast.success("Product deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  // ----------------------------- Render -----------------------------
  if (!vendor) return <div className="loader">Loading...</div>;

  return (
    <div className="vendor-products-page">
      <Toaster position="top-right" />

      <h2 className="addhead">Manage Products &nbsp;by {vendor.username} {vendor.verified && "✅"}</h2>

      <div className="products-container">
        {/* ---------- Add Product Half ---------- */}
        <div className="half-section add-product">
          <form className="vendor-form" onSubmit={handleAddProduct}>
            <h3>Add Product</h3>
            <input name="title" placeholder="Product Name" value={formData.title} onChange={handleChange} required />
            <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} required />
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
            </select>
            <input name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} required />
            <textarea name="description" placeholder="Description (optional)" value={formData.description} onChange={handleChange} />
            <button type="submit" className="add-product-button">Add Product</button>
          </form>
        </div>

        {/* ---------- Edit Products Half ---------- */}
        <div className="half-section edit-products">
          <h3>Edit Products</h3>
          <div className="products-list">
            {products.length === 0 ? <p>No products added yet.</p> :
              products.map(p => (
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
            }
          </div>

          {/* ---------- Edit Modal Inline ---------- */}
          {editingProduct && (
            <div className="edit-form">
              <h4>Editing: {editingProduct.title}</h4>
              <input name="title" value={editData.title} onChange={handleEditChange} />
              <input name="price" type="number" value={editData.price} onChange={handleEditChange} />
              <select name="category" value={editData.category} onChange={handleEditChange}>
                {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
              <input name="image" value={editData.image} onChange={handleEditChange} />
              <textarea name="description" value={editData.description} onChange={handleEditChange} />
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
