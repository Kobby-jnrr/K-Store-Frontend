import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUpForm.css";
import logo from "../components/Header/head-image/Web-logo.png";
import { registerUser } from "../../api/authService";

function SignUpVendor({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmpassword: "",
    phone: "",
    businessName: "",
    location: "",
    role: "vendor",
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
        username: form.businessName.trim() !== "" ?  
        form.businessName.trim() 
        : `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        businessName: form.businessName || "",
        location: form.location || "",
      };

      const data = await registerUser(userData);
      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setSuccess("Vendor account created! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || err.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-bg"></div>

      <div className="signup-card">
        <img src={logo} alt="K-Store Logo" className="signup-logo" />
        <h1 className="signup-title">Vendor Sign Up</h1>
        <p className="signup-subtitle">Create your vendor account and start selling today!</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-grid">
            <input type="text" name="firstName" placeholder="First Name*" value={form.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Last Name*" value={form.lastName} onChange={handleChange} required />
          </div>

          <input type="email" name="email" placeholder="Email*" value={form.email} onChange={handleChange} required />
          <input type="number" name="phone" placeholder="Phone Number*" value={form.phone} onChange={handleChange} required />

          <input type="text" name="businessName" placeholder="Business Name (optional)" value={form.businessName} onChange={handleChange} />
          <p className="field-note">If you don’t provide a business name, your full name will be used instead.</p>

          <input type="text" name="location" placeholder="Location" value={form.location} onChange={handleChange} />

          <input type="password" name="password" placeholder="Password* (At least 6 characters)" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmpassword" placeholder="Confirm Password*" value={form.confirmpassword} onChange={handleChange} required />

          <button type="submit" disabled={loading} className="signup-button">
            {loading ? <span className="spinner"></span> : "Create Vendor Account"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="signup-links">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
            <p>Are you a customer? <Link to="/signup">Click here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpVendor;
