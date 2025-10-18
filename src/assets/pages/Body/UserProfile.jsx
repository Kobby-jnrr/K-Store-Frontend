import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./UserProfile.css";

const API_BASES = [
  "http://localhost:5000/api",
  "https://k-store-backend.onrender.com/api",
];

// --- Utility to ceil to 2 decimals ---
const ceil2 = (num) => Math.ceil(num * 100) / 100;

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [verifiedStatus, setVerifiedStatus] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // --- Notifications for order status changes ---
  const [notifications, setNotifications] = useState([]);
  const [prevOrderStatuses, setPrevOrderStatuses] = useState({});

  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (sessionUser && token) {
      setUser({ ...sessionUser, token });
      fetchVerificationStatus(sessionUser._id || sessionUser.id, token);
      if (sessionUser.role === "vendor") fetchVendorProducts(token);
      fetchUserOrders(token);
    }
  }, []);

  const fetchWithFallback = async (urls, token) => {
    for (let url of urls) {
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.data) return res.data;
      } catch {}
    }
    return null;
  };

  const fetchVerificationStatus = async (userId, token) => {
    if (!userId || !token) return;
    const urls = API_BASES.map(base => `${base}/auth/status/${userId}`);
    const data = await fetchWithFallback(urls, token);
    setVerifiedStatus(data?.verified ?? false);
    if (data) setUser(prev => ({ ...prev, ...data }));
  };

  const fetchVendorProducts = async (token) => {
    setLoadingProducts(true);
    const urls = API_BASES.map(base => `${base}/products/vendor`);
    const data = await fetchWithFallback(urls, token);
    setProducts(Array.isArray(data) ? data : []);
    setLoadingProducts(false);
  };

  const fetchUserOrders = async (token) => {
    setLoadingOrders(true);
    const urls = API_BASES.map(base => `${base}/orders/my-orders`);
    const data = await fetchWithFallback(urls, token);
    setOrders(Array.isArray(data) ? data : []);
    // Initialize previous order statuses
    const statusMap = {};
    (data || []).forEach(order => {
      statusMap[order._id] = computeOrderStatus(order);
    });
    setPrevOrderStatuses(statusMap);
    setLoadingOrders(false);
  };

  // --- Poll orders every 30 seconds to detect status changes ---
  useEffect(() => {
    if (!user || !user.token) return;

    const checkOrderStatusChanges = async () => {
      try {
        const urls = API_BASES.map(base => `${base}/orders/my-orders`);
        let ordersData = null;

        for (let url of urls) {
          try {
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${user.token}` } });
            if (res.data) { ordersData = res.data; break; }
          } catch {}
        }

        if (!ordersData) return;

        ordersData.forEach(order => {
          const oldStatus = prevOrderStatuses[order._id];
          const newStatus = order.items?.length ? computeOrderStatus(order) : "Pending";

          if (oldStatus && oldStatus !== newStatus) {
            const message = `Your order "${order._id}" status changed to ${newStatus}.`;
            setNotifications(prev => [
              { _id: Date.now().toString(), message, createdAt: new Date().toISOString(), readBy: [] },
              ...prev
            ]);
          }
        });

        // Update previous statuses
        const newStatusMap = {};
        ordersData.forEach(o => newStatusMap[o._id] = computeOrderStatus(o));
        setPrevOrderStatuses(newStatusMap);

        setOrders(ordersData);
      } catch (err) {
        console.error("Order status check failed:", err.message);
      }
    };

    // Initial check + interval
    checkOrderStatusChanges();
    const interval = setInterval(checkOrderStatusChanges, 10000);
    return () => clearInterval(interval);

  }, [user, prevOrderStatuses]);

  // --- Edit, Delete, Avatar, Utility functions ---
  const confirmDeleteProduct = (product) => setConfirmDelete(product);
  const handleDelete = async () => {
    if (!confirmDelete) return;
    const token = user.token;
    const id = confirmDelete._id;
    try {
      for (let base of API_BASES) {
        try {
          await axios.delete(`${base}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          break;
        } catch {}
      }
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Product deleted successfully!");
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setConfirmDelete(null);
    }
  };

  const openEditModal = (item, type = "product") => {
    setEditingItem({ ...item, type });
    if (type === "product") {
      setFormData({
        title: item.title || "",
        price: item.price || "",
        category: item.category || "",
        image: item.image || "",
        description: item.description || "",
      });
    } else {
      setFormData({
        phone: item.phone || "",
        location: item.location || "",
        businessName: item.businessName || "",
      });
    }
  };

  const closeEditModal = () => setEditingItem(null);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const saveEdit = async () => {
    if (!editingItem) return;
    const token = user.token;
    try {
      if (editingItem.type === "product") {
        for (let base of API_BASES) {
          try {
            await axios.put(`${base}/products/${editingItem._id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            break;
          } catch {}
        }
        setProducts(prev =>
          prev.map(p => (p._id === editingItem._id ? { ...p, ...formData } : p))
        );
      } else {
        for (let base of API_BASES) {
          try {
            await axios.put(`${base}/auth/update/${user._id || user.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
            break;
          } catch {}
        }
        const updatedUsername = formData.businessName?.trim() || `${user.firstName} ${user.lastName}`;
        setUser((prev) => ({ ...prev, ...formData, username: updatedUsername }));
        sessionStorage.setItem("user", JSON.stringify({ ...user, ...formData, username: updatedUsername }));
      }
      closeEditModal();
      toast.success("Changes saved!");
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "";
    return name.trim().split(" ").filter(n => n).map(n => n[0].toUpperCase()).slice(0, 2).join("");
  };

  const getAvatarColor = (name) => {
    const colors = ["#2563eb","#f97316","#16a34a","#eab308","#8b5cf6","#db2777"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const computeOrderStatus = (order) => {
    if (!order.items || order.items.length === 0) return "Pending";
    const allDeliveredOrRejected = order.items.every(item => item.status === "delivered" || item.status === "rejected");
    if (allDeliveredOrRejected) return "Delivered";
    const anyPending = order.items.some(item => item.status === "pending");
    return anyPending ? "Pending" : "Processing";
  };

  if (!user) return <div className="loader">Loading profile...</div>;
  const isVendor = user.role === "vendor";
  const isVerified = isVendor ? (verifiedStatus ?? user.verified ?? false): false;

  return (
    <div className="profile-page">
      <Toaster position="top-right" />

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="notifications-popup">
          {notifications.map(n => (
            <div key={n._id} className="notification-item">
              {n.message} <small>{new Date(n.createdAt).toLocaleTimeString()}</small>
            </div>
          ))}
        </div>
      )}

      <div className={`profile-grid ${isVendor ? "vendor-grid" : "customer-grid"}`}>
        {/* Profile Card */}
        <div className="profile-card side-card">
          <div className="profile-header">
            {!user.avatar ? (
              <div className="profile-avatar initials-avatar" style={{ backgroundColor: getAvatarColor(user.username) }}>
                {getInitials(user.username)}
              </div>
            ) : <img src={user.avatar} alt={user.username} className="profile-avatar" />}
            <h2>
              {user.username} {isVendor && isVerified && <span className="green-tick">✅</span>}
            </h2>
            {isVendor && (
              <span className={`vendor-badge ${isVerified ? "verified" : "unverified"}`}>
                {isVerified ? "Verified Account" : "Unverified"}
              </span>
            )}
          </div>
          <div className="profile-section">
            <h3>Account Info</h3>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone || "Phone Not Added"}</p>
            <p><strong>Location:</strong> {user.location || "No location set"}</p>
            {isVendor && <p><strong>Business Name:</strong> {user.businessName || "No Business Name"}</p>}
            <p><strong>Role:</strong> {user.role}</p>
            <button className="btn-primary" onClick={() => openEditModal(user, "vendor")}>Edit Info</button>
          </div>
        </div>

        {/* Vendor Products */}
        {isVendor && (
          <div className="profile-card middle-card scrollable-column">
            <h3>My Products</h3>
            {loadingProducts ? <p>Loading products...</p> : products.length === 0 ? <p>No products found.</p> :
              <div className="vendor-product-grid">
                {products.map(p => (
                  <div key={p._id || Math.random()} className="vendor-product-card hover-card">
                    <img src={p.image || "/placeholder.png"} alt={p.title || "Product"} />
                    <h4>{p.title || "Untitled"}</h4>
                    <p>GH₵{ceil2(p.price || 0).toFixed(2)}</p>
                    <div className="product-actions">
                      <button className="btn-primary" onClick={() => openEditModal(p)}>Edit</button>
                      <button className="btn-danger" onClick={() => confirmDeleteProduct(p)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* Orders */}
        <div className="profile-card side-card scrollable-column">
          <h3>My Orders</h3>
          {loadingOrders ? <p>Loading orders...</p> : orders.length === 0 ? <p>No orders yet.</p> :
            <div className="vendor-product-grid">
              {orders.map(order => (
                <div key={order._id || Math.random()} className="vendor-product-card hover-card" onClick={() => setActiveOrder(order)}>
                  <div className="order-header-new">
                    <span className={`order-status ${computeOrderStatus(order).toLowerCase()}`}>Status: {computeOrderStatus(order)}</span>
                    <span className="order-total">Total: GH₵{ceil2(order.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="order-date-new">
                    <small>Payment: {order.paymentMethod?.toUpperCase() || "N/A"} | Ordered on: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</small>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      </div>

      {/* Modals */}
      {editingItem && (
        <div className="edit-modal fade-in">
          <div className="edit-modal-content">
            <h3>{editingItem.type === "product" ? "Edit Product" : "Edit Info"}</h3>
            {editingItem.type === "product" ? (
              <>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} />
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} />
                <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} />
                <input type="text" name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
              </>
            ) : (
              <>
                <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
                <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
                <input type="text" name="businessName" placeholder="Business Name" value={formData.businessName} onChange={handleChange} />
              </>
            )}
            <div className="edit-modal-actions">
              <button className="btn-primary" onClick={saveEdit}>Save</button>
              <button className="btn-cancel" onClick={closeEditModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="confirm-modal fade-in">
          <div className="confirm-modal-content">
            <p>Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>?</p>
            <div className="confirm-buttons">
              <button className="btn-danger" onClick={handleDelete}>Yes, Delete</button>
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeOrder && (
        <div className="edit-modal fade-in">
          <div className="edit-modal-content">
            <h3>Order Details</h3>
            <p><strong>Status:</strong> {computeOrderStatus(activeOrder)}</p>
            <p><strong>Total:</strong> GH₵{ceil2(activeOrder.total || 0).toFixed(2)}</p>
            <p><strong>Payment:</strong> {activeOrder.paymentMethod}</p>
            <p><strong>Ordered on:</strong> {new Date(activeOrder.createdAt).toLocaleString()}</p>
            <h4>Items:</h4>
            <div className="order-items-new">
              {(activeOrder.items || []).map(item => (
                <div key={item._id || Math.random()} className={`order-item-new ${item.status === "rejected" ? "rejected-item" : ""}`}>
                  <img src={item.product?.image || "/placeholder.png"} alt={item.product?.title || "Product"} />
                  <div className="item-info">
                    <p>{item.product?.title || "Untitled"}</p>
                    <p>Vendor: {item.vendor?.username || "Unknown"}</p>
                  </div>
                  <div className="item-details-new">
                    <p>Qty: {item.quantity || 0}</p>
                    <p>GH₵{ceil2(item.price || 0).toFixed(2)}</p>
                    {item.status === "rejected" ? (
                      <span className="rejected-msg">❌ Sorry, this item cannot be delivered</span>
                    ) : (
                      <span>{item.status || "Pending"}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="edit-modal-actions">
              <button className="btn-cancel" onClick={() => setActiveOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;
