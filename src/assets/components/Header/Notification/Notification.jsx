import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./Notification.css";

function Notification({ user, token }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const socket = useRef(null);

  // -------- Fetch notifications for logged-in user --------
  useEffect(() => {
    if (!user || !token) return;

    axios
      .get("/api/notifications", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setNotifications(res.data))
      .catch(console.error);
  }, [user, token]);

  // -------- Socket.IO setup --------
  useEffect(() => {
    if (!user) return;

    socket.current = io("http://localhost:5000"); // replace with deployed URL
    socket.current.emit("join-room", user._id); // join user-specific room

    socket.current.on("new-notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.current.on("delete-notification", (id) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    });

    return () => socket.current.disconnect();
  }, [user]);

  // -------- Mark notifications as read when popup opens --------
  useEffect(() => {
    if (!open || !user || !token) return;

    notifications.forEach((notif) => {
      if (!notif.read) {
        axios
          .put(`/api/notifications/${notif._id}/read`, null, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(() =>
            setNotifications((prev) =>
              prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n))
            )
          )
          .catch(console.error);
      }
    });
  }, [open, notifications, token]);

  // -------- Close popup when clicking outside --------
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notification-wrapper" ref={popupRef}>
      <button
        className={`notification-icon ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
      >
        🔔
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
                className={`notification-item ${!n.read ? "unread" : ""}`}
              >
                <p>{n.message}</p>
                <span className="time">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
