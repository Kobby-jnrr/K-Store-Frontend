import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
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
  const [revenueData, setRevenueData] = useState([]);
  const [ordersBarData, setOrdersBarData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
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

      // Revenue over orders
      const revenueTimeline = orders.map((o, idx) => ({ name: `Order ${idx+1}`, revenue: o.total || 0 }));

      // Orders per day (simplified: use order index as "day")
      const ordersByDay = orders.reduce((acc, _, idx) => {
        const day = `Day ${Math.floor(idx / 5) + 1}`; // group every 5 orders as a day
        if (!acc[day]) acc[day] = 0;
        acc[day] += 1;
        return acc;
      }, {});
      const ordersBar = Object.keys(ordersByDay).map(key => ({ day: key, orders: ordersByDay[key] }));

      // Most recent 5 orders
      const recent = orders.slice(-5).reverse();

      setStats({ totalUsers, customers: users.length, vendors: vendors.length, products: products.length, orders: orders.length, revenue });
      setRevenueData(revenueTimeline);
      setOrdersBarData(ordersBar);
      setRecentOrders(recent);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Loading dashboard...</div>;

  const pieData = [
    { name: "Customers", value: stats.customers },
    { name: "Vendors", value: stats.vendors },
  ];
  const COLORS = ["#0088FE", "#00C49F"];

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

      <div className="charts-container">
        <div className="chart">
          <h3>Revenue Over Orders</h3>
          <LineChart width={500} height={300} data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#007bff" />
          </LineChart>
        </div>

        <div className="chart">
          <h3>User Distribution</h3>
          <PieChart width={300} height={300}>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="chart">
          <h3>Orders per Day</h3>
          <BarChart width={500} height={300} data={ordersBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#FF8042" />
          </BarChart>
        </div>
      </div>

      <div className="recent-orders">
        <h3>Recent Orders</h3>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map(order => (
              <tr key={order._id}>
                <td>{order._id.slice(0,6)}...{order._id.slice(-4)}</td>
                <td>{order.user?.username || "Unknown"}</td>
                <td>GH₵{order.total?.toFixed(2) || 0}</td>
                <td>{order.items.every(p => p.status === "delivered") ? "Delivered" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default AdminDashboard;
