import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../components/Header/head-image/Web-logo.png";
import { loginUser } from "../../api/authService";

function LoginPage({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(form.email, form.password);

      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      navigate("/");
    } catch (err) {
      if (err.response) {
        // Server responded with an error (e.g. wrong password, missing fields)
        setError(err.response.data?.msg || "Login failed. Please try again.");
      } else if (err.request) {
        // Request was made but no response (network/server down)
        setError(
          "Internet Error. Please check your internet connection or try again later."
        );
      } else {
        // Other unexpected errors
        setError("An unexpected error occurred. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg"></div>

      <div className="login-card">
        <img src={logo} alt="K-Store Logo" className="login-logo" />
        <h1 className="login-title">Welcome Back!</h1>
        <p className="login-subtitle">Sign in to your K-Store account</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? <span className="spinner"></span> : "Login"}
          </button>

          {error && <p className="error">{error}</p>}
          <p className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
          <div className="login-links">
            <p>
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </p>
            <p>
              Are you a vendor? <Link to="/vendor-signup">Click here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
