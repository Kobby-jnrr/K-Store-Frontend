import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Orders.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/orders",
      "http://localhost:5000/api/admin/orders",
    ];

    const token = localStorage.getItem("token");
    let fetchedOrders = [];

    for (let url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchedOrders = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch orders from ${url}:`, err.message);
      }
    }

    setOrders(fetchedOrders);
    setLoading(false);
  };

  const updateStatus = async (orderId, newStatus) => {
    const urls = [
      `https://k-store-backend.onrender.com/api/admin/orders/${orderId}`,
      `http://localhost:5000/api/admin/orders/${orderId}`,
    ];
    const token = localStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.put(url, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
        fetchOrders();
        break;
      } catch (err) {
        console.warn(`Failed to update order at ${url}:`, err.message);
      }
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    const urls = [
      `https://k-store-backend.onrender.com/api/admin/orders/${orderId}`,
      `http://localhost:5000/api/admin/orders/${orderId}`,
    ];
    const token = localStorage.getItem("token");

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

  if (loading) return <div className="loader">Loading orders...</div>;

  return (
    <div className="orders-page">
      <h1>Orders Management 🛒</h1>
      <p>View and manage all customer orders.</p>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customer?.username || "N/A"}</td>
                  <td>
                    {order.products?.map((p) => (
                      <div key={p._id}>{p.title} x {p.quantity}</div>
                    ))}
                  </td>
                  <td>${order.total}</td>
                  <td>{order.status}</td>
                  <td>
                    {order.status !== "delivered" && (
                      <button
                        onClick={() => updateStatus(order._id, "delivered")}
                      >
                        Mark Delivered
                      </button>
                    )}
                    <button onClick={() => deleteOrder(order._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
