import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VendorOrders.css";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  const fetchVendorOrders = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/orders/vendor-orders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch vendor orders:", err);
    }
    setLoading(false);
  };

  const updateItemStatus = async (orderId, itemId, status) => {
    const token = sessionStorage.getItem("token");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/orders/vendor-orders/${orderId}/item/${itemId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchVendorOrders();
    } catch (err) {
      console.error("Failed to update item status:", err);
    }
  };

  if (loading) return <div className="loader">Loading vendor orders...</div>;

  return (
    <div className="vendor-orders-page">
      <h1>Your Orders 🛍️</h1>
      {orders.length === 0 ? (
        <p>No orders for your products yet.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="vendor-order-card">
            <h2>Order: {order._id.slice(0, 8)}...</h2>
            <p>Customer: {order.user.username}</p>
            <div className="vendor-order-items">
              {order.items.map(item => (
                <div key={item._id} className="vendor-order-item">
                  <span>{item.product.title} x {item.quantity}</span>
                  <span>Status: {item.status}</span>

                  {/* Pending → Accept/Reject */}
                  {item.status === "pending" && (
                    <div className="action-buttons">
                      <button onClick={() => updateItemStatus(order._id, item._id, "accepted")} className="accept-btn">Accept</button>
                      <button onClick={() => updateItemStatus(order._id, item._id, "rejected")} className="reject-btn">Reject</button>
                    </div>
                  )}
                    {["accepted", "preparing", "ready"].includes(item.status) && (
                    <div className="action-buttons">
                    {item.status === "accepted" && (
                    <button
                    style={{ backgroundColor: "#4caf50" }}
                    onClick={() => updateItemStatus(order._id, item._id, "preparing")}
                    >
                    Preparing
                    </button>
                    )}
                    {item.status === "preparing" && (
                    <button
                    style={{ backgroundColor: "#4caf50" }}
                    onClick={() => updateItemStatus(order._id, item._id, "ready")}
                    >
                    Ready
                    </button>
                    )}
                    {item.status === "ready" && (
                    <button
                    style={{ backgroundColor: "#4caf50" }}
                    onClick={() => updateItemStatus(order._id, item._id, "delivered")}
                    >
                    Delivered
                    </button>
                    )}
                    </div>
                    )}

                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default VendorOrders;
