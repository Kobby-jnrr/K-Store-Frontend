import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import "./AdminNotification.css";

const BACKEND_URLS = [
  "http://localhost:5000",
  "https://k-store-backend.onrender.com",
];

function AdminNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipientFilter, setRecipientFilter] = useState("All");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("both");

  const [showModal, setShowModal] = useState(false);

  const token = sessionStorage.getItem("token");
  const backendURL = BACKEND_URLS[0];

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendURL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedNotifications = Array.isArray(res.data.notifications)
        ? res.data.notifications
        : [];
      fetchedNotifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(fetchedNotifications);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setNotifications([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io(backendURL, { query: { role: "admin" } });
    socket.on("connect", () => console.log("✅ Admin socket connected"));
    socket.on("new-notification", (n) => {
      setNotifications((prev) => [n, ...prev]);
      toast.success(`New notification: ${n.title}`);
    });

    return () => socket.disconnect();
  }, []);

  const sendNotification = async (e) => {
    e.preventDefault();
    if (!title || !message) return toast.error("Title and message are required");

    try {
      const res = await axios.post(
        `${backendURL}/api/notifications`,
        { title, message, recipientType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => [res.data.notification, ...prev]);
      setTitle("");
      setMessage("");
      setRecipientType("both");
      toast.success("Notification sent successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send notification");
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete(`${backendURL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setShowModal(false);
      toast.success("All notifications deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete notifications");
    }
  };

  if (loading) return <div className="loader">Loading notifications...</div>;

  const filteredNotifications = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRecipient =
      recipientFilter === "All" ||
      (recipientFilter === "Customer" && n.recipientType === "customer") ||
      (recipientFilter === "Vendor" && n.recipientType === "vendor") ||
      (recipientFilter === "Both" && n.recipientType === "both");

    return matchesSearch && matchesRecipient;
  });

  return (
    <div className="admin-notification-page">
      <Toaster />
      <h1>Admin Notifications 🔔</h1>
      <p>Send new notifications or manage existing ones.</p>

      {/* Send Notification Form */}
      <form className="notification-form" onSubmit={sendNotification}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Recipient</label>
          <select
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value)}
          >
            <option value="both">Both</option>
            <option value="customer">Customer</option>
            <option value="vendor">Vendor</option>
          </select>
        </div>

        <button type="submit">Send</button>
      </form>

      {/* Filters & Delete All */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title or message"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={recipientFilter}
          onChange={(e) => setRecipientFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Customer">Customer</option>
          <option value="Vendor">Vendor</option>
          <option value="Both">Both</option>
        </select>

        <button className="delete-all-btn" onClick={() => setShowModal(true)}>
          Delete All
        </button>
      </div>

      {/* Notifications Table */}
      <div className="notifications-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Recipient</th>
              <th>Read By</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan="5">No notifications found</td>
              </tr>
            ) : (
              filteredNotifications.map((n) => (
                <tr key={n._id}>
                  <td>{n.title}</td>
                  <td>{n.message}</td>
                  <td>
                    {n.recipientType.charAt(0).toUpperCase() +
                      n.recipientType.slice(1)}
                  </td>
                  <td>{n.readBy?.length || 0}</td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete all notifications?</p>
            <div className="modal-actions">
              <button onClick={deleteAllNotifications} className="confirm-btn">Yes, Delete</button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotification;
