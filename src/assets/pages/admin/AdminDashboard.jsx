// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
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
    try {
      const urls = {
        users: "/api/admin/users",
        vendors: "/api/admin/vendors",
        products: "/api/admin/products",
        orders: "/api/admin/orders",
      };

      const [usersRes, vendorsRes, productsRes, ordersRes] = await Promise.all(
        Object.values(urls).map((url) =>
          axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
        )
      );

      const orders = ordersRes.data;
      const revenue = orders.reduce((sum, order) => sum + order.total, 0);

      setStats({
        users: usersRes.data.length,
        vendors: vendorsRes.data.length,
        products: productsRes.data.length,
        orders: orders.length,
        revenue,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
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
          <p>{stats.users}</p>
        </div>
        <div className="card">
          <h3>Total Vendors</h3>
          <p>{stats.vendors}</p>
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
