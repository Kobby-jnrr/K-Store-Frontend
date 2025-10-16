import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./AdminNotification.css";

const SOCKET_URL = "http://localhost:5000"; // change to your deployed URL

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("both");
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState("");
  const [modal, setModal] = useState({ show: false, notificationId: null });

  const token = sessionStorage.getItem("token");

  // ----- Socket.IO setup -----
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    // Listen for new notifications from the server
    socket.on("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setPopup(`New notification: ${data.message}`);
      setTimeout(() => setPopup(""), 3000);
    });

    // Listen for deleted notifications
    socket.on("delete-notification", (id) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setPopup("A notification was deleted ❌");
      setTimeout(() => setPopup(""), 2000);
    });

    return () => socket.disconnect();
  }, []);

  // ----- Fetch notifications from backend -----
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const urls = [
        "https://k-store-backend.onrender.com/api/notifications",
        "http://localhost:5000/api/notifications",
      ];
      let data = [];
      for (let url of urls) {
        try {
          const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
          data = Array.isArray(res.data) ? res.data : [];
          break;
        } catch (err) {
          console.warn(`Failed to fetch from ${url}:`, err.message);
        }
      }
      setNotifications(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!message.trim()) return setPopup("Message cannot be empty");

    try {
      const urls = [
        "https://k-store-backend.onrender.com/api/notifications",
        "http://localhost:5000/api/notifications",
      ];
      let sent = false;
      for (let url of urls) {
        try {
          await axios.post(
            url,
            { message, target },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          sent = true;
          break;
        } catch (err) {
          console.warn(`Failed to send notification to ${url}:`, err.message);
        }
      }

      if (sent) {
        setPopup("Notification sent ✅");
        setMessage("");
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
      setPopup("Failed to send notification ❌");
    }
    setTimeout(() => setPopup(""), 2000);
  };

  const confirmDeleteNotification = (id) => {
    setModal({ show: true, notificationId: id });
  };

  const handleModalConfirm = async () => {
    if (!modal.notificationId) return;
    try {
      const urls = [
        `https://k-store-backend.onrender.com/api/notifications/${modal.notificationId}`,
        `http://localhost:5000/api/notifications/${modal.notificationId}`,
      ];
      for (let url of urls) {
        try {
          await axios.delete(url, { headers: { Authorization: `Bearer ${token}` } });
          break;
        } catch (err) {
          console.warn(`Failed to delete at ${url}:`, err.message);
        }
      }
      // Emit deletion event manually (optional if backend already emits)
      setNotifications((prev) => prev.filter((n) => n._id !== modal.notificationId));
      setPopup("Notification deleted ✅");
    } catch (err) {
      console.error(err);
      setPopup("Failed to delete notification ❌");
    }
    setModal({ show: false, notificationId: null });
    setTimeout(() => setPopup(""), 2000);
  };

  if (loading) return <div className="loader">Loading notifications...</div>;

  return (
    <div className="admin-notifications-page">
      <h1>Admin Notifications 🔔</h1>

      {popup && <div className="popup">{popup}</div>}

      <div className="notification-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter notification message..."
        />
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="both">Both Customers & Vendors</option>
          <option value="vendor">Vendors Only</option>
          <option value="customer">Customers Only</option>
        </select>
        <button className="send-btn" onClick={sendNotification}>
          Send Notification
        </button>
      </div>

      <h2>Sent Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications sent yet.</p>
      ) : (
        notifications.map((n) => (
          <div key={n._id} className="notification-card">
            <div className="notification-card-header">
              <span className="notification-message">{n.message}</span>
              <span className="notification-target">Target: {n.target}</span>
              <span className="notification-time">{new Date(n.createdAt).toLocaleString()}</span>
              <button className="delete-btn" onClick={() => confirmDeleteNotification(n._id)}>Delete</button>
            </div>
          </div>
        ))
      )}

      {/* Confirmation Modal */}
      {modal.show && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this notification?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={handleModalConfirm}>Yes</button>
              <button onClick={() => setModal({ show: false, notificationId: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
