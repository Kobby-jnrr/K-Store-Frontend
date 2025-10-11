import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    vendors: 0,
    products: 0,
    orders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = sessionStorage.getItem("token");
    const urls = [
      { key: "users", urls: ["https://k-store-backend.onrender.com/api/admin/users", "http://localhost:5000/api/admin/users"] },
      { key: "vendors", urls: ["https://k-store-backend.onrender.com/api/admin/vendors", "http://localhost:5000/api/admin/vendors"] },
      { key: "products", urls: ["https://k-store-backend.onrender.com/api/admin/products", "http://localhost:5000/api/admin/products"] },
      { key: "orders", urls: ["https://k-store-backend.onrender.com/api/admin/orders", "http://localhost:5000/api/admin/orders"] },
    ];

    const fetchDataWithFallback = async (urls) => {
      for (let url of urls) {
        try {
          const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
          if (Array.isArray(res.data)) return res.data;
        } catch (err) {
          console.warn(`Failed to fetch from ${url}:`, err.message);
        }
      }
      return [];
    };

    try {
      const [users, vendors, products, orders] = await Promise.all(
        urls.map((u) => fetchDataWithFallback(u.urls))
      );

      const totalUsers = users.length + vendors.length;
      const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({
        totalUsers,
        customers: users.length,
        vendors: vendors.length,
        products: products.length,
        orders: orders.length,
        revenue,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Loading dashboard...</div>;

  return (
    <main className="admin-dashboard">
      <h1>Welcome, Admin 👑</h1>
      <p>Overview of K-Store performance</p>

      <div className="stats-cards">
        <div className="card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
          <small>Customers: {stats.customers} | Vendors: {stats.vendors}</small>
        </div>
        <div className="card">
          <h3>Total Products</h3>
          <p>{stats.products}</p>
        </div>
        <div className="card">
          <h3>Total Orders</h3>
          <p>{stats.orders}</p>
        </div>
        <div className="card">
          <h3>Total Revenue</h3>
          <p>${stats.revenue.toFixed(2)}</p>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
