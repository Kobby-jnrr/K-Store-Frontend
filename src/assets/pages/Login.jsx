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

  // Update form state on input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(form.email, form.password);

      // Save token and user to localStorage
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update app-level state
      setUser(data.user);

      // Redirect to home page
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Invalid credentials. Please try again.");
    }

    setLoading(false);
  };

  return (
    <>
      <div className="login-bg"></div>

      <div className="login-container">
        <div className="login-left">
          <img src={logo} alt="Logo" className="login-logo" />
          <h1>Welcome Back!</h1>
          <p>Sign in to your K-Store account</p>
        </div>

        <div className="login-right">
          <img src={logo} alt="Logo" className="login-logo-top" />
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Logging In..." : "Login"}
            </button>

            {error && <p className="error">{error}</p>}

            <p className="signup-text">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
