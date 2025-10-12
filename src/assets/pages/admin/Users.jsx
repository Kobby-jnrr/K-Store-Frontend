import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | customer | vendor
  const [search, setSearch] = useState(""); // search query

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "customer",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users",
      "http://localhost:5000/api/admin/users",
    ];

    const token = sessionStorage.getItem("token");
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

  // Activate / Deactivate User
  const toggleActive = async (id, currentStatus) => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users/",
      "http://localhost:5000/api/admin/users/",
    ];
    const token = sessionStorage.getItem("token");

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

  // Delete User
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users/",
      "http://localhost:5000/api/admin/users/",
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.delete(`${url}${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.filter((u) => u._id !== id));
        alert("User deleted successfully!");
        break;
      } catch (err) {
        console.warn(`Failed to delete user at ${url}:`, err.message);
      }
    }
  };

  // Add User
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert("All fields are required!");
      return;
    }

    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users",
      "http://localhost:5000/api/admin/users",
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        const res = await axios.post(url, newUser, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => [...prev, res.data.user]);
        alert(res.data.message || "User added successfully!");
        setNewUser({ username: "", email: "", password: "", role: "customer" });
        break;
      } catch (err) {
        console.warn(`Failed to add user at ${url}:`, err.message);
      }
    }
  };

  // Filtered Users
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

      {/* Add User Form */}
      <div className="add-user-form">
        <h3>Add New User</h3>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
        </select>
        <button onClick={handleAddUser}>Add User</button>
      </div>

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

      {/* Users Table */}
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
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
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
