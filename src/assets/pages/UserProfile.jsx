import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [verifiedStatus, setVerifiedStatus] = useState(null);
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

  /* -------------------- Load user and verification -------------------- */
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
      console.warn("⚠️ No user or token found in storage");
    }
  }, []);

  /* -------------------- Fetch user verification status -------------------- */
  const fetchVerificationStatus = async (userId, token) => {
    const urls = [
      `https://k-store-backend.onrender.com/api/auth/status/${userId}`,
      `http://localhost:5000/api/auth/status/${userId}`,
    ];

    for (let url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVerifiedStatus(res.data.verified);
        break;
      } catch (err) {
        console.warn("⚠️ Verification fetch failed from:", url);
      }
    }
  };

  /* -------------------- Fetch vendor products -------------------- */
  const fetchVendorProducts = async (token) => {
    setLoadingProducts(true);
    try {
      const res = await axios.get(
        "https://k-store-backend.onrender.com/api/products/vendor",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data);
    } catch {
      try {
        const localRes = await axios.get(
          "http://localhost:5000/api/products/vendor",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(localRes.data);
      } catch {
        toast.error("Failed to load your products.");
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  /* -------------------- Fetch user orders -------------------- */
  const fetchUserOrders = async (token) => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(
        "https://k-store-backend.onrender.com/api/orders/my-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch {
      try {
        const localRes = await axios.get(
          "http://localhost:5000/api/orders/my-orders",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(localRes.data);
      } catch {
        toast.error("Failed to load your orders.");
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  /* -------------------- Delete product -------------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      await axios.delete(
        `https://k-store-backend.onrender.com/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted!");
    } catch {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(products.filter((p) => p._id !== id));
        toast.success("Product deleted (local)!");
      } catch {
        toast.error("Failed to delete product.");
      }
    }
  };

  /* -------------------- Edit modal -------------------- */
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
      toast.success("Product updated!");
    } catch {
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
        toast.success("Product updated (local)!");
      } catch {
        toast.error("Failed to update product.");
      }
    }
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
            <img src={"."} alt={user.username} className="profile-avatar" />
            <h2>{user.username}</h2>

            <span
              className={`vendor-badge ${
                isVerified ? "verified" : "unverified"
              }`}
            >
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
                <div key={p._id} className="vendor-product-card">
                  <img src={p.image} alt={p.title} className="product-img" />
                  <h4>{p.title}</h4>
                  <p>GH₵{p.price}</p>
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
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <p><strong>Status:</strong> {order.status}</p>
                    <p><strong>Total:</strong> GH₵{order.total}</p>
                  </div>
                  <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</p>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={item._id} className="order-item">
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                        />
                        <div>
                          <p className="item-title">{item.product.title}</p>
                          <p className="item-vendor">
                            Vendor: {item.vendor.username}
                          </p>
                        </div>
                        <div className="item-details">
                          <p>Qty: {item.quantity}</p>
                          <p>GH₵{item.price}</p>
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
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />
            <input name="category" value={formData.category} onChange={handleChange} />
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
