import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [verifiedStatus, setVerifiedStatus] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });

  /* -------------------- Load user -------------------- */
  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (sessionUser && token) {
      setUser({ ...sessionUser, token });
      fetchVerificationStatus(sessionUser._id || sessionUser.id, token);
      if (sessionUser.role === "vendor") fetchVendorProducts(token);
      fetchUserOrders(token);
    } else {
      // Local dev mock
      const mockUser = {
        username: "Test User",
        email: "test@example.com",
        role: "vendor",
        verified: false,
        phone: "",
        location: "",
        token: "mock-token",
      };
      setUser(mockUser);
      setVerifiedStatus(false);
      setProducts([]);
      setOrders([]);
    }
  }, []);

  /* -------------------- Fetch verification -------------------- */
  const fetchVerificationStatus = async (userId, token) => {
    if (!token) return setVerifiedStatus(false);
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/status/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerifiedStatus(res.data?.verified ?? false);
    } catch {
      console.warn("⚠️ Verification fetch failed");
      setVerifiedStatus(false);
    }
  };

  /* -------------------- Fetch vendor products -------------------- */
  const fetchVendorProducts = async (token) => {
    setLoadingProducts(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products/vendor", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data || []);
    } catch {
      console.warn("⚠️ Failed to fetch products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  /* -------------------- Fetch user orders -------------------- */
  const fetchUserOrders = async (token) => {
    setLoadingOrders(true);
    try {
      const res = await axios.get("http://localhost:5000/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch {
      console.warn("⚠️ Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  /* -------------------- Product actions -------------------- */
  const handleDelete = (id) => {
    if (!window.confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p._id !== id));
    toast.success("Product deleted (local dev)!");
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || "",
      price: product.price || "",
      category: product.category || "",
      image: product.image || "",
      description: product.description || "",
    });
  };

  const closeEditModal = () => setEditingProduct(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const saveEdit = () => {
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((p) => (p._id === editingProduct._id ? { ...p, ...formData } : p))
    );
    closeEditModal();
    toast.success("Product updated (local dev)!");
  };

  /* -------------------- Helpers -------------------- */
  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    return names.map((n) => n[0].toUpperCase()).slice(0, 2).join("");
  };

  const getAvatarColor = (name) => {
    // Generate a consistent color based on name
    const colors = ["#2563eb","#f97316","#16a34a","#eab308","#8b5cf6","#db2777"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  /* -------------------- Render -------------------- */
  if (!user) return <div className="loader">Loading profile...</div>;

  const isVerified = verifiedStatus ?? user.verified ?? false;

  return (
    <div className="profile-page">
      <Toaster position="top-right" />
      <div className="profile-grid">

        {/* --- Profile Info --- */}
        <div className="profile-card side-card">
          <div className="profile-header">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="profile-avatar"
              />
            ) : (
              <div
                className="profile-avatar initials-avatar"
                style={{ backgroundColor: getAvatarColor(user.username) }}
              >
                {getInitials(user.username)}
              </div>
            )}
            <h2>{user.username}</h2>
            <span className={`vendor-badge ${isVerified ? "verified" : "unverified"}`}>
              {isVerified ? "✅ Verified Account" : "🔴 Unverified"}
            </span>
          </div>

          <div className="profile-section">
            <h3>Account Info</h3>
            <p><strong>Email:</strong> {user.email || "Not set"}</p>
            <p><strong>Phone:</strong> {user.phone || "Not added yet"}</p>
            <p><strong>Location:</strong> {user.location || "No location set"}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>

        {/* --- Products --- */}
        <div className="profile-card middle-card">
          <h3>Your Products</h3>
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="vendor-product-grid">
              {products.map((p) => (
                <div key={p._id || Math.random()} className="vendor-product-card">
                  <img
                    src={p.image || "/placeholder.png"}
                    alt={p.title || "Product"}
                    className="product-img"
                  />
                  <h4>{p.title || "Untitled"}</h4>
                  <p>GH₵{p.price || 0}</p>
                  <div className="product-actions">
                    <button onClick={() => openEditModal(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Orders --- */}
        <div className="profile-card side-card">
          <h3>My Orders</h3>
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order._id || Math.random()} className="order-card-new">
                  <div className="order-header-new">
                    <span
                      className={`order-status ${
                        order.status?.toLowerCase() === "delivered"
                          ? "delivered"
                          : order.status?.toLowerCase() === "pending"
                          ? "pending"
                          : "processing"
                      }`}
                    >
                      {order.status || "Pending"}
                    </span>
                    <span className="order-total">Total: GH₵{order.total || 0}</span>
                    <span className="order-payment">
                      Payment: {order.paymentMethod?.toUpperCase() || "N/A"}
                    </span>
                  </div>

                  <div className="order-date-new">
                    <small>
                      Ordered on: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                    </small>
                  </div>

                  <div className="order-items-new">
                    {(order.items || []).map((item) => (
                      <div key={item._id || Math.random()} className="order-item-new">
                        <img
                          src={item.product?.image || "/placeholder.png"}
                          alt={item.product?.title || "Product"}
                        />
                        <div className="item-info">
                          <p className="item-title">{item.product?.title || "Untitled"}</p>
                          <p className="item-vendor">
                            Vendor: {item.vendor?.username || "Unknown"}
                          </p>
                        </div>
                        <div className="item-details-new">
                          <p>Qty: {item.quantity || 0}</p>
                          <p>GH₵{item.price || 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Edit Modal --- */}
      {editingProduct && (
        <div className="modal-backdrop">
          <div className="edit-modal">
            <h3>Edit Product</h3>
            <input name="title" value={formData.title} onChange={handleChange} />
            <input name="price" type="number" value={formData.price} onChange={handleChange} />
            <input name="category" value={formData.category} onChange={handleChange} />
            <input name="image" value={formData.image} onChange={handleChange} />
            <textarea name="description" value={formData.description} onChange={handleChange} />
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
