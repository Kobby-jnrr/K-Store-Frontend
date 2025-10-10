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

  // -------------------- Load user + products --------------------
  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (sessionUser && token) {
      setUser({ ...sessionUser, token });
      if (sessionUser.role === "vendor") {
        fetchVendorProducts(token);
      }
    } else {
      console.warn("⚠️ No user or token found in session/local storage");
    }
  }, []);

  // -------------------- Fetch vendor products (with fallback) --------------------
  const fetchVendorProducts = async (token) => {
    setLoadingProducts(true);
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
    } finally {
      setLoadingProducts(false);
    }
  };

  // -------------------- Delete product --------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      await axios.delete(
        "https://k-store-backend.onrender.com/api/products/" + id,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      console.warn("Render delete failed, trying localhost...");
      try {
        await axios.delete("http://localhost:5000/api/products/" + id, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(products.filter((p) => p._id !== id));
        toast.success("Product deleted successfully (local)!");
      } catch (err2) {
        console.error("Both delete attempts failed:", err2.message);
        toast.error("Failed to delete product.");
      }
    }
  };

  // -------------------- Edit modal --------------------
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
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveEdit = async () => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      const res = await axios.put(
        `https://k-store-backend.onrender.com/api/products/${editingProduct._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(
        products.map((p) =>
          p._id === editingProduct._id ? res.data.product : p
        )
      );
      closeEditModal();
      toast.success("Product updated successfully!");
    } catch (err) {
      console.warn("Render update failed, trying localhost...");
      try {
        const localRes = await axios.put(
          `http://localhost:5000/api/products/${editingProduct._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(
          products.map((p) =>
            p._id === editingProduct._id ? localRes.data.product : p
          )
        );
        closeEditModal();
        toast.success("Product updated successfully (local)!");
      } catch (err2) {
        console.error("Both update attempts failed:", err2.message);
        toast.error("Failed to update product.");
      }
    }
  };

  // -------------------- UI --------------------
  if (!user) return <div className="loader">Loading profile...</div>;

  return (
    <div className="profile-page">
      <Toaster position="top-right" />
      <div className="profile-card">
        {/* --- Profile Header --- */}
        <div className="profile-header">
          <img src={"."} alt={user.username} className="profile-avatar" />
          <h2 className="profile-name">
            {user.username} {user.verified && <span>✔️</span>}
          </h2>
          {user.role === "vendor" && (
            <span
              className={`vendor-badge ${user.verified ? "verified" : "pending"}`}
            >
              {user.verified ? "Verified Vendor" : "Pending Verification"}
            </span>
          )}
        </div>

        {/* --- Account Info --- */}
        <div className="profile-section">
          <h3>Account Info</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>

        {/* --- Vendor Products --- */}
        {user.role === "vendor" && (
          <div className="profile-section">
            <h3>Your Products</h3>
            {loadingProducts ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products found.</p>
            ) : (
              <div className="vendor-product-grid">
                {products.map((p) => (
                  <div key={p._id} className="vendor-product-card">
                    <img src={p.image} alt={p.title} className="product-img" />
                    <h4>{p.title}</h4>
                    <p>GH₵{p.price}</p>
                    <p>
                      Vendor: {p.vendorName}{" "}
                      {p.vendorVerified && <span>✔️</span>}
                    </p>
                    <div className="product-actions">
                      <button onClick={() => openEditModal(p)}>Edit</button>
                      <button onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Edit Modal --- */}
      {editingProduct && (
        <div className="modal-backdrop">
          <div className="edit-modal">
            <h3>Edit Product</h3>
            <input name="title" value={formData.title} onChange={handleChange} />
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />
            <input
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
            <input name="image" value={formData.image} onChange={handleChange} />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <div className="modal-actions">
              <button onClick={saveEdit}>Save</button>
              <button onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
