import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import notificationIcon from "./notificationIcon.png";
import "./Notification.css";

// Backend URLs
const BACKEND_URLS = [
  "http://localhost:5000/api/notifications",
  "https://k-store-backend.onrender.com/api/notifications"
];

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);

  // Get token and userId from sessionStorage
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userId = user._id || user.id;
  const userIdStr = userId?.toString();

  // Try each backend URL in order
  const tryFetch = async (urls, fn) => {
    for (const url of urls) {
      try {
        return await fn(url);
      } catch {}
    }
    throw new Error("All backends failed");
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!token || !userIdStr) return;

    try {
      const res = await tryFetch(BACKEND_URLS, url =>
        axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      );

      const fetched = Array.isArray(res.data.notifications) ? res.data.notifications : [];
      const unread = fetched.filter(n => {
        const readBy = Array.isArray(n.readBy) ? n.readBy.map(id => id.toString()) : [];
        return !readBy.includes(userIdStr);
      }).length;

      setNotifications(fetched);
      setUnreadCount(unread);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Toggle popup & mark all read
  const togglePopup = async () => {
    setOpen(!open);
    if (!open) await markAllRead();
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    if (!token || !userIdStr) return;

    try {
      await tryFetch(BACKEND_URLS, url =>
        axios.put(`${url}/mark-read`, {}, { headers: { Authorization: `Bearer ${token}` } })
      );

      setNotifications(prev =>
        prev.map(n => {
          const readBy = Array.isArray(n.readBy) ? n.readBy.map(id => id.toString()) : [];
          return {
            ...n,
            readBy: readBy.includes(userIdStr) ? readBy : [...readBy, userIdStr]
          };
        })
      );
      setUnreadCount(0);
    } catch {}
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = e => {
      if (popupRef.current && !popupRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="notification-container" ref={popupRef}>
      <img
        src={notificationIcon}
        alt="Notifications"
        className="notification-icon"
        onClick={togglePopup}
      />
      {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

      {open && (
        <div className="notification-popup">
          {notifications.length === 0 ? (
            <p className="no-notifications">No notifications</p>
          ) : (
            notifications.map(n => {
              const readBy = Array.isArray(n.readBy) ? n.readBy.map(id => id.toString()) : [];
              const isRead = readBy.includes(userIdStr);

              return (
                <div
                  key={n._id}
                  className={`notification-item ${isRead ? "read" : "unread"}`}
                >
                  <h4>{n.title}</h4>
                  <p>{n.message}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
