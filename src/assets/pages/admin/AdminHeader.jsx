import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AdminHeader.css";

function AdminHeader({ logout, onAddUser, onAddProduct }) {

  return (
    <header className="admin-header">
      <div className="admin-logo">
        <h2>Admin Panel</h2>
      </div>

      <div className="quick-action">
        <button className="quick-btn" onClick={onAddUser}>➕ Add User</button>
        <button className="quick-btn" onClick={onAddProduct}>📦 Add Product</button>
        </div>

        <div className="admin-user">
          <button className="logOut" onClick={logout}>Logout</button>
        </div>

    </header>
  );
}

export default AdminHeader;
