import React from "react";
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
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const handleAddUser = () => {
    // Navigate to create user page or open modal
    console.log("Add User clicked");
  };

  const handleAddProduct = () => {
    // Navigate to add product page
    console.log("Add Product clicked");
  };

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <AdminHeader
        user={user}
        logout={logout}           // matches AdminHeader's logout prop
        onAddUser={handleAddUser}
        onAddProduct={handleAddProduct}
      />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="admin-content">
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
    </div>
  );
}

export default AdminLayout;
