import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";
import logo from "../components/Header/head-image/Web-logo.png";
import { registerUser } from "../../api/authService";

function SignUp({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "customer",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (form.password !== form.confirmpassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: form.firstName + " " + form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
      };

      const data = await registerUser(userData);
      console.log("Signup response:", data);

      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.response?.data?.msg || err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="signup-bg"></div>

      <div className="signup-container">
        <div className="signup-left">
          <img src={logo} alt="Logo" className="signup-logo" />
          <h1>Welcome to K-Store!</h1>
          <p>Create your account and start shopping</p>
        </div>

        <div className="signup-right">
          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
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
            <input
              type="password"
              name="confirmpassword"
              placeholder="Confirm Password"
              value={form.confirmpassword}
              onChange={handleChange}
              required
            />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
            </select>

            <button type="submit" disabled={loading} className="signup-button">
              {loading ? (
                <span className="spinner"></span>
              ) : (
                "Create Account"
              )}
            </button>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <p className="signup-text">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}

export default SignUp;
