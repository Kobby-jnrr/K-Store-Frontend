import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./AddProduct.css";

// -------------------- Reusable SearchableDropdown --------------------
const SearchableDropdown = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div ref={ref} className="searchable-dropdown">
      <input
        type="text"
        placeholder="Search or select category..."
        value={filter}
        onChange={(e) => {
          setFilter(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      <div className={`dropdown-options ${open ? "show" : ""}`}>
        {filteredOptions.length === 0 ? (
          <div className="dropdown-item disabled">No categories found</div>
        ) : (
          filteredOptions.map((opt) => (
            <div
              key={opt}
              className="dropdown-item"
              onClick={() => {
                onChange(opt);
                setFilter(opt);
                setOpen(false);
              }}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// -------------------- Main VendorProducts Component --------------------
const VendorProducts = () => {
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);

  // Add Product States
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Edit Product States
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // -------------------- Categories (matches backend enum) --------------------
  const categories = [
  "fashion",
  "electronics",
  "home",
  "grocery",
  "baby",
  "beauty",
  "sports",
  "gaming",
  "books",
  "toys",
  "automotive",
  "jewelry",
  "health",
  "pets",
  "office",
  "tools",
  "garden",
  "music",
  "movies",
  "appliances",
  "footwear",
  "accessories",
  "outdoor",
  "art",
  "other",
];

  const API_BASE = "https://k-store-backend.onrender.com/api/products";

  // -------------------- Load vendor & products --------------------
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!user || user.role !== "vendor") {
      toast.error("❌ Access Denied! Only vendors can manage products.");
      navigate("/");
      return;
    }

    setVendor({ ...user, token });
    fetchProducts(token);
  }, [navigate]);

  const fetchProducts = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch {
      toast.error("Failed to load your products.");
    }
  };

  // -------------------- File Handlers --------------------
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleEditFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  // -------------------- Add Product --------------------
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category || !selectedFile) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setAdding(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("price", formData.price);
      payload.append("category", formData.category);
      payload.append("description", formData.description || "");
      payload.append("image", selectedFile);

      await axios.post(API_BASE, payload, {
        headers: {
          Authorization: `Bearer ${vendor.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setFormData({ title: "", price: "", category: "", description: "" });
      setSelectedFile(null);
      setPreviewUrl("");
      fetchProducts(vendor.token);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add product.");
    } finally {
      setAdding(false);
    }
  };

  // -------------------- Edit Product --------------------
  const openEdit = (product) => {
    setEditingProduct(product);
    setEditData({
      title: product.title,
      price: product.price,
      category: product.category,
      description: product.description,
    });
    setEditPreview(product.image);
    setEditFile(null);
  };

  const saveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload = new FormData();
      payload.append("title", editData.title);
      payload.append("price", editData.price);
      payload.append("category", editData.category);
      payload.append("description", editData.description || "");
      if (editFile) payload.append("image", editFile);

      const res = await axios.put(`${API_BASE}/${editingProduct._id}`, payload, {
        headers: {
          Authorization: `Bearer ${vendor.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProducts(products.map((p) => (p._id === editingProduct._id ? res.data.product : p)));
      setEditingProduct(null);
      setEditFile(null);
      setEditPreview("");
      toast.success("✅ Product updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    } finally {
      setSavingEdit(false);
    }
  };

  // -------------------- Delete Product --------------------
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${vendor.token}` },
      });
      setProducts(products.filter((p) => p._id !== id));
      toast.success("🗑️ Product deleted!");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  if (!vendor) return <div className="loader">Loading...</div>;

  return (
    <div className="vendor-products-page">
      <Toaster position="top-right" />
      <h2 className="addhead">
        Manage Products by {vendor.username} {vendor.verified && "✅"}
      </h2>

      <div className="products-container">
        {/* ---------------- Add Product Form ---------------- */}
        <div className="half-section add-product">
          <form className="vendor-form" onSubmit={handleAddProduct}>
            <h3>Add Product</h3>
            <input
              placeholder="Product Name"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <SearchableDropdown
              options={categories}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
            />
            {previewUrl && <img src={previewUrl} alt="Preview" className="image-preview" />}
            <input type="file" accept="image/*" onChange={handleFileSelect} required />
            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <button type="submit" className="add-product-button">
              {adding ? <span className="spinner"></span> : "Add Product"}
            </button>
          </form>
        </div>

        {/* ---------------- Products List ---------------- */}
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

          {editingProduct && (
            <div className="edit-form">
              <h4>Editing: {editingProduct.title}</h4>
              <input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
              <input
                type="number"
                value={editData.price}
                onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              />
              <SearchableDropdown
                options={categories}
                value={editData.category}
                onChange={(val) => setEditData({ ...editData, category: val })}
              />
              {editPreview && <img src={editPreview} alt="Preview" className="image-preview" />}
              <input type="file" accept="image/*" onChange={handleEditFileSelect} />
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
              <button onClick={saveEdit} disabled={savingEdit}>
                {savingEdit ? "Saving..." : "Save"}
              </button>
              <button onClick={() => setEditingProduct(null)} disabled={savingEdit}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal-backdrop">
          <div className="success-modal">
            <h2>✅ Product Added!</h2>
            <p>Your product has been added successfully.</p>
            <button onClick={() => setShowSuccessModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
