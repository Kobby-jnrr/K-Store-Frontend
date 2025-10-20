import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUpForm.css";
import logo from "../components/Header/head-image/Web-logo.png";
import { registerUser } from "../../api/authService";

function SignUpCustomer({ setUser }) {
  const navigate = useNavigate();

  const uccLocations = [
    "Amamoma - Sterner Hostel",
    "Amamoma - Peace Hostel",
    "Amamoma - Top Hostel",
    "Amamoma - Victory Hostel",
    "Amamoma - Edi Bee Hostel",
    "Amamoma - B & C Plaza",
    "Amamoma - Prestige Hostel",
    "Amamoma - Honny Cole Hostel",
    "Amamoma - Pink Hostel",
    "Amamoma - Wintage Hostel",
    "Amamoma - Danicom Hostel",
    "Amamoma - Betric Hostel",
    "Amamoma - Florence Hostel",
    "Amamoma - Smithwaa Hostel",
    "Amamoma - Exousia Hostel",
    "Amamoma - Jonel Hostel",
    "Amamoma - Salvation Hostel",
    "Amamoma - White Hostel",
    "Amamoma - Ellis Hostel",
    "Amamoma - Oceana Hostel",
    "Amamoma - Kwesipra Hostel",


    "Ayensu - First Love Hostel",
    "Ayensu - Adoration Home Hostel",
    "Ayensu - Success City Hostel",
    "Ayensu - Aseda Hostel",
    "Ayensu - Saabahawk Hostel",
    "Ayensu - The Rock Hostel",
    "Ayensu - Round Palace Hostel",

    "Old Site - ATL",
    "Old Site - Oguaa Hall",
    "Old Site - Adehye Hall",

    "New Site - KNH",
    "New Site - Valco Hall",
    "New Site - Casford Hall",

    "UCC Campus - SRC Hall",
    "UCC Campus - Superannuation Hall",
    "UCC Campus - PSI",
    "UCC Campus - Alumni",
    "UCC Campus - Valco Trust Hall",
    "UCC Campus - SSNIT",

    "Science - Jesus Lives",
    "Science - Oye Inn",
    "Science - Wishes Hostel",
    "Science - WTC Hostel",
    "Science - Jopak Hostel",
    "Science - Shalom Tent Hostel",

    "Kwaprow - Sammy Otoo",
    "Kwaprow - Ananse Webb Hostel",
    "Kwaprow - Nest Hostel",

    "School Bus Rd. - Baduwa Hostel",
    "School Bus Rd. - Executive Hostel",
    "School Bus Rd. - Jodok Hostel",
    "School Bus Rd. - Amerley Hostel",
    "School Bus Rd. - Maplins Court Hostel",
    "School Bus Rd. - True Excellence Hostel",

    "Apewosika - Golden Hostel",
    "Apewosika - Comfort Lodge",
    "Apewosika - Nyame Nti Hostel",
  ];

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmpassword: "",
    phone: "",
    location: "",
    role: "customer",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
        username: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone,
        location: form.location.trim(),
      };

      const data = await registerUser(userData);

      sessionStorage.setItem("token", data.accessToken);
      sessionStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.msg || err.message || "Signup failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter areas by typed value
  const filteredLocations = uccLocations.filter((loc) =>
    loc.toLowerCase().includes(form.location.toLowerCase())
  );

  const handleLocationSelect = (loc) => {
    setForm({ ...form, location: loc });
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      // Accept whatever the user typed
      e.preventDefault();
      setShowDropdown(false);
      setForm({ ...form, location: form.location.trim() });
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-bg"></div>

      <div className="signup-card">
        <img src={logo} alt="K-Store Logo" className="signup-logo" />
        <h1 className="signup-title">Customer Sign Up</h1>
        <p className="signup-subtitle">
          Create your customer account and start shopping today!
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-grid">
            <input
              type="text"
              name="firstName"
              placeholder="First Name*"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name*"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email*"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number*"
            value={form.phone}
            onChange={handleChange}
            required
          />

          {/* 🔍 Searchable input dropdown for location */}
          <div className="dropdown-container" ref={dropdownRef}>
            <input
            className="location-input"
              type="text"
              name="location"
              placeholder="Location - Hostel Name. Eg. Amamoma-A hostel"
              value={form.location}
              onChange={(e) => {
                setForm({ ...form, location: e.target.value });
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              required
            />
            {showDropdown && (
              <ul className="dropdown-list">
                {(form.location.trim() === "" ? uccLocations : filteredLocations)
                  .map((loc) => (
                    <li key={loc} onClick={() => handleLocationSelect(loc)}>
                      {loc}
                    </li>
                  ))}
                {/* If user typed something not found */}
                {form.location.trim() &&
                  filteredLocations.length === 0 && (
                    <li className="no-results">Press Enter to add "{form.location}"</li>
                  )}
              </ul>
            )}
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password* (At least 6 characters)"
            value={form.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmpassword"
            placeholder="Confirm Password*"
            value={form.confirmpassword}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading} className="signup-button">
            {loading ? <span className="spinner"></span> : "Create Account"}
          </button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="signup-links">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
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

export default SignUpCustomer;
