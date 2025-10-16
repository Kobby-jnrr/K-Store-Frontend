import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./AdminNotification.css";

const SOCKET_URL = "http://localhost:5000"; // Change when deployed
const API_URLS = [
  "http://localhost:5000/api/notifications",
  "https://k-store-backend.onrender.com/api/notifications",
];

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("both");
  const [popup, setPopup] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, id: null });
  const token = sessionStorage.getItem("token");

  // ----- Socket.IO setup -----
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });

    socket.on("connect", () => console.log("✅ Connected:", socket.id));

    socket.on("new-notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setPopup(`New notification: ${data.message}`);
      setTimeout(() => setPopup(""), 3000);
    });

    socket.on("delete-notification", (id) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setPopup("Notification deleted ❌");
      setTimeout(() => setPopup(""), 2000);
    });

    return () => socket.disconnect();
  }, []);

  // ----- Fetch notifications -----
  useEffect(() => {
    const fetchNotifications = async () => {
      for (const url of API_URLS) {
        try {
          const res = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotifications(res.data);
          break;
        } catch (err) {
          console.warn("❌ Fetch failed:", url, err.message);
        }
      }
      setLoading(false);
    };
    fetchNotifications();
  }, [token]);

  // ----- Send notification -----
  const sendNotification = async () => {
    if (!message.trim()) return setPopup("Message cannot be empty!");

    for (const url of API_URLS) {
      try {
        await axios.post(
          url,
          { message, target },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPopup("✅ Notification sent!");
        setMessage("");
        break;
      } catch (err) {
        console.warn("❌ Send failed:", url, err.message);
      }
    }

    setTimeout(() => setPopup(""), 2000);
  };

  // ----- Delete notification -----
  const deleteNotification = async () => {
    const id = modal.id;
    for (const url of API_URLS) {
      try {
        await axios.delete(`${url}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        setPopup("✅ Deleted");
        break;
      } catch (err) {
        console.warn("❌ Delete failed:", url, err.message);
      }
    }
    setModal({ show: false, id: null });
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
          Send
        </button>
      </div>

      <h2>Sent Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map((n) => (
          <div key={n._id} className="notification-card">
            <div className="notification-card-header">
              <span className="notification-message">{n.message}</span>
              <span className="notification-target">Target: {n.target}</span>
              <span className="notification-time">
                {new Date(n.createdAt).toLocaleString()}
              </span>
              <button
                className="delete-btn"
                onClick={() => setModal({ show: true, id: n._id })}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {modal.show && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Delete this notification?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button onClick={deleteNotification}>Yes</button>
              <button onClick={() => setModal({ show: false, id: null })}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
