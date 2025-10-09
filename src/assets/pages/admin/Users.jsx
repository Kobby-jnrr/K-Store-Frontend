import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | customer | vendor
  const [search, setSearch] = useState(""); // search query

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users",
      "http://localhost:5000/api/admin/users",
    ];

    const token = localStorage.getItem("token");
    let fetchedData = [];

    for (let url of urls) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchedData = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch from ${url}:`, err.message);
      }
    }

    setUsers(fetchedData);
    setLoading(false);
  };

  const toggleActive = async (id, currentStatus) => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users/",
      "http://localhost:5000/api/admin/users/",
    ];
    const token = localStorage.getItem("token");

    for (let url of urls) {
      try {
        const res = await axios.put(
          `${url}${id}/activate`,
          { active: !currentStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers((prev) =>
          prev.map((user) =>
            user._id === id ? { ...user, active: !currentStatus } : user
          )
        );

        alert(res.data.message || "User status updated");
        break;
      } catch (err) {
        console.warn(`Failed to update user at ${url}:`, err.message);
      }
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter !== "all" && user.role !== filter) return false;
    if (search) {
      return (
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  if (loading) return <div className="loader">Loading users...</div>;

  return (
    <div className="users-page">
      <h1>Users Management 👤</h1>
      <p>View and manage all users on the platform.</p>

      {/* Search and Filter */}
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "customer" ? "active" : ""}
            onClick={() => setFilter("customer")}
          >
            Customers
          </button>
          <button
            className={filter === "vendor" ? "active" : ""}
            onClick={() => setFilter("vendor")}
          >
            Vendors
          </button>
        </div>
      </div>

<div className="users-table-wrapper">
  <table className="users-table">
    <thead>
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsers.length === 0 ? (
        <tr>
          <td colSpan="5">No users found</td>
        </tr>
      ) : (
        filteredUsers.map((user) => (
          <tr key={user._id}>
            <td>{user.username}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <span className={`status ${user.active ? "active" : "inactive"}`}>
                {user.active ? "Active" : "Inactive"}
              </span>
            </td>
            <td>
              <button
                className={`toggle-btn ${user.active ? "deactivate" : "activate"}`}
                onClick={() => toggleActive(user._id, user.active)}
              >
                {user.active ? "Deactivate" : "Activate"}
              </button>
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

export default Users;
