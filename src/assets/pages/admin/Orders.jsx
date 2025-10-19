import React, { useState, useEffect } from "react";
import axios from "axios";
import OrderItemDisplay from "../Body/OrderItemDisplay";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [autoPass, setAutoPass] = useState(() => localStorage.getItem("autoPass") === "true");
  const [popup, setPopup] = useState("");
  const [modal, setModal] = useState({ show: false, type: "", orderId: null });

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [autoPass]);

  const toggleAutoPass = () => {
    const newValue = !autoPass;
    setAutoPass(newValue);
    localStorage.setItem("autoPass", newValue);
    setPopup(newValue ? "Auto Pass is ON" : "Manual Pass is ON");
    setTimeout(() => setPopup(""), 2000);
  };

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

    if (autoPass) {
      for (let order of fetchedOrders) {
        for (let item of order.items) {
          if (item.status === "pending") {
            await updateItemStatus(order._id, item._id, "accepted", false);
            item.status = "accepted";
          }
        }
      }
    }

    setOrders(fetchedOrders);
    setLoading(false);
  };

  const updateItemStatus = async (orderId, itemId, status, refetch = true) => {
    const urls = [
      `https://k-store-backend.onrender.com/api/admin/orders/${orderId}/item/${itemId}`,
      `http://localhost:5000/api/admin/orders/${orderId}/item/${itemId}`,
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.put(url, { status }, { headers: { Authorization: `Bearer ${token}` } });
        if (refetch) fetchOrders();
        break;
      } catch (err) {
        console.warn(`Failed to update item at ${url}:`, err.message);
      }
    }
  };

  const passOrder = async (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order) return;

    for (let item of order.items) {
      if (item.status === "pending") {
        await updateItemStatus(orderId, item._id, "accepted", false);
        item.status = "accepted";
      }
    }

    setOrders(prev => prev.map(o => (o._id === orderId ? { ...o, _passed: true } : o)));
    setPopup("Order Passed ✅");
    setTimeout(() => setPopup(""), 2000);
  };

  const confirmDeleteOrder = (orderId) => {
    setModal({ show: true, type: "single", orderId });
  };

  const confirmDeleteCompletedOrders = () => {
    setModal({ show: true, type: "all", orderId: null });
  };

  const handleModalConfirm = async () => {
    if (modal.type === "single" && modal.orderId) {
      await deleteOrder(modal.orderId);
    } else if (modal.type === "all") {
      await deleteAllCompleted();
    }
    setModal({ show: false, type: "", orderId: null });
  };

  const deleteOrder = async (orderId) => {
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
    setPopup("Order deleted ✅");
    setTimeout(() => setPopup(""), 2000);
  };

  const deleteAllCompleted = async () => {
    const completedOrders = orders.filter(order => getOrderStatus(order) !== "Pending");
    const token = sessionStorage.getItem("token");

    await Promise.all(
      completedOrders.map(async (order) => {
        const urls = [
          `https://k-store-backend.onrender.com/api/admin/orders/${order._id}`,
          `http://localhost:5000/api/admin/orders/${order._id}`,
        ];
        for (let url of urls) {
          try {
            await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
            break;
          } catch (err) {
            console.warn(`Failed to delete order ${order._id} at ${url}:`, err.message);
          }
        }
      })
    );

    fetchOrders();
    setPopup("All completed/rejected orders deleted ✅");
    setTimeout(() => setPopup(""), 2000);
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

  const getOrderStatus = (order) => {
    const allRejected = order.items.every(item => item.status === "rejected");
    const allCompleted = order.items.every(item => ["delivered", "rejected"].includes(item.status));
    return allRejected ? "Rejected" : allCompleted ? "Completed" : "Pending";
  };

  const renderOrders = (ordersList) =>
    ordersList.map(order => {
      const itemsByVendor = order.items.reduce((acc, item) => {
        const vendorId = item.vendor?._id || "Unknown";
        if (!acc[vendorId]) acc[vendorId] = { vendor: item.vendor, products: [] };
        acc[vendorId].products.push(item);
        return acc;
      }, {});

      const orderStatus = getOrderStatus(order);
      const hasPending = order.items.some(item => item.status === "pending");

      return (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <strong>Order:</strong> {order._id.slice(0, 6)}... | 
            <strong>Customer:</strong> {order.user.username} | 
            <strong>Total:</strong> GH₵{order.total} | 
            <strong>Fulfillment:</strong> {order.fulfillmentType || "N/A"} | 
            <span className={`order-badge ${orderStatus === "Pending" ? "badge-pending" : orderStatus === "Completed" ? "badge-completed" : "badge-rejected"}`}>
              {orderStatus}
            </span>
          </div>

          {!autoPass && hasPending && !order._passed && (
            <div className="vendor-actions" style={{ padding: "10px 20px" }}>
              <button className="pass-btn" onClick={() => passOrder(order._id)}>Pass Order</button>
            </div>
          )}

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
                          <div className="action-buttons">
                            {["accepted","preparing","ready"].includes(p.status) && (
                              <>
                                {p.status === "accepted" && (
                                  <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, p._id, "preparing")}>Preparing</button>
                                )}
                                {p.status === "preparing" && (
                                  <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, p._id, "ready")}>Ready</button>
                                )}
                                {p.status === "ready" && (
                                  <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, p._id, "delivered")}>Delivered</button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <button className="delete-btn" onClick={() => confirmDeleteOrder(order._id)}>Delete Order</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    });

  if (loading) return <div className="loader">Loading orders...</div>;

  const pendingOrders = orders.filter(order => getOrderStatus(order) === "Pending");
  const completedOrders = orders.filter(order => getOrderStatus(order) !== "Pending");

  return (
    <div className="orders-page">
      <h1>Orders Management 🛒</h1>

      <div className="auto-pass-toggle" style={{ marginBottom: "1rem" }}>
        <button className={`auto-pass-btn ${autoPass ? "on" : "off"}`} onClick={toggleAutoPass}>
          {autoPass ? "Auto Pass" : "Manual Pass"}
        </button>
      </div>

      {popup && <div className="popup">{popup}</div>}

      <h2>Pending Orders</h2>
      {pendingOrders.length === 0 ? <p>No pending orders.</p> : renderOrders(pendingOrders)}

      <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Completed / Rejected Orders
        {completedOrders.length > 0 && (
          <button className="delete-btn" onClick={confirmDeleteCompletedOrders} style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
            Delete All Completed
          </button>
        )}
      </h2>
      {completedOrders.length === 0 ? <p>No completed or rejected orders yet.</p> : renderOrders(completedOrders)}

      {/* Confirmation Modal */}
      {modal.show && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            <h2>Confirm Action</h2>
            <p>{modal.type === "single" ? "Delete this order?" : "Delete all completed/rejected orders?"}</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={handleModalConfirm}>Yes</button>
              <button onClick={() => setModal({ show: false, type: "", orderId: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
