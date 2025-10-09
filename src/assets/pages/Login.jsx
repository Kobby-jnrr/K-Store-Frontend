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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(form.email, form.password);

      // Store in sessionStorage
      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
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
                {showPassword ? "👁️" : "👁️"}
              </span>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? <span className="spinner"></span> : "Login"}
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
