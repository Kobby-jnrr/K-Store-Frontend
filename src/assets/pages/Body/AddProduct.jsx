import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./AddProduct.css";

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

  const categories = [
    "fashion", "electronics", "home", "grocery",
    "baby", "beauty", "sports", "gaming"
  ];

  // Load vendor & products
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
      const res = await axios.get(
        "https://k-store-backend.onrender.com/api/products/vendor",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data);
    } catch {
      toast.error("Failed to load your products.");
    }
  };

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

  const uploadToCloudinary = async (file) => {
    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", "K-Store");
    const res = await fetch("https://api.cloudinary.com/v1_1/dydefhhcd/image/upload", {
      method: "POST",
      body: formDataCloud,
    });
    const data = await res.json();
    return data.secure_url;
  };

  // Add Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category || !selectedFile) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setAdding(true);
    try {
      const imageUrl = await uploadToCloudinary(selectedFile);

      const payload = {
        ...formData,
        price: Number(formData.price),
        image: imageUrl,
        vendor: vendor._id,
      };

      await axios.post(
        "https://k-store-backend.onrender.com/api/products",
        payload,
        { headers: { Authorization: `Bearer ${vendor.token}` } }
      );

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

  // Edit Product
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
      let imageUrl = editPreview;
      if (editFile) imageUrl = await uploadToCloudinary(editFile);

      const res = await axios.put(
        `https://k-store-backend.onrender.com/api/products/${editingProduct._id}`,
        { ...editData, image: imageUrl },
        { headers: { Authorization: `Bearer ${vendor.token}` } }
      );

      setProducts(products.map(p => (p._id === editingProduct._id ? res.data.product : p)));
      setEditingProduct(null);
      setEditFile(null);
      setEditPreview("");
      toast.success("✅ Product updated!");
    } catch {
      toast.error("Failed to update product.");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(
        `https://k-store-backend.onrender.com/api/products/${id}`,
        { headers: { Authorization: `Bearer ${vendor.token}` } }
      );
      setProducts(products.filter(p => p._id !== id));
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
        <div className="half-section add-product">
          <form className="vendor-form" onSubmit={handleAddProduct}>
            <h3>Add Product</h3>
            <input placeholder="Product Name" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</option>)}
            </select>
            {previewUrl && <img src={previewUrl} alt="Preview" className="image-preview" />}
            <input type="file" accept="image/*" onChange={handleFileSelect} required />
            <textarea placeholder="Description (optional)" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />

            <button type="submit" className="add-product-button">
              {adding ? <span className="spinner"></span> : "Add Product"}
            </button>
          </form>
        </div>

        <div className="half-section edit-products">
          <h3>Your Products</h3>
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

          {editingProduct && (
            <div className="edit-form">
              <h4>Editing: {editingProduct.title}</h4>
              <input value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
              <input type="number" value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} />
              <select value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})}>
                {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</option>)}
              </select>
              {editPreview && <img src={editPreview} alt="Preview" className="image-preview" />}
              <input type="file" accept="image/*" onChange={handleEditFileSelect} />
              <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
              <button onClick={saveEdit} disabled={savingEdit}>{savingEdit ? "Saving..." : "Save"}</button>
              <button onClick={() => setEditingProduct(null)} disabled={savingEdit}>Cancel</button>
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
