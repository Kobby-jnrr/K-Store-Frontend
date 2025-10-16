import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./Notification.css";

function Notification({ user, token }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const socket = useRef(null);

  // Fetch notifications from backend
  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
  }, [user, token]);

  // Setup Socket.IO
  useEffect(() => {
    socket.current = io("http://localhost:5000"); // replace with deployed URL

    socket.current.on("new-notification", (notif) => {
      if (notif.target === user.role || notif.target === "both") {
        setNotifications((prev) => [notif, ...prev]);
      }
    });

    socket.current.on("delete-notification", ({ id }) => {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    });

    return () => socket.current.disconnect();
  }, [user.role]);

  // Mark notifications as read when opening popup
  useEffect(() => {
    if (!open) return;

    const unread = notifications.filter((n) => !n.readBy?.includes(user._id));

    unread.forEach((notif) => {
      axios.put(`/api/notifications/${notif._id}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(console.error);
    });

    setNotifications((prev) =>
      prev.map((n) =>
        !n.readBy?.includes(user._id)
          ? { ...n, readBy: [...(n.readBy || []), user._id] }
          : n
      )
    );
  }, [open, notifications, token, user._id]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readBy?.includes(user._id)).length;

  return (
    <div className="notification-wrapper" ref={popupRef}>
      <button className={`notification-icon ${open ? "active" : ""}`} onClick={() => setOpen(!open)}>
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
                className={`notification-item ${!n.readBy?.includes(user._id) ? "unread" : ""}`}
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
