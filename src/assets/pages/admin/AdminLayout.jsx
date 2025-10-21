import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminHeader from "./AdminHeader.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import Vendors from "./Vendors.jsx";
import Users from "./Users.jsx";
import Products from "./Products.jsx";
import Orders from "./Orders.jsx";
import PromoBoard from "./PromoBoard.jsx";
import AdminNotification from "./AdminNotification.jsx";
import "./AdminLayout.css";

function AdminLayout({ user, logout }) {
  const [showSidebar, setShowSidebar] = useState(true);

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const handleAddUser = () => console.log("Add User clicked");
  const handleAddProduct = () => console.log("Add Product clicked");

  return (
    <div className="admin-layout">
      <AdminHeader
        user={user}
        logout={logout}
        onAddUser={handleAddUser}
        onAddProduct={handleAddProduct}
      />

      {showSidebar && <AdminSidebar />}

      <div className={`admin-content ${showSidebar ? "sidebar-visible" : "sidebar-hidden"}`}>
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="promo" element={<PromoBoard />} />
          <Route path="notification" element={<AdminNotification token={user?.token} />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>

      {/* Floating Sidebar Toggle Button */}
      <button
        className="sidebar-toggle-floating"
        onClick={() => setShowSidebar(prev => !prev)}
      >
        {showSidebar ? "←" : "☰"}
      </button>
    </div>
  );
}

export default AdminLayout;
