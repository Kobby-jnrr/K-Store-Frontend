import React from "react";
import { NavLink } from "react-router-dom";
import "./AdminSidebar.css";

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h2>K-Store Admin</h2>
      </div>

      <nav className="admin-nav">
        <NavLink to="/admin/dashboard" className="admin-link">
          📊 Dashboard
        </NavLink>
        <NavLink to="/admin/vendors" className="admin-link">
          🏪 Vendors
        </NavLink>
        <NavLink to="/admin/users" className="admin-link">
          👤 Users
        </NavLink>
        <NavLink to="/admin/products" className="admin-link">
          📦 Products
        </NavLink>
        <NavLink to="/admin/orders" className="admin-link">
          🧾 Orders
        </NavLink>
        <NavLink to="/admin/promo" className="admin-link">
          🎉 Promo Board
        </NavLink>
        <NavLink to="/admin/notification" className="admin-link">
          🔔Notifications
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
