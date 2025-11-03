import React, { useState, useEffect } from "react";
import API from "../../../api/axios"; // centralized API module
import OrderItemDisplay from "../Body/OrderItemDisplay";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [autoPass, setAutoPass] = useState(
    () => localStorage.getItem("autoPass") === "true"
  );
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
    try {
      const res = await API.get("/admin/orders");
      const fetchedOrders = Array.isArray(res.data) ? res.data : [];

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
    } catch (err) {
      console.warn("Failed to fetch orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (orderId, itemId, status, refetch = true) => {
    try {
      await API.put(`/admin/orders/${orderId}/item/${itemId}`, { status });
      if (refetch) fetchOrders();
    } catch (err) {
      console.warn("Failed to update item status:", err.message);
    }
  };

  const passOrder = async (orderId) => {
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    for (let item of order.items) {
      if (item.status === "pending") {
        await updateItemStatus(orderId, item._id, "accepted", false);
        item.status = "accepted";
      }
    }

    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, _passed: true } : o))
    );
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
    try {
      await API.delete(`/admin/orders/${orderId}`);
      fetchOrders();
      setPopup("Order deleted ✅");
      setTimeout(() => setPopup(""), 2000);
    } catch (err) {
      console.warn("Failed to delete order:", err.message);
    }
  };

  const deleteAllCompleted = async () => {
    const completedOrders = orders.filter(
      (order) => getOrderStatus(order) !== "Pending"
    );
    await Promise.all(
      completedOrders.map((order) =>
        API.delete(`/admin/orders/${order._id}`).catch((err) =>
          console.warn(err.message)
        )
      )
    );
    fetchOrders();
    setPopup("All completed/rejected orders deleted ✅");
    setTimeout(() => setPopup(""), 2000);
  };

  const toggleVendor = (orderId, vendorId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [vendorId]: !prev[orderId]?.[vendorId],
      },
    }));
  };

  const getOrderStatus = (order) => {
    const allRejected = order.items.every((item) => item.status === "rejected");
    const allCompleted = order.items.every((item) =>
      ["delivered", "rejected"].includes(item.status)
    );
    return allRejected ? "Rejected" : allCompleted ? "Completed" : "Pending";
  };

  const renderOrders = (ordersList) =>
    ordersList.map((order) => {
      const itemsByVendor = order.items.reduce((acc, item) => {
        const vendorId = item.vendor?._id || "Unknown";
        if (!acc[vendorId])
          acc[vendorId] = { vendor: item.vendor, products: [] };
        acc[vendorId].products.push(item);
        return acc;
      }, {});

      const orderStatus = getOrderStatus(order);
      const hasPending = order.items.some((item) => item.status === "pending");

      return (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <strong>Order:</strong> {order._id.slice(0, 6)}... |
            <strong>Customer:</strong> {order.user.username} |
            <strong>Location:</strong> {order.user.location || "N/A"} |
            <strong>Phone:</strong> {order.user.phone || "N/A"} |
            <strong>Total:</strong> GH₵{order.total} |
            <strong>Fulfillment:</strong> {order.fulfillmentType || "N/A"} |
            <span
              className={`order-badge ${
                orderStatus === "Pending"
                  ? "badge-pending"
                  : orderStatus === "Completed"
                  ? "badge-completed"
                  : "badge-rejected"
              }`}
            >
              {orderStatus}
            </span>
          </div>

          {!autoPass && hasPending && !order._passed && (
            <div className="vendor-actions" style={{ padding: "10px 20px" }}>
              <button className="pass-btn" onClick={() => passOrder(order._id)}>
                Pass Order
              </button>
            </div>
          )}

          <div className="vendors-list">
            {Object.values(itemsByVendor).map((group) => {
              const vendorId = group.vendor?._id || "Unknown";
              const isExpanded = expandedOrders[order._id]?.[vendorId];

              const vendorStatus = group.products.every((p) =>
                ["accepted", "preparing", "ready", "delivered"].includes(
                  p.status
                )
              )
                ? group.products.find((p) => p.status !== "delivered")
                    ?.status || "Accepted"
                : group.products.some((p) => p.status === "rejected")
                ? "Rejected"
                : "Pending";

              return (
                <div key={vendorId} className="vendor-section">
                  <div
                    className="vendor-header"
                    onClick={() => toggleVendor(order._id, vendorId)}
                  >
                    <span>
                      {group.vendor?.username || "Unknown"}(
                      {group.vendor?.phone || "N/A"}) ({vendorId.slice(0, 6)}
                      ...) - Status: {vendorStatus}
                    </span>
                    <span>{isExpanded ? "▲" : "▼"}</span>
                  </div>

                  {isExpanded && (
                    <div className="vendor-products">
                      {group.products.map((p) => (
                        <div key={p._id} className="vendor-product">
                          {p.product?.title} x {p.quantity} - Status: {p.status}
                          <div className="action-buttons">
                            {["accepted", "preparing", "ready"].includes(
                              p.status
                            ) && (
                              <>
                                {p.status === "accepted" && (
                                  <button
                                    style={{ backgroundColor: "#4caf50" }}
                                    onClick={() =>
                                      updateItemStatus(
                                        order._id,
                                        p._id,
                                        "preparing"
                                      )
                                    }
                                  >
                                    Preparing
                                  </button>
                                )}
                                {p.status === "preparing" && (
                                  <button
                                    style={{ backgroundColor: "#4caf50" }}
                                    onClick={() =>
                                      updateItemStatus(
                                        order._id,
                                        p._id,
                                        "ready"
                                      )
                                    }
                                  >
                                    Ready
                                  </button>
                                )}
                                {p.status === "ready" && (
                                  <button
                                    style={{ backgroundColor: "#4caf50" }}
                                    onClick={() =>
                                      updateItemStatus(
                                        order._id,
                                        p._id,
                                        "delivered"
                                      )
                                    }
                                  >
                                    Delivered
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        className="delete-btn"
                        onClick={() => confirmDeleteOrder(order._id)}
                      >
                        Delete Order
                      </button>
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

  const pendingOrders = orders.filter(
    (order) => getOrderStatus(order) === "Pending"
  );
  const completedOrders = orders.filter(
    (order) => getOrderStatus(order) !== "Pending"
  );

  return (
    <div className="orders-page">
      <h1>Orders Management 🛒</h1>

      <div className="auto-pass-toggle" style={{ marginBottom: "1rem" }}>
        <button
          className={`auto-pass-btn ${autoPass ? "on" : "off"}`}
          onClick={toggleAutoPass}
        >
          {autoPass ? "Auto Pass" : "Manual Pass"}
        </button>
      </div>

      {popup && <div className="popup">{popup}</div>}

      <h2>Pending Orders</h2>
      {pendingOrders.length === 0 ? (
        <p>No pending orders.</p>
      ) : (
        renderOrders(pendingOrders)
      )}

      <h2
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Completed / Rejected Orders
        {completedOrders.length > 0 && (
          <button
            className="delete-btn"
            onClick={confirmDeleteCompletedOrders}
            style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
          >
            Delete All Completed
          </button>
        )}
      </h2>
      {completedOrders.length === 0 ? (
        <p>No completed or rejected orders yet.</p>
      ) : (
        renderOrders(completedOrders)
      )}

      {modal.show && (
        <div className="order-modal-backdrop">
          <div className="order-modal">
            <h2>Confirm Action</h2>
            <p>
              {modal.type === "single"
                ? "Delete this order?"
                : "Delete all completed/rejected orders?"}
            </p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button onClick={handleModalConfirm}>Yes</button>
              <button
                onClick={() =>
                  setModal({ show: false, type: "", orderId: null })
                }
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
