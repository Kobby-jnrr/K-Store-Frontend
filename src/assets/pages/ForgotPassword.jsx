import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import API from "./../../api/axios";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setMessage("❌ Passwords do not match.");
    }

    try {
      const res = await API.post("/auth/reset-password", {
        email,
        newPassword,
      });
      setMessage(`✅ ${res.data.message}`);
    } catch (err) {
      if (err.response) {
        setMessage(
          `❌ ${err.response.data.message || "Reset failed. Try again."}`
        );
      } else if (err.request) {
        setMessage(
          "⚠️ Cannot connect to server. Please check your internet or try again later."
        );
      } else {
        setMessage("❗ Unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-container">
        <h2>Forgot Password 🔒</h2>
        <p>
          If you’ve forgotten your password, contact admin on WhatsApp first.
          After verification, you can reset it below.
        </p>

        <a
          href="https://wa.me/233204465537"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
        >
          <FaWhatsapp size={22} /> Contact Admin on WhatsApp
        </a>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Your account email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Set New Password</button>
        </form>

        {message && <p className="message">{message}</p>}

        <Link to="/login" className="back-to-login">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
