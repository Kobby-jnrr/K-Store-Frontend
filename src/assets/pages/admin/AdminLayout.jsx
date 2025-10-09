import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import Vendors from "./Vendors.jsx";
import Users from "./Users.jsx";
import Products from "./Products.jsx";
import Orders from "./Orders.jsx";

import "./AdminLayout.css";

function AdminLayout({ user }) {
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Header */}
      <Header user={user} />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="admin-content">
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminLayout;
