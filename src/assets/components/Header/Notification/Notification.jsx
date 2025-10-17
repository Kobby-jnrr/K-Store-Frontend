import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import notificationIcon from "./notificationIcon.png";
import "./Notification.css";

const SOCKET_URL = "https://k-store-backend.onrender.com"; // Replace with deployed URL

function Notification({ user, token }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const socketRef = useRef(null);

  // -------- Fetch all notifications for logged-in user --------
  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("❌ Fetch notifications failed:", err.message);
      }
    };

    fetchNotifications();
  }, [user, token]);

  // -------- Socket.IO setup --------
  useEffect(() => {
    if (!user) return;

    // Connect to Socket.IO with userId and role
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      query: { userId: user._id, role: user.role },
    });

    // Listen for new notifications
    socketRef.current.on("new-notification", (notif) => {
      // Only add if relevant to this user
      if (notif.target === user.role || notif.target === "both") {
        setNotifications((prev) => [notif, ...prev]);
      }
    });

    socketRef.current.on("delete-notification", (id) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  // -------- Mark notifications as read when popup opens --------
  useEffect(() => {
    if (!open || !user || !token) return;

    notifications.forEach((notif) => {
      if (!notif.readBy?.includes(user._id)) {
        axios
          .put(`/api/notifications/${notif._id}/read`, null, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(() => {
            setNotifications((prev) =>
              prev.map((n) =>
                n._id === notif._id
                  ? { ...n, readBy: [...(n.readBy || []), user._id] }
                  : n
              )
            );
          })
          .catch(console.error);
      }
    });
  }, [open, notifications, token, user._id]);

  // -------- Close popup when clicking outside --------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(
    (n) => !(n.readBy || []).includes(user._id)
  ).length;

  return (
    <div className="notification-wrapper" ref={popupRef}>
      <button
        className={`notification-icon ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <img src={notificationIcon} className="notification" alt="notifications" />
        {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-popup">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p className="empty">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`notification-item ${
                  !(n.readBy || []).includes(user._id) ? "unread" : ""
                }`}
              >
                <p>{n.message}</p>
                <span className="time">
                  {new Date(n.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Notification;
