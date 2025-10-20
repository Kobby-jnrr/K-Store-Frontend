import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderItemDisplay from "./OrderItemDisplay.jsx";
import "./VendorOrders.css";

const STATUS_SEQUENCE = ["accepted", "preparing", "ready", "delivered"];
const STATUS_COLORS = {
  pending: "#f59e0b",
  accepted: "#3b82f6",
  preparing: "#10b981",
  ready: "#14b8a6",
  delivered: "#16a34a",
  rejected: "#dc2626",
};

const buttonStyles = {
  padding: "5px 12px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  marginRight: "6px",
};

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemStatuses, setItemStatuses] = useState({});

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    const token = sessionStorage.getItem("token");
    const urls = [
      `${import.meta.env.VITE_API_BASE_URL || "https://k-store-backend.onrender.com"}/api/orders/vendor-orders`,
      "http://localhost:5000/api/orders/vendor-orders",
    ];

    let fetchedOrders = [];
    for (let url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(res.data)) {
          fetchedOrders = res.data.map(order => ({
            ...order,
            items: order.items.map(item => ({
              ...item,
              status: item.status.toLowerCase(),
            })),
          }));
          break;
        }
      } catch (err) {
        console.warn(`Failed to fetch orders from ${url}:`, err.message);
      }
    }

    fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(fetchedOrders);
    setLoading(false);
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    const statuses = {};
    order.items.forEach(item => (statuses[item._id] = item.status));
    setItemStatuses(statuses);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setItemStatuses({});
  };

  const nextStatus = (current) => {
    if (["delivered", "rejected", "pending"].includes(current)) return current;
    const idx = STATUS_SEQUENCE.indexOf(current);
    return idx === -1 || idx === STATUS_SEQUENCE.length - 1
      ? current
      : STATUS_SEQUENCE[idx + 1];
  };

  const handleNextStatus = (itemId) =>
    updateStatus(itemId, nextStatus(itemStatuses[itemId]));
  const handleAccept = (itemId) => updateStatus(itemId, "accepted");
  const handleReject = (itemId) => updateStatus(itemId, "rejected");

  const updateStatus = async (itemId, status) => {
    if (!selectedOrder) return;
    const token = sessionStorage.getItem("token");
    const urls = [
      `${import.meta.env.VITE_API_BASE_URL || "https://k-store-backend.onrender.com"}/api/orders/vendor-orders/${selectedOrder._id}/item/${itemId}`,
      `http://localhost:5000/api/orders/vendor-orders/${selectedOrder._id}/item/${itemId}`,
    ];

    for (let url of urls) {
      try {
        await axios.put(
          url,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        break;
      } catch {}
    }

    setItemStatuses(prev => ({ ...prev, [itemId]: status }));
    setOrders(prev =>
      prev.map(order => {
        if (order._id !== selectedOrder._id) return order;
        return {
          ...order,
          items: order.items.map(item =>
            item._id === itemId ? { ...item, status } : item
          ),
        };
      })
    );
  };

  const updateAllDelivered = () => {
    selectedOrder.items.forEach(item => {
      if (!["rejected", "pending"].includes(itemStatuses[item._id]))
        handleNextStatus(item._id);
    });
  };

  const isOrderCompleted = (order) =>
    order.items.every(i => ["delivered", "rejected"].includes(i.status));

  if (loading) return <div className="loader">Loading vendor orders...</div>;

  const activeOrders = orders.filter(o => !isOrderCompleted(o));
  const completedOrders = orders.filter(o => isOrderCompleted(o));

  const renderFulfillment = (method) => {
    if (!method) method = "pickup";
    const isDelivery = method.toLowerCase() === "delivery";
    return (
      <span
        className="fulfillment-badge"
        style={{
          backgroundColor: isDelivery ? "#e0f2fe" : "#dcfce7",
          color: isDelivery ? "#0369a1" : "#166534",
        }}
      >
        {isDelivery ? "🚚 Delivery" : "🏬 Pickup"}
      </span>
    );
  };

  const renderOrderCard = (order) => {
    const allRejected = order.items.every(i => i.status === "rejected");
    const allCompleted = order.items.every(i =>
      ["delivered", "rejected"].includes(i.status)
    );
    const orderStatus = allRejected
      ? "Cannot be delivered"
      : allCompleted
      ? "Completed"
      : "Pending";

    return (
      <div key={order._id} className="vendor-order-card">
        <div className="order-header">
          <h2>Order: {order._id.slice(0, 8)}...</h2>
          <span
            className={`order-badge ${
              allCompleted
                ? "badge-completed"
                : allRejected
                ? "badge-rejected"
                : "badge-pending"
            }`}
          >
            {orderStatus}
          </span>
        </div>

        <p>Customer: {order.user.username}</p>
        <p>Location: {order.user.location || "N/A"}</p>
        <p>Phone: {order.user.phone || "N/A"}</p>
        <p>{renderFulfillment(order.fulfillmentMethod)}</p>

        <div className="vendor-order-items">
          {order.items.map(item => (
            <div key={item._id} className="vendor-order-item">
              <OrderItemDisplay key={item._id} item={item} />
              <span
                style={{
                  color: "#fff",
                  backgroundColor: STATUS_COLORS[item.status],
                  padding: "2px 8px",
                  borderRadius: "5px",
                  fontWeight: "bold",
                  textTransform: "capitalize",
                }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {!allCompleted && (
          <button
            onClick={() => openModal(order)}
            className="btn-primary"
            style={{ marginTop: "10px" }}
          >
            Update Order Status
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="vendor-orders-page">
      <h1>Active Orders 🛍️</h1>
      {activeOrders.length === 0 ? (
        <p>No active orders</p>
      ) : (
        activeOrders.map(renderOrderCard)
      )}

      <h1 style={{ marginTop: "2rem" }}>Completed Orders ✅</h1>
      {completedOrders.length === 0 ? (
        <p>No completed orders</p>
      ) : (
        completedOrders.map(renderOrderCard)
      )}

      {/* Modal */}
      {selectedOrder && (
        <div className="modal-backdrop fade-in">
          <div className="modal-content">
            <h3>Update Order: {selectedOrder._id.slice(0, 8)}</h3>

            {/* --- Accept/Reject Section --- */}
            <div style={{ marginBottom: "15px" }}>
              <h4>Pending Items - Accept or Reject</h4>
              {selectedOrder.items
                .filter(i => itemStatuses[i._id] === "pending")
                .map(item => (
                  <div key={item._id} className="modal-item">
                    <span>{item.product.title}</span>
                    <button
                      onClick={() => handleAccept(item._id)}
                      style={{
                        backgroundColor: STATUS_COLORS["accepted"],
                        color: "#fff",
                        ...buttonStyles,
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(item._id)}
                      style={{
                        backgroundColor: STATUS_COLORS["rejected"],
                        color: "#fff",
                        ...buttonStyles,
                      }}
                    >
                      Reject
                    </button>
                  </div>
                ))}
            </div>

            {/* --- Status Update Section --- */}
            <div>
              <h4>Accepted Items - Update Status</h4>
              {selectedOrder.items
                .filter(i =>
                  ["accepted", "preparing", "ready"].includes(
                    itemStatuses[i._id]
                  )
                )
                .map(item => (
                  <div key={item._id} className="modal-item">
                    <span>{item.product.title}</span>
                    <button
                      onClick={() => handleNextStatus(item._id)}
                      style={{
                        backgroundColor: STATUS_COLORS[itemStatuses[item._id]],
                        color: "#fff",
                        ...buttonStyles,
                      }}
                    >
                      {itemStatuses[item._id]}
                    </button>
                  </div>
                ))}
            </div>

            <div className="modal-buttons" style={{ marginTop: "12px" }}>
              <button onClick={updateAllDelivered} className="btn-secondary">
                Update All to Delivered
              </button>
              <button onClick={closeModal} className="btn-cancel">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorOrders;
