import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Users.css";

// Modal Component
function Modal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="confirm-btn" onClick={onConfirm}>Yes</button>
          <button className="cancel-btn" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "customer" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState({ visible: false, message: "", action: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch Users
  const fetchUsers = async () => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users",
      "http://localhost:5000/api/admin/users",
    ];
    const token = sessionStorage.getItem("token");
    let fetchedData = [];

    for (let url of urls) {
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        fetchedData = Array.isArray(res.data) ? res.data : [];
        break;
      } catch (err) {
        console.warn(`Failed to fetch from ${url}:`, err.message);
      }
    }

    setUsers(fetchedData);
    setLoading(false);
  };

  // Toggle User Active Status
  const toggleActive = async (id, currentStatus) => {
    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users/",
      "http://localhost:5000/api/admin/users/",
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        await axios.put(`${url}${id}/activate`, { active: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(prev => prev.map(u => u._id === id ? { ...u, active: !currentStatus } : u));
        break;
      } catch (err) {
        console.warn(`Failed to update user at ${url}:`, err.message);
      }
    }
  };

  // Delete User with Confirmation
  const handleDeleteUser = (id, role) => {
    setModal({
      visible: true,
      message: `Are you sure you want to delete this ${role}?${role === "vendor" ? " All their products will also be deleted." : ""}`,
      action: async () => {
        const urls = [
          "https://k-store-backend.onrender.com/api/admin/users/",
          "http://localhost:5000/api/admin/users/",
        ];
        const token = sessionStorage.getItem("token");

        for (let url of urls) {
          try {
            await axios.delete(`${url}${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setUsers(prev => prev.filter(u => u._id !== id));
            break;
          } catch (err) {
            console.warn(`Failed to delete user at ${url}:`, err.message);
          }
        }

        setModal({ visible: false, message: "", action: null });
      },
    });
  };

  const handleClearPassword = (id, username) => {
    setModal({
      visible: true,
      message: `Clear password for ${username}? They will need to set a new one.`,
      action: async () => {
        const urls = [
          "https://k-store-backend.onrender.com/api/admin/users/",
          "http://localhost:5000/api/admin/users/",
        ];
        const token = sessionStorage.getItem("token");

        for (let url of urls) {
          try {
            await axios.put(`${url}${id}/clear-password`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            });
            break;
          } catch (err) {
            console.warn(`Failed to clear password at ${url}:`, err.message);
          }
        }

        setModal({ visible: false, message: "", action: null });
      },
    });
  };


  // Add User
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setModal({
        visible: true,
        message: "All fields are required!",
        action: () => setModal({ visible: false, message: "", action: null }),
      });
      return;
    }

    const urls = [
      "https://k-store-backend.onrender.com/api/admin/users",
      "http://localhost:5000/api/admin/users",
    ];
    const token = sessionStorage.getItem("token");

    for (let url of urls) {
      try {
        const res = await axios.post(url, newUser, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(prev => [...prev, res.data.user]);
        setNewUser({ username: "", email: "", password: "", role: "customer" });
        break;
      } catch (err) {
        console.warn(`Failed to add user at ${url}:`, err.message);
      }
    }
  };

  const filteredUsers = users.filter(u => {
    if (filter !== "all" && u.role !== filter) return false;
    if (search) return u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  if (loading) return <div className="loader">Loading users...</div>;

 // User Detail Modal with Icons
function UserDetailModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content user-detail-modal">
        <h2>{user.username}'s Details</h2>

        <div className="user-detail-row">
          {user.firstName && user.lastName && (
            <p className="user-detail">
              <span>👤 Full Name:</span> {user.firstName} {user.lastName}
            </p>
          )}

          {user.role === "vendor" && user.businessName && (
            <p className="user-detail">
              <span>🏢 Business Name:</span> {user.businessName}
            </p>
          )}

          {user.email && (
            <p className="user-detail">
              <span>✉️ Email:</span> {user.email}
            </p>
          )}

          {user.phone && (
            <p className="user-detail">
              <span>📞 Phone:</span> {user.phone}
            </p>
          )}

          {user.location && (
            <p className="user-detail">
              <span>📍 Location:</span> {user.location}
            </p>
          )}

          <p className="user-detail">
            <span>🛠 Role:</span> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </p>

          <p className="user-detail">
            <span>✅ Status:</span> {user.active ? "Active" : "Inactive"}
          </p>
        </div>

        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}


  return (
    <div className="users-page">
      <h1>Users Management 👤</h1>
      <p>View and manage all users on the platform.</p>

      {/* Add User Form */}
      <div className="add-user-form">
        <h3>Add New User</h3>
        <input type="text" placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
        <input type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
        <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
        <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
        </select>
        <button className="add-btn" onClick={handleAddUser}>Add User</button>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-container">
        <input type="text" placeholder="Search by username or email..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        <div className="filter-buttons">
          {["all", "customer", "vendor"].map(f => (
            <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1) + "s"}
            </button>
          ))}
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
              <tr><td colSpan="5">No users found</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <span className="username-link" onClick={() => setSelectedUser(u)}>
                      {u.username}
                    </span>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td><span className={`status ${u.active ? "active" : "inactive"}`}>{u.active ? "Active" : "Inactive"}</span></td>
                  <td>
                    <button className={`toggle-btn ${u.active ? "deactivate" : "activate"}`} onClick={() => toggleActive(u._id, u.active)}>{u.active ? "Deactivate" : "Activate"}</button>
                    <button className="delete-btn" onClick={() => handleDeleteUser(u._id, u.role)}>Delete</button>
                    <button className="clear-btn" onClick={() => handleClearPassword(u._id, u.username)}>Clear Password</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedUser && 
      ( <UserDetailModal user={selectedUser} 
        onClose={() => setSelectedUser(null)} />
        )}

      {modal.visible && <Modal message={modal.message} onConfirm={modal.action} onCancel={() => setModal({ visible: false, message: "", action: null })} />}
    </div>
  );
}

export default Users;
