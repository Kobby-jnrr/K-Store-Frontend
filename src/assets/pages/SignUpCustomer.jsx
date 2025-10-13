import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUpForm.css";
import logo from "../components/Header/head-image/Web-logo.png";
import { registerUser } from "../../api/authService";

function SignUpCustomer({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "customer",
    phone: "",
    location: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

    if (!form.phone) {
      setError("Phone number is required!");
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        location: form.location || "",
      };

      const data = await registerUser(userData);

      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <img src={logo} alt="Logo" className="signup-logo-top" />

      <div className="signup-left">
        <img src={logo} alt="Logo" className="signup-logo" />
        <h1>Sign Up as Customer</h1>
        <p>Create your account and start shopping</p>
      </div>

      <div className="signup-right">
        <form className="signup-form" onSubmit={handleSubmit}>
          <input type="text" name="firstName" placeholder="First Name*" value={form.firstName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name*" value={form.lastName} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email*" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password*" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmpassword" placeholder="Confirm Password*" value={form.confirmpassword} onChange={handleChange} required />
          <input type="number" name="phone" placeholder="Phone Number*" value={form.phone} onChange={handleChange} required />
          <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} />

          <button type="submit" disabled={loading} className="signup-button">
            {loading ? <span className="spinner"></span> : "Create Account"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <p className="signup-text">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <p className="signup-text">
            Are you a vendor? <Link to="/vendor-signup">Click here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUpCustomer;
