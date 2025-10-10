import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/orders",
      "http://localhost:5000/api/admin/orders",
    ];
    const token = sessionStorage.getItem("token");
    let fetchedOrders = [];

    for (let url of urls) {
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        fetchedOrders = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch orders from ${url}:`, err.message);
      }
    }

    setOrders(fetchedOrders);
    setLoading(false);
  };

  const updateItemStatus = async (orderId, itemId, status) => {
    const urls = [
      `https://k-store-backend.onrender.com/api/admin/orders/${orderId}/item/${itemId}`,
      `http://localhost:5000/api/admin/orders/${orderId}/item/${itemId}`,
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.put(url, { status }, { headers: { Authorization: `Bearer ${token}` } });
        fetchOrders();
        break;
      } catch (err) {
        console.warn(`Failed to update item at ${url}:`, err.message);
      }
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    const urls = [
      `https://k-store-backend.onrender.com/api/admin/orders/${orderId}`,
      `http://localhost:5000/api/admin/orders/${orderId}`,
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
        fetchOrders();
        break;
      } catch (err) {
        console.warn(`Failed to delete order at ${url}:`, err.message);
      }
    }
  };

  const toggleVendor = (orderId, vendorId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [vendorId]: !prev[orderId]?.[vendorId],
      },
    }));
  };

  if (loading) return <div className="loader">Loading orders...</div>;

  // Separate orders
  const pendingOrders = orders.filter(order => !order.items.every(p => p.status === "delivered"));
  const completedOrders = orders.filter(order => order.items.every(p => p.status === "delivered"));

  const renderOrders = (ordersList) =>
    ordersList.map(order => {
      const itemsByVendor = order.items.reduce((acc, item) => {
        const vendorId = item.vendor?._id || "Unknown";
        if (!acc[vendorId]) acc[vendorId] = { vendor: item.vendor, products: [] };
        acc[vendorId].products.push(item);
        return acc;
      }, {});

      return (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <strong>Order:</strong> {order._id.slice(0, 6)}...{order._id.slice(-4)} | 
            <strong>Customer:</strong> {order.user.username} | 
            <strong>Total:</strong> GH₵{order.total} | 
            <strong>Status:</strong>{" "}
            {order.items.every(p => p.status === "delivered") ? "Delivered" :
             order.items.some(p => p.status === "rejected") ? "Rejected" :
             "Pending"}
          </div>

          <div className="vendors-list">
            {Object.values(itemsByVendor).map(group => {
              const vendorId = group.vendor?._id || "Unknown";
              const isExpanded = expandedOrders[order._id]?.[vendorId];

              const vendorStatus = group.products.every(p => ["accepted","preparing","ready","delivered"].includes(p.status))
                ? group.products.find(p => p.status !== "delivered")?.status || "Accepted"
                : group.products.some(p => p.status === "rejected")
                ? "Rejected"
                : "Pending";

              return (
                <div key={vendorId} className="vendor-section">
                  <div className="vendor-header" onClick={() => toggleVendor(order._id, vendorId)}>
                    <span>{group.vendor?.username || "Unknown"} ({vendorId.slice(0,6)}...) - Status: {vendorStatus}</span>
                    <span>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {isExpanded && (
                    <div className="vendor-products">
                      {group.products.map(p => (
                        <div key={p._id} className="vendor-product">
                          {p.product?.title} x {p.quantity} - Status: {p.status}

                          {/* Workflow buttons */}
                          {["accepted","preparing","ready"].includes(p.status) && (
                            <div className="action-buttons">
                              {p.status === "accepted" && (
                                <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, p._id, "preparing")}>Preparing</button>
                              )}
                              {p.status === "preparing" && (
                                <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, p._id, "ready")}>Ready</button>
                              )}
                              {p.status === "ready" && (
                                <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, p._id, "delivered")}>Delivered</button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <button className="delete-btn" onClick={() => deleteOrder(order._id)}>Delete Order</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    });

  return (
    <div className="orders-page">
      <h1>Orders Management 🛒</h1>

      <h2>Pending Orders</h2>
      {pendingOrders.length === 0 ? <p>No pending orders.</p> : renderOrders(pendingOrders)}

      <h2>Completed Orders</h2>
      {completedOrders.length === 0 ? <p>No completed orders yet.</p> : renderOrders(completedOrders)}
    </div>
  );
}

export default Orders;
