import React, { useState, useEffect, useRef } from "react";
import API from "../../../../api/axios";
import notificationIcon from "./notificationIcon.png";
import "./Notification.css";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const userIdStr = (user._id || user.id)?.toString();

  const fetchNotifications = async () => {
    if (!userIdStr) return;

    try {
      const { data } = await API.get("/notifications");
      const fetched = Array.isArray(data.notifications) ? data.notifications : [];
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
    const interval = setInterval(fetchNotifications, 600000);
    return () => clearInterval(interval);
  }, []);

  const togglePopup = async () => {
    setOpen(!open);
    if (!open) await markAllRead();
  };

  const markAllRead = async () => {
    if (!userIdStr) return;

    try {
      await API.put("/notifications/mark-read");
      setNotifications(prev =>
        prev.map(n => {
          const readBy = Array.isArray(n.readBy) ? n.readBy.map(id => id.toString()) : [];
          return { ...n, readBy: readBy.includes(userIdStr) ? readBy : [...readBy, userIdStr] };
        })
      );
      setUnreadCount(0);
    } catch {}
  };

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
