import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VendorOrders.css";

const STATUS_SEQUENCE = ["pending", "accepted", "preparing", "ready", "delivered"];
const STATUS_COLORS = {
  pending: "#f59e0b",
  accepted: "#3b82f6",
  preparing: "#10b981",
  ready: "#14b8a6",
  delivered: "#16a34a",
  rejected: "#dc2626",
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
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        if (Array.isArray(res.data)) {
          fetchedOrders = res.data;
          break;
        }
      } catch (err) {
        console.warn(`Failed to fetch orders from ${url}:`, err.message);
      }
    }

    fetchedOrders = fetchedOrders.map(order => ({
      ...order,
      items: order.items.map(item => ({ ...item, status: item.status.toLowerCase() })),
    }));

    fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOrders(fetchedOrders);
    setLoading(false);
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    const statuses = {};
    order.items.forEach(item => statuses[item._id] = item.status);
    setItemStatuses(statuses);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setItemStatuses({});
  };

  const nextStatus = (current) => {
    if (current === "delivered" || current === "rejected") return current;
    const idx = STATUS_SEQUENCE.indexOf(current);
    return idx === -1 || idx === STATUS_SEQUENCE.length - 1 ? current : STATUS_SEQUENCE[idx + 1];
  };

  const handleNextStatus = (itemId) => {
    setItemStatuses(prev => ({ ...prev, [itemId]: nextStatus(prev[itemId]) }));
  };

  const handleReject = (itemId) => {
    setItemStatuses(prev => ({ ...prev, [itemId]: "rejected" }));
  };

  const updateAllDelivered = () => {
    const newStatuses = {};
    selectedOrder.items.forEach(item => newStatuses[item._id] = "delivered");
    setItemStatuses(newStatuses);
  };

  const saveStatuses = async () => {
    if (!selectedOrder) return;
    const token = sessionStorage.getItem("token");
    const baseUrls = [
      `${import.meta.env.VITE_API_BASE_URL || "https://k-store-backend.onrender.com"}/api/orders/vendor-orders/${selectedOrder._id}/item`,
      `http://localhost:5000/api/orders/vendor-orders/${selectedOrder._id}/item`,
    ];

    for (const item of selectedOrder.items) {
      const newStatus = itemStatuses[item._id];
      if (newStatus && newStatus !== item.status) {
        let success = false;
        for (let url of baseUrls) {
          try {
            await axios.put(`${url}/${item._id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            success = true;
            break;
          } catch {}
        }
        if (success) {
          setOrders(prev => prev.map(order => {
            if (order._id !== selectedOrder._id) return order;
            return {
              ...order,
              items: order.items.map(it => it._id === item._id ? { ...it, status: newStatus } : it)
            };
          }));
        }
      }
    }

    closeModal();
  };

  const isOrderCompleted = (order) =>
    order.items.every(i => ["delivered", "rejected"].includes(i.status));

  if (loading) return <div className="loader">Loading vendor orders...</div>;

  const activeOrders = orders.filter(o => !isOrderCompleted(o));
  const completedOrders = orders.filter(o => isOrderCompleted(o));

  const renderOrderCard = (order) => {
    const allRejected = order.items.every(i => i.status === "rejected");
    const allCompleted = order.items.every(i => ["delivered", "rejected"].includes(i.status));
    const orderStatus = allRejected ? "Cannot be delivered" : allCompleted ? "Completed" : "Pending";

    return (
      <div key={order._id} className="vendor-order-card">
        <div className="order-header">
          <h2>Order: {order._id.slice(0, 8)}...</h2>
          <span
            className={`order-badge ${allCompleted ? "badge-completed" : allRejected ? "badge-rejected" : "badge-pending"}`}
          >
            {orderStatus}
          </span>
        </div>
        <p>Customer: {order.user.username}</p>
        <div className="vendor-order-items">
          {order.items.map(item => (
            <div key={item._id} className="vendor-order-item">
              <span>{item.product.title} x {item.quantity}</span>
              <span style={{ color: STATUS_COLORS[item.status] }}>{item.status}</span>
            </div>
          ))}
        </div>
        {!allCompleted && (
          <button onClick={() => openModal(order)} className="btn-primary" style={{ marginTop: "10px" }}>
            Update Order Status
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="vendor-orders-page">
      <h1>Active Orders 🛍️</h1>
      {activeOrders.length === 0 ? <p>No active orders</p> : activeOrders.map(renderOrderCard)}

      <h1 style={{ marginTop: "2rem" }}>Completed Orders ✅</h1>
      {completedOrders.length === 0 ? <p>No completed orders</p> : completedOrders.map(renderOrderCard)}

      {/* Modal */}
      {selectedOrder && (
        <div className="modal-backdrop fade-in">
          <div className="modal-content">
            <h3>Update Order: {selectedOrder._id.slice(0, 8)}</h3>
            {selectedOrder.items.map(item => (
              <div key={item._id} className="modal-item">
                <span>{item.product.title}</span>
                <button
                  onClick={() => handleNextStatus(item._id)}
                  style={{
                    backgroundColor: STATUS_COLORS[itemStatuses[item._id]],
                    color: "#fff",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    marginRight: "6px"
                  }}
                  disabled={["delivered", "rejected"].includes(itemStatuses[item._id])}
                >
                  {itemStatuses[item._id]}
                </button>
                <button
                  onClick={() => handleReject(item._id)}
                  style={{
                    backgroundColor: STATUS_COLORS["rejected"],
                    color: "#fff",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer"
                  }}
                  disabled={itemStatuses[item._id] === "rejected"}
                >
                  Reject
                </button>
              </div>
            ))}
            <div className="modal-buttons" style={{ marginTop: "12px" }}>
              <button onClick={updateAllDelivered} className="btn-secondary">Update All to Delivered</button>
              <button onClick={saveStatuses} className="btn-primary">Save Changes</button>
              <button onClick={closeModal} className="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorOrders;
