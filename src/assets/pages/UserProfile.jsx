import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });

  // ---------------- Load user from session ----------------
  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    if (sessionUser) {
      setUser(sessionUser);
      if (sessionUser.role === "vendor") {
        fetchVendorProducts(sessionUser._id, sessionUser.token);
      }
    }
  }, []);

  // ---------------- Fetch vendor products ----------------
  const fetchVendorProducts = async (vendorId, token) => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(
        `https://k-store-backend.onrender.com/api/products`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const vendorProducts = res.data.filter(p => p.vendor?._id === vendorId);
      setProducts(vendorProducts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your products.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // ---------------- Product CRUD ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(
        `https://k-store-backend.onrender.com/api/products/${id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProducts(products.filter(p => p._id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
    });
  };

  const closeEditModal = () => setEditingProduct(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    try {
      const res = await axios.put(
        `https://k-store-backend.onrender.com/api/products/${editingProduct._id}`,
        formData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProducts(products.map(p => (p._id === editingProduct._id ? res.data.product : p)));
      closeEditModal();
      toast.success("Product updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    }
  };

  // ---------------- Render ----------------
  if (!user) return <div className="loader">Loading profile...</div>;

  return (
    <div className="profile-page">
      <Toaster position="top-right" />
      <div className="profile-card">

        {/* --- Profile Header --- */}
        <div className="profile-header">
          <img src={"."} alt={user.username} className="profile-avatar" />
          <h2 className="profile-name">
            {user.username} {user.verified && <span className="green-tick">✔️</span>}
          </h2>
          {user.role === "vendor" && (
            <span className={`vendor-badge ${user.verified ? "verified" : "pending"}`}>
              {user.verified ? "Verified Vendor" : "Pending Verification"}
            </span>
          )}
        </div>

        {/* --- Account Info --- */}
        <div className="profile-section">
          <h3>Account Info</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
        </div>

        {/* --- Vendor Products --- */}
        {user.role === "vendor" && (
          <div className="profile-section">
            <h3>Your Products</h3>
            {loadingProducts ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products added yet.</p>
            ) : (
              <div className="vendor-product-grid">
                {products.map(p => (
                  <div key={p._id} className="vendor-product-card">
                    <img src={p.image} alt={p.title} className="product-img" />
                    <h4 className="product-title">{p.title}</h4>
                    <p className="product-price">GH₵{p.price}</p>
                    <p>
                      Vendor: {p.vendorName} {p.vendorVerified && <span className="green-tick">✔️</span>}
                    </p>
                    <div className="product-actions">
                      <button className="edit-btn" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- Action Buttons --- */}
        <div className="profile-actions">
          <button className="edit-btn">Edit Profile</button>
          {user.role === "vendor" && <button className="add-product-btn">Add Product</button>}
        </div>
      </div>

      {/* --- Edit Modal --- */}
      {editingProduct && (
        <div className="modal-backdrop">
          <div className="edit-modal">
            <h3>Edit Product</h3>
            <input 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            placeholder="Product Name" 
            />
            <input 
            name="price" 
            type="number" 
            value={formData.price} 
            onChange={handleChange} 
            placeholder="Price" 
            />
            <input 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            placeholder="Category" 
            />
            <input 
            name="image" 
            value={formData.image} 
            onChange={handleChange} 
            placeholder="Image URL" 
            />
            <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Description" 
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={saveEdit}>Save</button>
              <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
