import React, { useState, useEffect } from "react";
import axios from "axios";
import "./VendorOrders.css";

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorOrders();
    const interval = setInterval(fetchVendorOrders, 5000); // fetch new orders
    return () => clearInterval(interval);
  }, []);

  const fetchVendorOrders = async () => {
    const token = sessionStorage.getItem("token");

    const urls = [
      `${import.meta.env.VITE_API_BASE_URL || "https://k-store-backend.onrender.com"}/api/orders/vendor-orders`,
      "http://localhost:5000/api/orders/vendor-orders"
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
        console.warn(`Failed to fetch from ${url}:`, err.message);
      }
    }

    setOrders(prev => {
      // merge new orders with local changes
      const merged = fetchedOrders.map(fetched => {
        const local = prev.find(o => o._id === fetched._id);
        if (!local) return fetched; // new order
        // merge local items that have been updated
        const mergedItems = fetched.items.map(fetchedItem => {
          const localItem = local.items.find(i => i._id === fetchedItem._id);
          return localItem ? localItem : fetchedItem;
        });
        return { ...fetched, items: mergedItems };
      });
      return merged;
    });

    setLoading(false);
  };

  const updateItemStatus = async (orderId, itemId, status) => {
    const token = sessionStorage.getItem("token");

    const urls = [
      `${import.meta.env.VITE_API_BASE_URL || "https://k-store-backend.onrender.com"}/api/orders/vendor-orders/${orderId}/item/${itemId}`,
      `http://localhost:5000/api/orders/vendor-orders/${orderId}/item/${itemId}`
    ];

    let success = false;
    for (let url of urls) {
      try {
        await axios.put(url, { status }, { headers: { Authorization: `Bearer ${token}` } });
        success = true;
        break;
      } catch {}
    }

    if (success) {
      // update locally only
      setOrders(prev => prev.map(order => {
        if (order._id !== orderId) return order;
        return {
          ...order,
          items: order.items.map(item => item._id === itemId ? { ...item, status } : item)
        };
      }));
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case "Pending": return "badge-pending";
      case "Completed": return "badge-completed";
      case "Rejected": return "badge-rejected";
      default: return "";
    }
  };

  if (loading) return <div className="loader">Loading vendor orders...</div>;

  return (
    <div className="vendor-orders-page">
      <h1>Your Orders 🛍️</h1>
      {orders.length === 0 ? (
        <p>No orders for your products yet.</p>
      ) : (
        orders.map(order => {
          const allRejected = order.items.every(item => item.status === "rejected");
          const allCompleted = order.items.every(item => ["delivered", "rejected"].includes(item.status));
          const orderStatus = allRejected ? "Cannot be delivered" : allCompleted ? "Completed" : "Pending";

          return (
            <div key={order._id} className="vendor-order-card">
              <div className="order-header">
                <h2>Order: {order._id.slice(0, 8)}...</h2>
                <span className={`order-badge ${getBadgeClass(orderStatus)}`}>{orderStatus}</span>
              </div>
              <p>Customer: {order.user.username}</p>

              <div className="vendor-order-items">
                {order.items.map(item => {
                  const friendlyStatus = item.status === "rejected" ? "Cannot be delivered" : item.status;

                  return (
                    <div key={item._id} className="vendor-order-item">
                      <span>{item.product.title} x {item.quantity}</span>
                      <span>Status: {friendlyStatus}</span>

                      {item.status === "pending" && (
                        <div className="action-buttons">
                          <button onClick={() => updateItemStatus(order._id, item._id, "accepted")} className="accept-btn">Accept</button>
                          <button onClick={() => updateItemStatus(order._id, item._id, "rejected")} className="reject-btn">Reject</button>
                        </div>
                      )}

                      {["accepted", "preparing", "ready"].includes(item.status) && (
                        <div className="action-buttons">
                          {item.status === "accepted" && (
                            <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, item._id, "preparing")}>
                              Preparing
                            </button>
                          )}
                          {item.status === "preparing" && (
                            <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, item._id, "ready")}>
                              Ready
                            </button>
                          )}
                          {item.status === "ready" && (
                            <button style={{ backgroundColor: "#4caf50" }} onClick={() => updateItemStatus(order._id, item._id, "delivered")}>
                              Delivered
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default VendorOrders;
