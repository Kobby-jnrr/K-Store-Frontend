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
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    image: "",
    description: "",
  });

  const API_BASES = [
    "http://localhost:5000/api",
    "https://k-store-backend.onrender.com/api",
  ];

  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (sessionUser && token) {
      setUser({ ...sessionUser, token });
      fetchVerificationStatus(sessionUser._id || sessionUser.id, token);
      if (sessionUser.role === "vendor") fetchVendorProducts(token);
      fetchUserOrders(token);
    } else {
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

  const fetchWithFallback = async (endpoints, token) => {
    for (let url of endpoints) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) return res.data;
      } catch (err) {
        console.warn(`Request failed for ${url}:`, err.message);
      }
    }
    return null;
  };

  const fetchVerificationStatus = async (userId, token) => {
    if (!token || !userId) return setVerifiedStatus(false);
    const endpoints = API_BASES.map((base) => `${base}/auth/status/${userId}`);
    const data = await fetchWithFallback(endpoints, token);
    setVerifiedStatus(data?.verified ?? false);
  };

  const fetchVendorProducts = async (token) => {
    setLoadingProducts(true);
    const endpoints = API_BASES.map((base) => `${base}/products/vendor`);
    const data = await fetchWithFallback(endpoints, token);
    setProducts(Array.isArray(data) ? data : []);
    setLoadingProducts(false);
  };

  const fetchUserOrders = async (token) => {
    setLoadingOrders(true);
    const endpoints = API_BASES.map((base) => `${base}/orders/my-orders`);
    const data = await fetchWithFallback(endpoints, token);
    setOrders(Array.isArray(data) ? data : []);
    setLoadingOrders(false);
  };

  const confirmDeleteProduct = (product) => setConfirmDelete(product);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete._id;
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to delete a product.");
      return;
    }

    try {
      for (let base of API_BASES) {
        try {
          await axios.delete(`${base}/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        } catch (err) {
          console.warn(`Failed to delete from ${base}:`, err.message);
        }
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete product.");
    } finally {
      setConfirmDelete(null);
    }
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
      prev.map((p) =>
        p._id === editingProduct._id ? { ...p, ...formData } : p
      )
    );
    closeEditModal();
    toast.success("Product updated (local dev)!");
  };

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    return names.map((n) => n[0].toUpperCase()).slice(0, 2).join("");
  };

  const getAvatarColor = (name) => {
    const colors = [
      "#2563eb", "#f97316", "#16a34a",
      "#eab308", "#8b5cf6", "#db2777",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++)
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (!user) return <div className="loader">Loading profile...</div>;
  const isVerified = verifiedStatus ?? user.verified ?? false;
  const isVendor = user.role === "vendor";

  return (
    <div className="profile-page">
      <Toaster position="top-right" />

      <div className={`profile-grid ${isVendor ? "vendor-grid" : "customer-grid"}`}>
        {/* Profile Info */}
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

        {/* Vendor Products */}
        {isVendor && (
          <div className="profile-card middle-card scrollable-column">
            <h3>My Products</h3>
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
                    />
                    <h4>{p.title || "Untitled"}</h4>
                    <p>GH₵{p.price || 0}</p>
                    <div className="product-actions">
                      <button onClick={() => openEditModal(p)}>Edit</button>
                      <button onClick={() => confirmDeleteProduct(p)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders */}
<div className={`profile-card side-card scrollable-column`}>
  <h3>My Orders</h3>
  {loadingOrders ? (
    <p>Loading orders...</p>
  ) : orders.length === 0 ? (
    <p>No orders yet.</p>
  ) : (
    <div className="vendor-product-grid">
      {orders.map((order) => (
        <div key={order._id || Math.random()} className="vendor-product-card">
          {/* Order Header */}
          <div className="order-header-new">
            <span className={`order-status ${order.status?.toLowerCase()}`}>
              Status: {order.status?.toLowerCase() === "pending" ? "Pending Confirmation" : order.status || "Pending"}
            </span>
            <span className="order-total">
              Total: GH₵{order.total || 0}
            </span>
          </div>

          {/* Payment & Date */}
          <div className="order-date-new">
            <small>
              Payment: {order.paymentMethod?.toUpperCase() || "N/A"} | Ordered on:{" "}
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
            </small>
          </div>

          {/* Order Items */}
          <div className="order-items-new">
            {(order.items || []).map((item) => {
              let statusText = "Pending";
              let statusClass = "pending";
              let color = "black";
              switch ((item.status || "").toLowerCase()) {
                case "delivered":
                  statusText = "Delivered";
                  statusClass = "delivered";
                  color = "green";
                  break;
                case "pending":
                  statusText = "Pending";
                  statusClass = "pending";
                  color = "black";
                  break;
                case "processing":
                case "accepted":
                case "preparing":
                case "ready":
                  statusText = "Processing";
                  statusClass = "processing";
                  color = "green";
                  break;
                case "rejected":
                  statusText = "Cannot be delivered";
                  statusClass = "rejected";
                  color = "red";
                  break;
                default:
                  statusText = item.status || "Pending";
                  statusClass = "pending";
                  color = "black";
              }
              return (
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
                    <span style={{color, fontWeight: statusText !== "Pending" ? "bold" : "normal"}}>{statusText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      </div>

      {/* Modals remain unchanged */}
    </div>
  );
};

export default UserProfile;
